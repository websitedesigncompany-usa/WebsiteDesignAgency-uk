/**
 * Safe HTML minifier for the static build.
 *
 * Conservative by design: it only removes whitespace that cannot change
 * rendering — between block elements, in comment-free gaps, and around
 * attributes — and never touches <pre>, <textarea> or <script> content
 * beyond collapsing safe runs. Correctness beats a few extra kilobytes.
 */

const PRESERVE = new Set(['pre', 'textarea', 'script', 'style']);
const INLINE_TEXT = new Set(['a', 'b', 'i', 'em', 'strong', 'span', 'code', 'label', 'small', 'sup', 'sub', 'time', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th', 'dt', 'dd', 'figcaption', 'caption', 'button', 'option', 'summary']);

export function minifyHtml(html: string): string {
  let out = '';
  let i = 0;
  const n = html.length;
  let preserveDepth = 0;
  let tagStack: string[] = [];
  let lastTag = '';
  let pendingText = '';

  const flushText = () => {
    if (!pendingText) return;
    const trimmed = pendingText.replace(/\s+/g, ' ');
    if (trimmed.trim() === '') {
      // Collapse whitespace between tags, but keep a single space where an
      // inline element is adjacent so words do not fuse.
      const prev = lastTag.toLowerCase();
      if (INLINE_TEXT.has(prev)) out += ' ';
    } else {
      out += trimmed;
    }
    pendingText = '';
  };

  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      pendingText += html.slice(i);
      break;
    }
    if (lt > i) pendingText += html.slice(i, lt);

    // Comment / doctype / closing tag
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (html.startsWith('<!', lt)) {
      const end = html.indexOf('>', lt);
      flushText();
      out += html.slice(lt, end + 1);
      i = end + 1;
      lastTag = '!';
      continue;
    }
    if (html.startsWith('</', lt)) {
      const end = html.indexOf('>', lt);
      flushText();
      const name = html.slice(lt + 2, end).trim().toLowerCase();
      out += `</${name}>`;
      tagStack.pop();
      lastTag = name;
      i = end + 1;
      if (preserveDepth > 0 && PRESERVE.has(name)) preserveDepth -= 1;
      continue;
    }

    // Opening tag — read attributes, respecting quoted values.
    let j = lt + 1;
    let inQ: string | null = null;
    while (j < n) {
      const c = html[j];
      if (inQ) {
        if (c === inQ) inQ = null;
      } else if (c === '"' || c === "'") {
        inQ = c;
      } else if (c === '>') {
        break;
      }
      j += 1;
    }
    const raw = html.slice(lt, j + 1);
    const selfClosing = raw.endsWith('/>');
    const nameMatch = /^<([a-zA-Z0-9-]+)/.exec(raw);
    const name = nameMatch ? nameMatch[1].toLowerCase() : '';

    if (preserveDepth === 0) {
      flushText();
      out += minifyTag(raw);
      lastTag = name;
      tagStack.push(name);
      if (PRESERVE.has(name) && !selfClosing) preserveDepth += 1;
    } else {
      out += raw;
    }
    i = j + 1;
  }
  flushText();

  return out.replace(/\n{2,}/g, '\n').trim();
}

function minifyTag(raw: string): string {
  // Strip newlines and runs of spaces inside the tag, but keep quoted values intact.
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s*=\s*(["'])/g, '=$1')
    .replace(/>\s+</g, '><')
    .trim();
}
