export const getCssPath = (el: Element): string => {
  const segments: string[] = [];
  let node: Element | null = el;
  while (node && node.nodeType === 1 && node !== document.body) {
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children).filter(
      (c: Element) => c.tagName === node!.tagName,
    );
    const index = siblings.indexOf(node) + 1;
    segments.unshift(`${tag}:nth-of-type(${index})`);
    node = parent;
  }
  return segments.length ? segments.join(">") : "body";
};

export const closestBlock = (start: HTMLElement): HTMLElement | null => {
  let n: HTMLElement | null = start;
  while (n) {
    const tag = n.tagName.toLowerCase();
    if (/^(p|li|h1|h2|h3|h4|h5|h6|pre|code|td|th|blockquote|div)$/i.test(tag))
      return n;
    n = n.parentElement as HTMLElement | null;
  }
  return null;
};

export const highlightAnchor = (el: HTMLElement, ms = 1200): void => {
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add(
    "ring-2",
    "ring-amber-400",
    "ring-offset-2",
    "ring-offset-transparent",
  );
  window.setTimeout(() => {
    el.classList.remove(
      "ring-2",
      "ring-amber-400",
      "ring-offset-2",
      "ring-offset-transparent",
    );
  }, ms);
};

// Very small HTML sanitizer (allowlist). For produktive Sicherheit DOMPurify nutzen.
export function sanitizeHtmlBasic(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const allowedTags = new Set([
      "p",
      "div",
      "span",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "blockquote",
      "code",
      "pre",
    ]);
    const walk = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!allowedTags.has(tag)) {
          el.replaceWith(...Array.from(el.childNodes));
          return;
        }
        Array.from(el.attributes).forEach((attr) => {
          const n = attr.name.toLowerCase();
          if (
            n.startsWith("on") ||
            n === "style" ||
            n === "src" ||
            n === "href"
          ) {
            el.removeAttribute(attr.name);
          }
        });
      }
      Array.from(node.childNodes).forEach(walk);
    };
    walk(doc.body);
    return stripBidiControls(doc.body.innerHTML);
  } catch {
    return stripBidiControls(html);
  }
}

// Entfernt Bidi-Steuerzeichen (RLM/LRM, LRE/RLE/RLO/PDF, LRI/RLI/FSI/PDI)
export function stripBidiControls(input: string): string {
  return input.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
}
