"""Export only allowed mail/Kakao/AI settings, not DB or Redis credentials."""
import argparse
import os
from pathlib import Path

from update_backend_secret import SYNC_KEYS, read_entries


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    os.umask(0o077)
    entries = read_entries(args.source.read_text(encoding="utf-8-sig"))
    selected = {key: value for key, value in entries.items() if key in SYNC_KEYS}
    if not selected or any(not value.strip() for value in selected.values()):
        raise SystemExit("No settings or empty settings. Export stopped.")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive create prevents accidentally overwriting an operator-maintained file.
    with args.output.open("x", encoding="utf-8", newline="\n") as stream:
        stream.writelines(f"{key}={selected[key]}\n" for key in sorted(selected))
    args.output.chmod(0o600)
    print("Settings file created. Values suppressed; keep private and upload using SFTP.")


if __name__ == "__main__":
    main()
