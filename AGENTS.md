# TuddyBuddy coding guide

## Project map

- `front/`: React 19, TypeScript 4, Create React App. UI features live under `front/src/cont/`; shared routing, auth, layout, and notification code has its own directories.
- `back/`: Java 25, Spring Boot 4, Spring Security, MyBatis, Redis, and Oracle JDBC. Feature packages live under `back/src/main/java/kr/co/ictedu/back/`; SQL mappings are in `back/src/main/resources/mappers/`.
- `plsql/`: Oracle PL/SQL scripts and database-side artifacts.
- Frontend and backend are separate build projects. Use their local package/build configuration rather than assuming a root build.

## Team workflow

- Delegate only independent work. Route React/UI and browser-state work to `frontend`; Spring endpoints, services, security, and Java work to `backend`; mapper XML, Oracle SQL, and schema-impact analysis to `data_layer`; use `integration_reviewer` for read-only cross-layer reviews.
- For changes spanning layers, have specialists report contracts and file ownership before parallel edits. Avoid assigning overlapping files to multiple agents; the coordinator owns integration and final decisions.
- Preserve existing user changes. Inspect `git status` before editing and do not revert, overwrite, or reformat unrelated work.
- Keep changes narrow and follow nearby naming, API, DTO, mapper, and CSS conventions. Do not invent API or database contracts; trace callers and mapper statements.
- Do not run tests or builds unless the user asks for verification. If asked, choose the narrowest relevant command and report its result.
- Never include secrets, credentials, or personal data in source, logs, or agent reports.
