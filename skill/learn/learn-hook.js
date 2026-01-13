#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const MAX_TRANSCRIPT_LINES = 200

const HIGH_KEYWORDS = /(\balways\b|\bnever\b|\bmust\b|\bmust not\b|\bdo not\b|\bdon't\b|\bstop\b|\bavoid\b)/i
const MEDIUM_KEYWORDS = /(\bprefer\b|\bplease\b|\bshould\b|\buse\b|\bfollow\b|\bkeep\b|\bmake sure\b|\bensure\b)/i

const CATEGORY_RULES = [
  { name: "TESTING", pattern: /(\btest\b|\btests\b|\btesting\b|\blint\b|\btypecheck\b|\blsp_diagnostics\b|\bbuild\b)/i },
  { name: "TOOLING", pattern: /(\bgit\b|\bcommand\b|\bterminal\b|\bbash\b|\bshell\b|\bcli\b|\btool\b|\bscript\b)/i },
  { name: "UI_UX", pattern: /(\bui\b|\bux\b|\blayout\b|\bcss\b|\bcolor\b|\bspacing\b|\bfont\b|\bbutton\b|\bcomponent\b|\bdesign system\b)/i },
  { name: "CODE_STYLE", pattern: /(\bcomment\b|\bformat\b|\bformatting\b|\bnaming\b|\bvariable\b|\bstyle\b|\bindent\b|\bwhitespace\b|\bcamel\b|\bsnake\b)/i },
  { name: "ARCHITECTURE", pattern: /(\barchitecture\b|\bpattern\b|\blayer\b|\bmodule\b|\bservice\b|\brepository\b|\bdesign\b|\bstructure\b)/i },
]

function readStdin() {
  return new Promise((resolve) => {
    let data = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk) => {
      data += chunk
    })
    process.stdin.on("end", () => resolve(data))
  })
}

function safeJsonParse(input) {
  try {
    return JSON.parse(input)
  } catch {
    return null
  }
}

function extractContent(content) {
  if (!content) {
    return []
  }
  if (typeof content === "string") {
    return [content]
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item.text === "string") return item.text
        if (item && typeof item.content === "string") return item.content
        return null
      })
      .filter(Boolean)
  }
  if (typeof content.text === "string") {
    return [content.text]
  }
  return []
}

function extractUserMessages(lines) {
  const messages = []
  for (const line of lines) {
    const entry = safeJsonParse(line)
    if (!entry) continue

    const message = entry.message ?? entry
    const role =
      message.role ??
      message.author?.role ??
      message.sender ??
      message.type ??
      message.source

    if (!role) continue
    if (String(role).toLowerCase() !== "user" && String(role).toLowerCase() !== "human") {
      continue
    }

    const contents = extractContent(message.content ?? message.text ?? message.body)
    if (contents.length === 0) continue
    messages.push(contents.join("\n"))
  }
  return messages
}

function classifyStatement(statement) {
  if (HIGH_KEYWORDS.test(statement)) return "HIGH"
  if (MEDIUM_KEYWORDS.test(statement)) return "MEDIUM"
  return "LOW"
}

function categorizeStatement(statement) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(statement)) return rule.name
  }
  return "PROCESS"
}

function buildLearnings(statements, existingContent) {
  const existingLower = existingContent.toLowerCase()
  const buckets = new Map()

  for (const statement of statements) {
    const normalized = statement.trim()
    if (!normalized || normalized.length < 8) continue
    if (/\?$/.test(normalized)) continue

    const level = classifyStatement(normalized)
    if (level === "LOW") continue

    const key = normalized.toLowerCase()
    if (existingLower.includes(key)) continue

    const category = categorizeStatement(normalized)
    if (!buckets.has(category)) buckets.set(category, [])

    const items = buckets.get(category)
    if (!items.some((item) => item.toLowerCase() === key)) {
      items.push(normalized)
    }
  }

  let additions = ""
  for (const [category, items] of buckets.entries()) {
    if (items.length === 0) continue
    additions += `\n### ${category}\n`
    for (const item of items) {
      additions += `- ${item}\n`
    }
  }

  return additions.trim() ? additions.trimEnd() + "\n" : ""
}

function ensureLearningsSection(content, header) {
  if (content.includes("## Learnings")) {
    return content
  }

  const suffix = `\n\n## Learnings\n\n<!-- Auto-captured from sessions by /learn -->\n`
  return `${content.trimEnd()}${suffix}`
}

async function main() {
  const stdin = await readStdin()
  if (!stdin.trim()) return

  const input = safeJsonParse(stdin)
  if (!input) return

  const transcriptPath = input.transcript_path
  const cwd = input.cwd || process.cwd()
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return

  const isOpenCode = Boolean(process.env.OPENCODE) || input.hook_source === "opencode-plugin"
  const targetFile = path.join(cwd, isOpenCode ? "AGENTS.md" : "CLAUDE.md")

  const transcriptLines = fs
    .readFileSync(transcriptPath, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .slice(-MAX_TRANSCRIPT_LINES)

  const messages = extractUserMessages(transcriptLines)
  if (messages.length === 0) return

  const statements = messages
    .join("\n")
    .split(/\n|[.!?]\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const existingContent = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, "utf8") : ""
  const baseContent = existingContent || (isOpenCode ? "# Agent Guidelines\n" : "# Project Context\n")
  const withLearnings = ensureLearningsSection(baseContent)

  const additions = buildLearnings(statements, withLearnings)
  if (!additions) return

  const updatedContent = `${withLearnings.trimEnd()}\n\n${additions}`
  fs.writeFileSync(targetFile, `${updatedContent.trimEnd()}\n`)
}

main().catch(() => {})
