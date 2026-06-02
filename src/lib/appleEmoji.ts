import emojiRegex from "emoji-regex";

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "NOSCRIPT",
]);

function toCodepoints(emoji: string): string {
  const codes: string[] = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp) codes.push(cp.toString(16));
  }
  // Drop variation selector FE0F like twemoji does (keeps URLs cleaner)
  return codes.filter((c) => c !== "fe0f").join("-");
}

function buildUrl(emoji: string): string {
  // jsdelivr Apple emoji set (Twemoji-style, Apple imagery)
  const cp = toCodepoints(emoji);
  return `https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-64/${cp}.png`;
}

function replaceInText(node: Text) {
  const text = node.nodeValue;
  if (!text) return;
  const regex = emojiRegex();
  if (!regex.test(text)) return;

  const frag = document.createDocumentFragment();
  let lastIndex = 0;
  const re = emojiRegex();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const emoji = m[0];
    const start = m.index;
    if (start > lastIndex) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
    }
    const img = document.createElement("img");
    img.src = buildUrl(emoji);
    img.alt = emoji;
    img.className = "apple-emoji";
    img.setAttribute("draggable", "false");
    img.setAttribute("loading", "lazy");
    img.onerror = () => {
      // Fallback to original text emoji
      const span = document.createTextNode(emoji);
      img.replaceWith(span);
    };
    frag.appendChild(img);
    lastIndex = start + emoji.length;
  }
  if (lastIndex < text.length) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
  node.parentNode?.replaceChild(frag, node);
}

function walk(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement;
    if (!parent) return;
    if (SKIP_TAGS.has(parent.tagName)) return;
    if (parent.closest("[data-no-emoji]")) return;
    replaceInText(root as Text);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const el = root as Element;
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.hasAttribute("contenteditable")) return;
  const children = Array.from(root.childNodes);
  for (const child of children) walk(child);
}

let observer: MutationObserver | null = null;

export function initAppleEmoji() {
  if (typeof window === "undefined") return;
  if (observer) return;

  const run = () => walk(document.body);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      if (mut.type === "childList") {
        mut.addedNodes.forEach((n) => walk(n));
      } else if (mut.type === "characterData" && mut.target.nodeType === Node.TEXT_NODE) {
        const parent = (mut.target as Text).parentElement;
        if (parent && !SKIP_TAGS.has(parent.tagName)) {
          replaceInText(mut.target as Text);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
