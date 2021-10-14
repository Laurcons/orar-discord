# Orar Discord
A Node application which sends the timetable for the following day in multiple servers or channels.

It is custom-built for the Faculty of Mathematics and Computer Science of Babeș Bolyai University of Cluj-Napoca, Romania, and works for every group and specialization.

It scrapes the timetable pages and sends webhooks.

## What does the bot do?
This app is a continually-running Node process. At 17:00 local time every day (working days) it sends a webhook to each configured channel with each configured group & specialization's timetables.

I am personally hosting this bot on a Frankfurt-based server, so the time difference means that webhooks are sent at 20:00 Romania time.

## Self hosting?
You can, yeah.

You need to create a `database.json` file in the root of the project. Read the `src/types.ts` file to find out how the `database.json` file needs to be structured (look for the `Database` interface).

The specialization codes are the same ones used on the timetable pages, in their URLs. Generally, a code is formed by taking the specialization name (M, MI, I), the language (E, G, M and nothing for Ro), and the year (1, 2, 3). For example, the Informatics in English, year 1 specialization code is `IE1`.

Please do make sure that the group name you're providing DOES exist in the specialization you're providing.

Use `npm install` to install dependencies, `npx tsc` to build the project using TypeScript. Use `npm start` to start the app. It will not do anything until the configured time (17:00). Optionally, you can force it to send webhooks at startup by passing the `--startupSend` argument.

## Want to contribute?
Do, by all means! You can write issues in the Issues tab, or even fork the project and make a pull request!
