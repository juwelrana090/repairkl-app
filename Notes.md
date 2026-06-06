# husky

```bash
npx husky install
sudo chmod +x .husky/*


git update-index --chmod=+x .husky/pre-commit
Get-ChildItem .husky | ForEach-Object { $_.Attributes += 'ReadOnly' }

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-claude.ps1


Open Claude Code and run these two commands:

  1. /r-memory scan    ← scans codebase, builds memory (1-3 min)
  2. /r-cache warm     ← compiles skills/ cache from memory

  Then commit: git add .claude/ CLAUDE.md && git push

Daily workflow:
  /r-start  → load session
  /r-todo   → see / add / pick tasks
  /r-task   → do the work
  /r-done   → finish + auto review
  /r-end    → end of day


```
