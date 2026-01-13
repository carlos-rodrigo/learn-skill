---
name: learn
description: Extract learnings from session feedback and update AGENTS.md or CLAUDE.md. Should I write to the project file (default) or the global file?
---

# Learn Skill

Analyze the current session conversation, extract user feedback and corrections, classify them by impact level, and persist valuable learnings to the appropriate file based on the environment.

## Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Interactive** | `/learn` | Confirm MEDIUM learnings before applying |

## When to Use This Skill

- At the end of a session to capture learnings
- When the user explicitly asks to save learnings
- For session-end automation, use `learn-hook.js` to parse transcripts

## Workflow

### Step 1: Detect Environment

Check environment variable to determine target file:

| Environment | Detection | Target File |
|-------------|-----------|-------------|
| **OpenCode** | `$OPENCODE=1` | `AGENTS.md` |
| **Claude Code** | `$OPENCODE` not set | `CLAUDE.md` |

Both files are automatically loaded by their respective agents at session start.

### Step 2: Read Current Session

Use `session_read` to get the full conversation history of the current session.

```
session_read(session_id=current, include_todos=true)
```

### Step 3: Read Existing Context

Read these files to understand current guidelines (if they exist):
- `./AGENTS.md` - Project-specific agent guidelines
- `./CLAUDE.md` - Project-specific context
- `~/.claude/CLAUDE.md` - Global user preferences (read-only, for context)

### Step 4: Analyze for Feedback Patterns

Scan the conversation for:

1. **Explicit corrections**: "No, don't do X", "Always do Y first", "Stop adding comments"
2. **Preference statements**: "I prefer X", "We use Y pattern here", "Follow the existing Z"
3. **Process guidance**: "Run tests before coding", "Check the design system first"
4. **Repeated requests**: Same feedback given multiple times indicates importance
5. **Style corrections**: "Remove these comments", "Match the existing component style"

### Step 5: Classify Feedback

| Level | Criteria | Examples | Persistence |
|-------|----------|----------|-------------|
| **HIGH** | Process/workflow changes, repeated corrections, explicit rules | "Always run tests first", "Never commit without verification", "Use TDD" | Always persist |
| **MEDIUM** | Style/consistency preferences, architecture patterns | "No comments in code", "Follow existing UX patterns", "Maintain component structure" | Persist with confirmation |
| **LOW** | One-time tactical fixes, context-specific corrections | "Fix this typo", "Use hippo color here", "Align this button" | Do NOT persist (too specific) |

### Step 6: Format Learnings

Organize learnings by category as section headers with bullet points:

```markdown
## Learnings

### PROCESS
- Always run tests before committing
- Use TDD workflow

### CODE_STYLE
- No comments unless explaining complex algorithms
- Use descriptive variable names

### ARCHITECTURE
- Use repository pattern for data access
- Maintain component structure

### UI_UX
- Follow existing UX patterns
- Use design system components

### TESTING
- Verify with lsp_diagnostics after edits
- Run tests before marking tasks complete

### TOOLING
- Run specific build commands
- Use background tasks for parallel execution
```

Categories:
- `PROCESS` - Workflow and methodology
- `CODE_STYLE` - Code formatting, comments, naming
- `ARCHITECTURE` - Design patterns, structure
- `UI_UX` - Frontend patterns, design system
- `TESTING` - Test strategy, verification
- `TOOLING` - Tool usage, commands

### Step 7: Check for Duplicates

Before adding a learning:
1. Read the target file (AGENTS.md or CLAUDE.md based on environment)
2. Check if a similar learning already exists
3. If duplicate: Skip or update existing entry
4. If new: Append to the Learnings section

### Step 8: Apply Learnings

**Interactive mode:**
- HIGH learnings: Apply automatically
- MEDIUM learnings: Show proposed additions and ask "Apply these learnings? (y/n)"

### Step 9: Update Target File

#### For OpenCode (AGENTS.md)

If the file doesn't exist, create it with:

```markdown
# Agent Guidelines

## Learnings

<!-- Auto-captured from sessions by /learn -->
```

If it exists but has no Learnings section, append the section.

Then append new learnings organized by category under the Learnings section, creating new category subsections as needed.

#### For Claude Code (CLAUDE.md)

If the file doesn't exist, create it with:

```markdown
# Project Context

## Learnings

<!-- Auto-captured from sessions by /learn -->
```

If it exists but has no Learnings section, append the section.

Then append new learnings under the Learnings section.

### Step 10: Report Summary

Output a brief summary:
- Environment detected (OpenCode or Claude Code)
- Number of learnings captured (by level)
- File updated (AGENTS.md or CLAUDE.md)
- Any skipped duplicates

## Rules

1. **Never persist LOW level feedback** - too context-specific
2. **Always persist HIGH level feedback** - important process rules
3. **Deduplicate** - don't add learnings that already exist
4. **Be concise** - learnings should be actionable bullet points, not paragraphs
5. **Create sections if missing** - add Learnings section to existing files
6. **Preserve existing content** - never overwrite, only append to Learnings section
7. **Never modify ~/.claude/CLAUDE.md** - global file is read-only
8. **Respect environment** - OpenCode -> AGENTS.md, Claude Code -> CLAUDE.md
