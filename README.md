# Orar Discord
A Node application which sends the timetable for the following day in multiple servers or channels.

It is custom-built for the Faculty of Mathematics and Computer Science of Babeș Bolyai University of Cluj-Napoca, Romania, and works for every group and specialization.

It scrapes the timetable pages and sends webhooks.

![](https://i.ibb.co/XDgsCYs/image.png)

## What does the bot do?
This app is a continually-running Node process. At 13:00 local time every day (working days) (changeable in config) it sends a webhook to each configured channel with each configured group & specialization's timetables.

I am personally hosting this bot on a Frankfurt-based server, so the time difference means that webhooks are sent at ~16:00 Romania time.

## Self hosting?
You can, yeah.

You need to create a `database.json` file in the root of the project. Read the `src/types.ts` file to find out how the `database.json` file needs to be structured (look for the `Database` interface).

Please make sure that the group names you're providing DO exist.

Use `npm install` to install dependencies, `npx tsc` to build the project using TypeScript. Use `npm start` to start the app. It will not do anything until the configured time (default 13:00). Optionally, you can force it to send webhooks at startup by passing the `--startupSend` argument (`npm start -- --startupSend`).

## Want to contribute?
Do, by all means! You can write issues in the Issues tab, or even fork the project and make a pull request!
### TRANSLATIONS NEEDED!
With the newly-added internationalization support, I seek help translating the bot into **Hungarian** and **German**, and optionally into others. If you know any of these languages, contact me!

Romanian and English translations already exist.
