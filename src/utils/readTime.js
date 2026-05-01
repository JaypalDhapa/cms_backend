// utils/readTime.js
// Calculates read time from Lexical editor JSON content
// Uses a whitelist registry — only registered nodes are entered
// Unknown/custom nodes are automatically ignored including their children

const WORDS_PER_MINUTE = 200

// ─────────────────────────────────────────────
// Registry
// Each entry is a function that receives (node, walk) and returns word count
// "walk" is passed in so handlers can recurse into children
//
// To add a new node that should be counted:
//   add its type here → point to walkChildren
//
// To ignore a new node (images, embeds, etc):
//   do nothing — unlisted nodes are ignored automatically
// ─────────────────────────────────────────────

const registry = {
  // root entry point
  root: walkChildren,

  // built-in lexical nodes
  paragraph: walkChildren,
  heading: walkChildren,
  quote: walkChildren,
  list: walkChildren,
  listitem: walkChildren,
  link: walkChildren,
  autolink: walkChildren,

  // text node — only place where words are actually counted
  text: (node) => {
    if (!node.text || typeof node.text !== "string") return 0
    return node.text.trim().split(/\s+/).filter(Boolean).length
  },

  // ── your custom nodes ──────────────────────
  // add custom nodes here only if they have readable text inside them
  // WarningNode, DangerNode, HighlightCardNode have readable text → include
  // StepsNode, TabsNode have readable text inside → include
  // everything else (Image, Iframe, Excalidraw etc) → not listed → auto ignored

  warning: walkChildren,
  danger: walkChildren,
  highlightcard: walkChildren,
  steps: walkChildren,
  tabs: walkChildren,
  styledtable: walkChildren,
  tablerow: walkChildren,
  tablecell: walkChildren,

  // explicitly excluded — listed here just for clarity, but you can remove
  // these lines since unlisted = ignored anyway
  // codeblock  → ignored
  // divider    → ignored
  // image      → ignored
  // iframe     → ignored
  // svg        → ignored
  // excalidraw → ignored
  // button     → ignored
}

// ─────────────────────────────────────────────
// Shared handler for all container nodes
// Loops over children, calls walk on each sibling
// If a sibling is not in registry → walk returns 0, loop continues
// ─────────────────────────────────────────────

function walkChildren(node, walk) {
  if (!Array.isArray(node.children)) return 0

  let total = 0
  for (const child of node.children) {
    total += walk(child)  // sibling loop always continues regardless of result
  }
  return total
}

// ─────────────────────────────────────────────
// Core walker
// Checks registry for node.type
// If found  → call its handler (which may recurse deeper via walkChildren)
// If not found → return 0, stop here, children never visited
// ─────────────────────────────────────────────

function walk(node) {
  if (!node || typeof node !== "object") return 0

  const type = node.type?.toLowerCase()
  const handler = registry[type]

  // not in registry → stop here, do NOT walk children
  if (!handler) return 0

  // in registry → call handler, pass walk so it can recurse
  return handler(node, walk)
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export function calculateReadTime(lexicalContent) {
  try {
    const parsed =
      typeof lexicalContent === "string"
        ? JSON.parse(lexicalContent)
        : lexicalContent

    const root = parsed?.root
    if (!root) return 1

    const wordCount = walk(root)
    const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)

    return Math.max(1, minutes)
  } catch {
    return 1
  }
}