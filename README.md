# Gaffer 🤖

Gaffer is an all-in-one Discord bot, ORM, and Rest API.
It is self-managing, running its features in child processes with automatic crash detection and restart, and IPC management.

## Child Processes 🚀

The main child processes that Gaffer manages are:
- [Prisma](https://www.prisma.io/) (database)
- [Trestle](https://trestle.js.org/) (Rest API)
- [discord.js](https://discord.js.org/) (Discord bot)

Note: discord.js is planned to be replaced with [LBF (Luna Bot Framework)](https://github.com/WhiskeeDev/wsky-bot-framework) once it is ready.

Gaffer is designed to be able to handle any number of child processes and is able to hot-swap them as needed, meaning while the above are the _main_ processes, a running instance of Gaffer may have additional processes.

## Process Management 🔧

Gaffer is designed to handle the hot-swapping of child processes and to allow them to run independently of each other. 
This means that if one process crashes, the others will not be affected and the crashed process(es) will be respawned/restarted and the IPC will be re-established.

## Installation 💾

Simply run `npm ci` to do a clean install using the package and package-lock files.

## Usage 📝

To use Gaffer, simply run `npm start`. This will spawn the child processes defined in `src/processes`.

## Notes 📌

- Gaffer logs a boot record for each time a process is started or restarted, as well as a shutdown record.
- In the event of an error or if a process exits, Gaffer will attempt to restart it.
  - If a process is not restarted within 5 seconds of crashing, a shutdown record will be created and no further attempts will be made to restart the process.
