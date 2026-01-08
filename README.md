# /learn - Session Feedback Learning Skill for OpenCode

A skill for [OpenCode](https://opencode.ai) that automatically extracts learnings from your coding sessions and persists them to CLAUDE.md and AGENTS.md for automatic loading.

## What It Does

During coding sessions, you give feedback to your AI agent: corrections, preferences, process guidance. This skill captures that feedback, classifies it by importance, and writes it directly to **CLAUDE.md** and **AGENTS.md** - the files that Claude automatically reads at session start.

**The agent learns from your corrections and doesn't repeat the same mistakes.**

## Features

- **Automatic feedback extraction** from session conversations
- **Smart classification** into HIGH/MEDIUM/LOW priority levels
- **Smart routing** - process/architecture to AGENTS.md, style/tooling to CLAUDE.md
- **Automatic loading** - learnings are in files Claude reads by default
- **Hook support** - can run automatically at session end
- **Deduplication** - won't add learnings that already exist
- **Preserve existing content** - only appends to Learnings section

## Installation

### Quick Install

Copy the skill file to your OpenCode commands directory:

```bash
# Create commands directory if it doesn't exist
mkdir -p ~/.config/opencode/command

# Download the skill
curl -o ~/.config/opencode/command/learn.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/learn.md
```

### Manual Install

1. Copy `learn.md` to `~/.config/opencode/command/learn.md`

## Usage

### Manual Invocation

Type `/learn` at any point during a session to extract and save learnings:

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

Or create `.opencode/hooks/Stop.md` in your project:

```markdown
Run /learn to capture session feedback before closing.
```

## How It Works

### Feedback Classification

| Level | What Gets Captured | Examples |
|-------|-------------------|----------|
| **HIGH** | Process/workflow rules, repeated corrections | "Always run tests first", "Use TDD", "Never commit without verification" |
| **MEDIUM** | Style preferences, architecture patterns | "No comments in code", "Follow existing UX patterns" |
| **LOW** | One-time fixes (NOT saved) | "Fix this typo", "Use blue here" |

### Smart Routing

Learnings are routed to the appropriate file:

| Category | Target File | Examples |
|----------|-------------|----------|
| `PROCESS` | AGENTS.md | "Always run tests before committing" |
| `ARCHITECTURE` | AGENTS.md | "Use repository pattern for data access" |
| `TESTING` | AGENTS.md | "Write integration tests for API endpoints" |
| `CODE_STYLE` | CLAUDE.md | "No comments in production code" |
| `UI_UX` | CLAUDE.md | "Follow the design system for all components" |
| `TOOLING` | CLAUDE.md | "Use pnpm instead of npm" |

### Data Flow

```
Session Conversation
        │
        ▼
┌─────────────────────────────────┐
│  Read existing context:         │
│  - AGENTS.md                    │
│  - CLAUDE.md                    │
│  - ~/.claude/CLAUDE.md          │
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
│  Route: AGENTS.md or CLAUDE.md  │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│  Append to Learnings section    │
│  (with confirmation if MEDIUM)  │
└─────────────────────────────────┘
```

## File Format

### CLAUDE.md with Learnings

```markdown
# Project Context

- Use pnpm instead of npm
- Do not run dev server

## Learnings

<!-- Auto-captured from sessions by /learn -->
- [CODE_STYLE] No comments in code unless explaining complex algorithms
- [UI_UX] Follow the design system in DESIGN_SYSTEM.md for all UI components
- [TOOLING] Run `pnpm typecheck` before committing TypeScript changes
```

### AGENTS.md with Learnings

```markdown
# Agent Guidelines

## Learnings

<!-- Auto-captured from sessions by /learn -->
- [PROCESS] Always run tests before committing
- [ARCHITECTURE] Use repository pattern for data access
- [TESTING] Write integration tests for API endpoints, unit tests for utilities
```

## Categories

Learnings are organized into categories:

- `PROCESS` - Workflow and methodology → AGENTS.md
- `ARCHITECTURE` - Design patterns, structure → AGENTS.md
- `TESTING` - Test strategy, verification → AGENTS.md
- `CODE_STYLE` - Code formatting, comments, naming → CLAUDE.md
- `UI_UX` - Frontend patterns, design system → CLAUDE.md
- `TOOLING` - Tool usage, commands → CLAUDE.md

## Why CLAUDE.md and AGENTS.md?

Previous versions wrote to a separate `LEARNINGS.md` file, but:
- Agents don't automatically read LEARNINGS.md
- CLAUDE.md and AGENTS.md are automatically loaded by Claude
- This ensures learnings are always part of the agent's context

## Migration from LEARNINGS.md

If you have an existing `LEARNINGS.md` file:
1. Review the learnings in that file
2. Manually copy relevant ones to CLAUDE.md or AGENTS.md
3. Delete or archive the LEARNINGS.md file

## Requirements

- [OpenCode](https://opencode.ai) v1.0.150+
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) (recommended for hook support)

## License

MIT
