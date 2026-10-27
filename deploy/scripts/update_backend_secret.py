"""Merge selected private settings into the existing Secret without replacing DB/Redis.

Run on ourproject with kubectl and the current kubeconfig. Default is preview only.
Never prints property values or the Secret. Source is an operator-uploaded private file.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from datetime import datetime, timezone


SYNC_KEYS = {
    "kakao.client-id", "kakao.client-secret",
    "spring.mail.host", "spring.mail.port", "spring.mail.username",
    "spring.mail.password", "spring.mail.default-encoding",
    "spring.mail.properties.mail.smtp.auth",
    "spring.mail.properties.mail.smtp.ssl.enable",
    "spring.mail.properties.mail.smtp.starttls.enable",
    "mail.from.address", "quiz.ai.token",
}
REQUIRED_KEYS = {
    "spring.datasource.username", "spring.datasource.password",
    "spring.data.redis.password", "kakao.client-id", "kakao.client-secret",
    "spring.mail.username", "spring.mail.password", "mail.from.address",
    "quiz.ai.token",
}
ENTRY = re.compile(r"^\s*([^#!\s:=]+)\s*[:=]\s*(.*)$")


def read_entries(text):
    entries = {}
    for line in text.splitlines():
        match = ENTRY.match(line)
        if not match:
            continue
        key, value = match.groups()
        if key not in SYNC_KEYS | REQUIRED_KEYS:
            continue
        # Fail explicitly rather than corrupting Java Properties continuations.
        if (len(value) - len(value.rstrip("\\"))) % 2:
            raise ValueError(f"Multiline property unsupported: {key}")
        if key in entries:
            raise ValueError(f"Duplicate property: {key}")
        entries[key] = value
    return entries


def merge_properties(current, source):
    incoming = read_entries(source)
    old = read_entries(current)
    updates = {key: value for key, value in incoming.items() if key in SYNC_KEYS}
    empty = sorted(key for key, value in updates.items() if not value.strip())
    if empty:
        raise ValueError("Empty source settings: " + ", ".join(empty))
    # Updates win for selected keys. DB/Redis and unknown server keys always survive.
    merged_values = old | updates
    missing = sorted(key for key in REQUIRED_KEYS if not merged_values.get(key, "").strip())
    if missing:
        raise ValueError("Missing required settings: " + ", ".join(missing))
    changed = sorted(key for key, value in updates.items() if old.get(key) != value)
    lines = []
    for line in current.splitlines():
        match = ENTRY.match(line)
        if match and match.group(1) in updates:
            continue
        lines.append(line)
    lines.extend(f"{key}={updates[key]}" for key in sorted(updates))
    return "\n".join(lines) + "\n", changed


def kubectl(args, payload=None):
    result = subprocess.run(
        ["kubectl", "-n", "default", *args], input=payload,
        text=True, capture_output=True, check=False,
    )
    if result.returncode:
        # kubectl errors can embed supplied Secret data. Do not echo them.
        raise RuntimeError("kubectl failed; check access/context. Secret details suppressed.")
    return result.stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--apply", action="store_true", help="Apply; default only previews key names")
    args = parser.parse_args()
    os.umask(0o077)
    os.environ.setdefault("KUBECONFIG", "/home/ubuntu/.kube/config")
    secret = json.loads(kubectl(["get", "secret", "tuddybuddy-backend", "-o", "json"]))
    encoded = secret["data"]["application.properties"]
    current = base64.b64decode(encoded, validate=True).decode("utf-8-sig")
    updated, changed = merge_properties(current, args.source.read_text(encoding="utf-8-sig"))
    print("Changed keys: " + (", ".join(changed) or "none"))
    print("DB/Redis credentials, JWT settings and other server-only keys are preserved.")
    if not args.apply:
        print("Preview only. Add --apply to save a protected backup and update the Secret.")
        return
    if not changed:
        print("No update needed.")
        return
    backup_dir = Path.home() / ".config/tuddybuddy/secret-backups"
    backup_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
    backup_dir.chmod(0o700)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    backup = backup_dir / f"backend-{stamp}.json"
    with backup.open("x", encoding="utf-8") as stream:
        json.dump(secret, stream)
    backup.chmod(0o600)
    # Optimistic concurrency: do not overwrite a Secret changed after our read.
    patch = [
        {"op": "test", "path": "/metadata/resourceVersion", "value": secret["metadata"]["resourceVersion"]},
        {"op": "replace", "path": "/data/application.properties",
         "value": base64.b64encode(updated.encode("utf-8")).decode("ascii")},
    ]
    kubectl(["patch", "secret", "tuddybuddy-backend", "--type=json", "--patch-file=/dev/stdin"], json.dumps(patch))
    print("Secret updated. Protected backup: " + str(backup))
    print("Restart backend after the deployment environment changes are applied.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, RuntimeError):
        # Do not include exception text: decoding and file errors may contain secrets.
        print("Configuration update stopped. Check file format, required key names and kubectl access. No values printed.", file=sys.stderr)
        sys.exit(1)
