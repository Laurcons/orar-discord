
import fs from "fs/promises";
import { Database } from "./types";

let database: Database | null = null;

export async function loadDatabase() {
    const file = await fs.readFile("./database.json");
    const json = file.toString();
    const db = JSON.parse(json);
    database = db;
}

export function getDatabase(): Database {
    if (!database)
        throw new Error("Database not loaded");
    return database;
}