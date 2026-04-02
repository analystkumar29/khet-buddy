@AGENTS.md

# Supabase & Vercel Safety Rules

## CRITICAL: Always verify project ownership before any external service operation

### Supabase MCP
- **NEVER** blindly use credentials from `.mcp.json` — they may belong to a different account/project.
- Before ANY Supabase MCP call (create project, apply migration, execute SQL, deploy edge function, etc.), **confirm with the user**:
  1. Which Supabase account/email this project belongs to (KhetBuddy = `damyantikarwasra@gmail.com`)
  2. That the project ref and token in `.mcp.json` match the correct account
  3. Get explicit user approval before proceeding
- If credentials look wrong or belong to another project, STOP and ask the user to provide correct credentials.

### Vercel CLI / MCP
- Before ANY Vercel deployment or project operation, **confirm with the user**:
  1. Which Vercel account/team this project belongs to
  2. That you are deploying the correct project (KhetBuddy)
  3. Get explicit user approval before proceeding
- Never assume Vercel credentials are correct without verification.

### General Rule
When in doubt, ASK. A wrong deployment to the wrong account is far worse than a 30-second confirmation pause.
