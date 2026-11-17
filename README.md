# Printify Frontend Migration (Admin + Staff)

Source: `Printify_Main(final)(5).zip` (uploaded by owner)
Destination: `christianvic31-dot/Printify`, branch `main`, directory `Frontend/`.

This package contains the full 97-file UI source from the latest provided ZIP, plus 2 compatibility assets:
- `Frontend/css/forgot-password.css` mirrors `forget-password.css` (used by `forgot-password.html`).
- `Frontend/image/darkmode_icon.png` mirrors `nightmode_icon.png` (used by orders and staff orders JavaScript).

**Preserved from GitHub**: `Frontend/login.html`, `Frontend/js/login.js`, `Frontend/css/style.css` to respect the earlier request not to change login. All remaining source files are copied. Backend and hosting configuration stay unchanged. Existing files not in the ZIP are retained.

## Upload to GitHub (Windows)

1. Extract this ZIP.
2. Make sure Git for Windows is installed and GitHub account can push to `christianvic31-dot/Printify`.
3. Double-click `APPLY_TO_GITHUB.bat`.
4. When prompted, type `YES` to commit and push the UI to the `main` branch.

The PowerShell script clones the repo into `Printify` alongside the extracted package, checks for uncommitted changes, makes a zip backup, copies UI files, skips login files, and commits/pushes only `Frontend/`. The login and backend are not modified.

## Validation

- Node.js syntax check passed for all 25 source JS files.
- HTML static references were checked (see VALIDATION.json).
- Live UI/API calls, Render build, and PostgreSQL interactions **not** verified. Test before production.

If you want to inspect changes before pushing, choose `NO` at the confirmation prompt and run `git diff` in the cloned `Printify` directory.
