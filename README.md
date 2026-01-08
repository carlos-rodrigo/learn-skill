# /learn - Session Feedback Learning Skill

A skill that automatically extracts learnings from your coding sessions and persists them for future reference.

## What It Does

During coding sessions, you give feedback to your AI agent: corrections, preferences, process guidance. This skill captures that feedback, classifies it by importance, and writes it to the file your agent automatically loads.

**The agent learns from your corrections and doesn't repeat the same mistakes.**

## Environment Detection

The skill detects which tool you're using and writes to the appropriate file:

| Environment | Detection | Target File |
|-------------|-----------|-------------|
| **OpenCode** | `$OPENCODE=1` | `AGENTS.md` |
| **Claude Code** | `$OPENCODE` not set | `CLAUDE.md` |

Both files are automatically loaded by their respective agents at session start, so learnings are always in context.

## Features

- **Automatic feedback extraction** from session conversations
- **Smart classification** into HIGH/MEDIUM/LOW priority levels
- **Environment-aware** - writes to the right file for your tool
- **Automatic loading** - learnings are in files agents read by default
- **Hook support** - can run automatically at session end
- **Deduplication** - won't add learnings that already exist
- **Preserve existing content** - only appends to Learnings section

## Installation

### Quick Install

```bash
# Create commands directory if it doesn't exist
mkdir -p ~/.config/opencode/command

# Download the skill
curl -o ~/.config/opencode/command/learn.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/learn.md
```

### Manual Install

Copy `learn.md` to `~/.config/opencode/command/learn.md`

## Usage

### Manual Invocation

Type `/learn` at any point during a session:

```
/learn
```

### Automatic (End-of-Session Hook)

Add to your `oh-my-opencode.json`:

```json
{
  "hooks": {
    "Stop": ["/learn"]
  }
}
```

## How It Works

### Feedback Classification

| Level | What Gets Captured | Examples |
|-------|-------------------|----------|
| **HIGH** | Process/workflow rules, repeated corrections | "Always run tests first", "Use TDD", "Never commit without verification" |
| **MEDIUM** | Style preferences, architecture patterns | "No comments in code", "Follow existing UX patterns" |
| **LOW** | One-time fixes (NOT saved) | "Fix this typo", "Use blue here" |

### Data Flow

```
Session Conversation
        │
        ▼
┌─────────────────────────────────┐
│  Detect environment:            │
│  $OPENCODE=1 → AGENTS.md        │
│  otherwise   → CLAUDE.md        │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Analyze for:                   │
│  - Explicit corrections         │
│  - Preference statements        │
│  - Process guidance             │
│  - Repeated requests            │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Classify: HIGH / MEDIUM / LOW  │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Append to Learnings section    │
│  (with confirmation if MEDIUM)  │
└─────────────────────────────────┘
```

## File Format

### AGENTS.md (OpenCode)

```markdown
# Agent Guidelines

## Learnings

<!-- Auto-captured from sessions by /learn -->
- [PROCESS] Always run tests before committing
- [ARCHITECTURE] Use repository pattern for data access
- [CODE_STYLE] No comments unless explaining complex algorithms
```

### CLAUDE.md (Claude Code)

```markdown
# Project Context

## Learnings

<!-- Auto-captured from sessions by /learn -->
- [PROCESS] Always run tests before committing
- [CODE_STYLE] No comments in code unless explaining complex algorithms
```

## Categories

Learnings are tagged with categories:

- `PROCESS` - Workflow and methodology
- `CODE_STYLE` - Code formatting, comments, naming
- `ARCHITECTURE` - Design patterns, structure
- `UI_UX` - Frontend patterns, design system
- `TESTING` - Test strategy, verification
- `TOOLING` - Tool usage, commands

## License

MIT
