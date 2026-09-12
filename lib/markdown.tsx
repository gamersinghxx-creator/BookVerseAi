import { Fragment, type ReactNode } from "react";

// A tiny, safe markdown renderer for AI tutor answers. Returns React nodes —
// never uses dangerouslySetInnerHTML — so there is no XSS surface. Handles:
// paragraphs, unordered/ordered lists, `**bold**`, `*italic*`, `` `code` ``.
// Anything fancier renders as plain text.

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Split on **bold**, *italic*, `code` while keeping delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);
  parts.forEach((part, i) => {
    const key = `${keyBase}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      out.push(<strong key={key}>{part.slice(2, -2)}</strong>);
    } else if (/^\*[^*\n]+\*$/.test(part)) {
      out.push(<em key={key}>{part.slice(1, -1)}</em>);
    } else if (/^`[^`\n]+`$/.test(part)) {
      out.push(
        <code key={key} className="rounded bg-ink/8 px-1 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>,
      );
    } else if (part) {
      out.push(<Fragment key={key}>{part}</Fragment>);
    }
  });
  return out;
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isUl = lines.every((l) => /^\s*[-*]\s+/.test(l));
        const isOl = lines.every((l) => /^\s*\d+\.\s+/.test(l));

        if (isUl && lines.length) {
          return (
            <ul key={bi} className="my-1 list-disc space-y-0.5 pl-5">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*[-*]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (isOl && lines.length) {
          return (
            <ol key={bi} className="my-1 list-decimal space-y-0.5 pl-5">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*\d+\.\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={bi} className={bi > 0 ? "mt-2" : undefined}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
