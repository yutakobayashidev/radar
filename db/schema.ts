import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "AI" | "Infrastructure" | "Framework" | "Language" | "Runtime" | "Platform"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const radarItems = sqliteTable("radar_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  source: text("source").notNull().references(() => sources.id, { onDelete: "cascade" }),
  sourceName: text("source_name").notNull(),
  summary: text("summary").notNull(),
  image: text("image"), // OGP画像が取得できない場合は空文字列またはnull
  url: text("url").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(), // UNIX timestamp
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});