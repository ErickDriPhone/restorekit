import type { HighlighterCore } from "shiki/core";

// Brand-token theme so highlighted code reads like the rest of the page.
const theme = {
  name: "restorekit",
  type: "dark" as const,
  colors: {
    "editor.background": "#00000000",
    "editor.foreground": "#c4d3c8",
  },
  settings: [
    { settings: { foreground: "#c4d3c8" } },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#7fa391" } },
    { scope: ["string", "punctuation.definition.string"], settings: { foreground: "#b2de93" } },
    {
      scope: ["keyword", "storage.type", "storage.modifier", "keyword.operator"],
      settings: { foreground: "#dcb660" },
    },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#9fc7d8" } },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#f1f0e6" },
    },
    { scope: ["variable", "variable.other"], settings: { foreground: "#c4d3c8" } },
    { scope: ["entity.name.type", "support.type"], settings: { foreground: "#9fc7d8" } },
  ],
};

let highlighter: Promise<HighlighterCore> | null = null;

// shiki is loaded on demand so it stays out of the main bundle; blocks render
// as plain text until it arrives.
async function create(): Promise<HighlighterCore> {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, bash, rust] =
    await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/langs/bash.mjs"),
      import("shiki/langs/rust.mjs"),
    ]);
  return createHighlighterCore({
    themes: [theme],
    langs: [bash.default, rust.default],
    engine: createJavaScriptRegexEngine(),
  });
}

export function highlight(code: string, lang: "bash" | "rust"): Promise<string> {
  highlighter ??= create();
  return highlighter.then((h) => h.codeToHtml(code, { lang, theme: "restorekit" }));
}
