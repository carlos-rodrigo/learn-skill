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
- **Dual access** - available as both `/learn` command and `learn` skill

## Installation

### Quick Install (oh-my-opencode / OpenCode)

```bash
# Install command (for /learn slash command)
mkdir -p ~/.config/opencode/command
curl -o ~/.config/opencode/command/learn.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/command/learn.md

# Install skill (for agent programmatic access)
mkdir -p ~/.config/opencode/skill/learn
curl -o ~/.config/opencode/skill/learn/SKILL.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/skill/learn/SKILL.md
```

### Claude Code Compatible Install

```bash
# Install command
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/learn.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/command/learn.md

# Install skill
mkdir -p ~/.claude/skills/learn
curl -o ~/.claude/skills/learn/SKILL.md \
  https://raw.githubusercontent.com/carlos-rodrigo/learn-skill/main/skill/learn/SKILL.md
```

### Enable Auto-Learning (Stop Hook)

To automatically run `/learn` at the end of each session, add the Stop hook to your settings.

**Edit `~/.claude/settings.json`** (create if it doesn't exist):

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "/learn"
          }
        ]
      }
    ]
  }
}
```

Or merge with existing settings if you already have hooks configured.

## Usage

### Manual Invocation

Type `/learn` at any point during a session:

```
/learn
```

### Automatic (End-of-Session Hook)

If you configured the Stop hook, `/learn` runs automatically when your session ends.

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
|  (with confirmation if MEDIUM)   |
+----------------------------------+
```

## File Locations

### Command vs Skill

| Type | Purpose | OpenCode Path | Claude Code Path |
|------|---------|---------------|------------------|
| **Command** | `/learn` slash command | `~/.config/opencode/command/learn.md` | `~/.claude/commands/learn.md` |
| **Skill** | Agent programmatic access | `~/.config/opencode/skill/learn/SKILL.md` | `~/.claude/skills/learn/SKILL.md` |
| **Hook** | Auto-run at session end | `~/.claude/settings.json` | `~/.claude/settings.json` |

### Output Files

| Environment | Target File |
|-------------|-------------|
| OpenCode | `./AGENTS.md` |
| Claude Code | `./CLAUDE.md` |

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
│       └── SKILL.md          # Skill definition for agents
├── settings.example.json     # Example Stop hook configuration
└── README.md
```

## License

MIT
