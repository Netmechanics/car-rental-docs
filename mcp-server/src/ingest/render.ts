import Asciidoctor from "@asciidoctor/core";
import { convert as htmlToText } from "html-to-text";

const asciidoctor = Asciidoctor();

export interface RenderedPage {
  relPath: string;
  title: string;
  text: string;
}

export function renderAdoc(relPath: string, preprocessed: string): RenderedPage {
  const html = asciidoctor.convert(preprocessed, {
    safe: "safe",
    standalone: false,
    attributes: { icons: "font" },
  }) as string;

  const text = htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  });

  // Extract document title from the first = Heading line
  const titleMatch = preprocessed.match(/^=\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : relPath;

  return { relPath, title, text: text.trim() };
}
