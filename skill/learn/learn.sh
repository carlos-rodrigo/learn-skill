#!/bin/bash
LOG_FILE="${HOME}/.claude/learn.log"

{
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running /learn..." >> "$LOG_FILE"
    claude -p '/learn --auto' 2>&1 | head -50 >> "$LOG_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] /learn completed" >> "$LOG_FILE"
} &

exit 0
