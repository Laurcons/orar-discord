
import fs from "fs/promises";

let database: any;

export async function loadDatabase() {
    const file = await fs.readFile("./database.json");
    const json = file.toString();
    const db = JSON.parse(json);
    database = db;
}

export function getDatabase() {
    if (!database)
        throw new Error("Database not loaded");
    return database;
}