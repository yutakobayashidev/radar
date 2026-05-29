import sourcesData from "../../../db/sources.json";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function loader() {
  const categories = new Map<string, typeof sourcesData>();
  for (const src of sourcesData) {
    const cat = src.category || "Uncategorized";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(src);
  }

  let bodyXml = "";
  for (const [category, sources] of categories) {
    bodyXml += `    <outline text="${escapeXml(category)}" title="${escapeXml(category)}">\n`;
    for (const src of sources) {
      bodyXml += `      <outline type="rss" text="${escapeXml(src.name)}" title="${escapeXml(src.name)}" xmlUrl="${escapeXml(src.url)}" description="${escapeXml(src.description || "")}"/>\n`;
    }
    bodyXml += `    </outline>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>Radar Sources</title>
  </head>
  <body>
${bodyXml}  </body>
</opml>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
