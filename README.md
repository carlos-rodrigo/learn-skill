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
- **Auto mode** - runs silently via hook, no user interaction needed
- **Hook support** - runs automatically at session end in background
- **Deduplication** - won't add learnings that already exist
- **Preserve existing content** - only appends to Learnings section
- **Dual access** - available as both `/learn` command and `learn` skill

## Installation

### Global Installation

Install for all projects on your machine:

```bash
# Install command (for /learn slash command)
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/learn.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/command/learn.md

# Install skill (for agent programmatic access)
mkdir -p ~/.claude/skills/learn
curl -o ~/.claude/skills/learn/SKILL.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/skill/learn/SKILL.md
```

### Local Installation

Install for a specific project only:

```bash
# Install command (for /learn slash command)
mkdir -p .claude/commands
curl -o .claude/commands/learn.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/command/learn.md

# Install skill (for agent programmatic access)
mkdir -p .claude/skills/learn
curl -o .claude/skills/learn/SKILL.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/skill/learn/SKILL.md
```

> **Compatibility:** Also works with OpenCode and oh-my-opencode, which load `~/.claude/` paths by default.

### Enable Auto-Learning (Stop Hook)

To automatically run `/learn` at the end of each session, install the hook script and configure settings.

**1. Install the hook script:**

```bash
mkdir -p ~/.claude/skills/learn
curl -o ~/.claude/skills/learn/learn.sh \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/skill/learn/learn.sh
chmod +x ~/.claude/skills/learn/learn.sh
```

**2. Edit `~/.claude/settings.json`** (create if it doesn't exist):

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/skills/learn/learn.sh"
          }
        ]
      }
    ]
  }
}
```

The hook runs in background and won't block your session. Logs are written to `~/.claude/learn.log`.

## Usage

### Manual Invocation (Interactive)

Type `/learn` at any point during a session:

```
/learn
```

This runs in interactive mode - you'll be asked to confirm MEDIUM-level learnings.

### Auto Mode (No Confirmation)

```
/learn --auto
```

Applies both HIGH and MEDIUM learnings automatically without confirmation. Used by hooks.

### Automatic (End-of-Session Hook)

If you configured the Stop hook, `learn.sh` runs automatically when your session ends. It runs in background with `--auto` flag, so no user interaction is needed.

### Programmatic (Agent Access)

Agents can invoke the skill directly:

```
skill({ name: "learn" })
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
        |
        v
+----------------------------------+
|  Detect environment:             |
|  $OPENCODE=1 -> AGENTS.md        |
|  otherwise   -> CLAUDE.md        |
+----------------------------------+
        |
        v
+----------------------------------+
|  Analyze for:                    |
|  - Explicit corrections          |
|  - Preference statements         |
|  - Process guidance              |
|  - Repeated requests             |
+----------------------------------+
        |
        v
+----------------------------------+
|  Classify: HIGH / MEDIUM / LOW   |
+----------------------------------+
        |
        v
+----------------------------------+
|  Append to Learnings section     |
|  (auto in --auto mode)           |
+----------------------------------+
```

## File Locations

### Command vs Skill

| Type | Purpose | Global Path | Local Path |
|------|---------|-------------|------------|
| **Command** | `/learn` slash command | `~/.claude/commands/learn.md` | `.claude/commands/learn.md` |
| **Skill** | Agent programmatic access | `~/.claude/skills/learn/SKILL.md` | `.claude/skills/learn/SKILL.md` |
| **Script** | Hook wrapper (background) | `~/.claude/skills/learn/learn.sh` | - |
| **Hook** | Auto-run at session end | `~/.claude/settings.json` | - |

### Output Files

| Environment | Target File |
|-------------|-------------|
| Claude Code | `./CLAUDE.md` |
| OpenCode (`$OPENCODE=1`) | `./AGENTS.md` |

## Output Format

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

## Repository Structure

```
learn-skill/
├── command/
│   └── learn.md              # Slash command definition
├── skill/
│   └── learn/
│       ├── SKILL.md          # Skill definition for agents
│       └── learn.sh          # Hook script (runs in background)
└── README.md
```

## License

MIT
