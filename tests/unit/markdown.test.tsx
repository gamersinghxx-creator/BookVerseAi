import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/lib/markdown";

const html = (text: string) => renderToStaticMarkup(<Markdown text={text} />);

describe("Markdown", () => {
  it("renders bold, italic and code", () => {
    const out = html("This is **bold**, *italic*, and `code`.");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("<code");
    expect(out).toContain("code</code>");
  });

  it("renders unordered and ordered lists", () => {
    expect(html("- one\n- two")).toContain("<ul");
    expect(html("1. first\n2. second")).toContain("<ol");
  });

  it("splits paragraphs on blank lines", () => {
    const out = html("Para one.\n\nPara two.");
    expect((out.match(/<p/g) ?? []).length).toBe(2);
  });

  it("never emits raw HTML from the input (no XSS)", () => {
    const out = html("<img src=x onerror=alert(1)> and <script>bad()</script>");
    expect(out).not.toContain("<img");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });
});
