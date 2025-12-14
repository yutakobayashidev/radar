import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Source {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
}

function escapeSQLString(str: string): string {
  return str.replace(/'/g, "''");
}

async function importSources(local: boolean = true) {
  // Read sources.json
  const sourcesPath = join(__dirname, "..", "db", "sources.json");
  const sourcesData = readFileSync(sourcesPath, "utf-8");
  const sources: Source[] = JSON.parse(sourcesData);

  console.log(`📦 Found ${sources.length} sources to import`);

  const mode = local ? "--local" : "--remote";
  console.log(`🌍 Target: ${local ? "Local D1" : "Remote D1"}`);

  const { execSync } = await import("child_process");

  // Note: 削除ステップをスキップして、既存の記事を保護します
  // 古いソースを削除したい場合は手動でDBから削除してください

  // Insert or update sources from JSON
  const now = Date.now();
  const values = sources.map((source) => {
    return `('${escapeSQLString(source.id)}', '${escapeSQLString(source.name)}', '${escapeSQLString(source.url)}', '${escapeSQLString(source.description)}', '${escapeSQLString(source.category)}', 0, ${now}, ${now}, ${now})`;
  });

  const insertSQL = `
INSERT OR REPLACE INTO sources (id, name, url, description, category, article_count, last_updated, created_at, updated_at)
VALUES ${values.join(",\n")};
  `.trim();

  try {
    console.log("🚀 Importing sources...");
    const output = execSync(
      `npx wrangler d1 execute radar ${mode} --command "${insertSQL.replace(/"/g, '\\"')}"`,
      {
        encoding: "utf-8",
        stdio: "pipe",
      }
    );
    console.log(output);
    console.log("✅ Sources imported successfully!");
  } catch (error: any) {
    console.error("❌ Failed to import sources:");
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isRemote = args.includes("--remote");

importSources(!isRemote);
