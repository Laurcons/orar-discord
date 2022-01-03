/**
 * Run this file as "node ./scripts/migrate1.js" from the project root, to migrate the database from the
 * old specialization format:
 * "specializations": [
            {
                "name": "MI1",
                "groups": [
                    "311"
                ]
            },
            {
                "name": "MI2",
                "groups": [
                    "322"
                ]
            }
        ]
 * to the new specialization format:
    "groups": [ "311", "322" ]

    Migration corresponds to v1.2 to v1.3
 */

const fs = require("fs/promises");

async function main() {
    var database = await fs.readFile("./database.json");
    database = JSON.parse(database);
    console.log(database);
    for (const [wh, index] of database.map((v, i) => [v, i])) {
        if (wh.groups) {
            console.log(`Skipping webhook #${index} since it appears to be in the new format`);
            continue;
        }
        console.log(`Converting #${index}`);
        var groups = [];
        for (const spec of wh.specializations) {
            groups = groups.concat(spec.groups);
        }
        groups = [...new Set(groups)]; // remove duplicates
        wh.groups = groups;
        delete wh.specializations;
    }
    await fs.rename("./database.json", "./database.old.json");
    await fs.writeFile("./database.json", JSON.stringify(database, null, 4));
}

main();