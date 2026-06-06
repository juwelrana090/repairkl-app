> ⚠️ PROJECT SCOPED: Shifty App

1. Read .claude/tasks/inprogress/
2. Mark task complete (update status + Completed By + Date)
3. Move: inprogress/ → done/
4. Auto quality review:
   - Rules followed? (check against skills/_base.md)
   - Patterns used correctly?
   - Error handling in place?
   - No passwordHash exposed?
   - Params awaited in Next.js 15?
5. Report: ✅/❌ per check
6. Log: .claude/tasks/logs/YYYY-MM-DD-[title].md
7. Suggest git commit message
8. Remind: git add .claude/ && git push
