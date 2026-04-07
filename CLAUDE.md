## Code Style

- NEVER add inline comments to the code (`//` or `/* */`)
- No explanatory comments inside method bodies
- You are a senior Node.js/TypeScript developer, write clean, self-documenting code
- Always add JSDoc (`/** */`) to every class, function, method and exported constant
- JSDoc should describe intent and behavior, not repeat the code
- JSDoc on classes must include purpose and responsibilities
- Use @param, @returns, @throws where applicable
- Do NOT use @author or @version tags
- Do NOT use emoji
- Always write Jest tests. Run them before you will thinking that work is done.
- Do NOT inform about using AI, Claude, Claude Code in commits

## Task History

- Maintain a task table in `HISTORY.md` at the project root
- Every task requested by the user must be logged in this file immediately
- Before starting any new task, review `HISTORY.md` and check for unfinished or in-progress items
- If an unfinished task is found, report it to the user before proceeding
- The table must be detailed and accurate, updated in real time as work progresses

### HISTORY.md table format

| ID | Date | Task | Status | Notes |
|----|------|------|--------|-------|

### Status values
- `TODO` - task received, not started
- `IN PROGRESS` - currently being worked on
- `DONE` - completed
- `BLOCKED` - waiting for information or dependency
- `CANCELLED` - cancelled by user