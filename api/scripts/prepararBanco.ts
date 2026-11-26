import "dotenv/config";
import Database from "better-sqlite3";

const url: string | undefined = process.env.DATABASE_URL;
if (!url?.startsWith("file:")) {
  throw new Error("Configure DATABASE_URL com uma URL SQLite file: no arquivo .env.");
}

const banco: Database.Database = new Database(url.slice(5));
banco.close();
