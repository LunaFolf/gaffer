import fs from 'fs'
import { DateTime } from 'luxon'
import strip from 'strip-color'

type LogType = 'warn' | 'debug' | 'depreciated' | 'error' | 'info'

const logPrefixes: { [k in LogType]: string } = {
  warn: 'WARN'.red.bgYellow,
  debug: 'DBUG'.rainbow.bgWhite,
  depreciated: 'DEAD'.yellow.bgRed,
  error: 'EROR'.bgRed.white,
  info: 'INFO'.bgBlue.white
}

// Override the console.log function so format it better,
// Aswell as append it all to a .log file.
const originalLog = console.log

function writeToLogs (logType: LogType, args: IArguments | any[]): { dt: DateTime, time: string, formattedString: string } {
  // convert args to array
  args = Array.prototype.slice.call(args)

  // Work out datetime
  const dt: DateTime = DateTime.local()
  const time: string = dt.toLocaleString(DateTime.TIME_24_WITH_SECONDS)

  // Setup filepath and start the string to write to
  const filepath: string = `./logs/${dt.toISODate()}.log`
  let stringToWrite: string = `[${time}] [${logPrefixes[logType]}] `

  // Parse the args and format them into a string
  for (const arg of args) {
    if (typeof arg === 'string') stringToWrite += arg + ' '
    else stringToWrite += `\n${strip(JSON.stringify(arg, null, 2))}\n`
  }

  stringToWrite += '\n' // Add a new line at the end of the log

  try {
    fs.writeFileSync(filepath, strip(stringToWrite), { flag: 'a' })
  } catch (err: any) {
    originalLog(`Error writing to ${'datetime'.bgYellow} log file: ${err.message}`.red)
  }

  try {
    fs.writeFileSync('./logs/latest.log', strip(stringToWrite), { flag: 'a' })
  } catch (err: any) {
    originalLog(`Error writing to ${'latest'.bgYellow} log file: ${err.message}`.red)
  }

  return { dt, time, formattedString: stringToWrite }
}

function formatArguments (type: LogType, args: IArguments | any[]): string {
  const { formattedString } = writeToLogs(type, args)
  return formattedString.trim()
}

module.exports = {
  requiredDirectories: ['logs'],
  init () {
    // Override the existing console methods with our own
    console.log = (...args: any[]) => originalLog.apply(console, [formatArguments('info', args)])
    console.warn = (...args: any[]) => originalLog.apply(console, [formatArguments('warn', args)])
    console.error = (...args: any[]) => originalLog.apply(console, [formatArguments('error', args)])
    console.debug = (...args: any[]) => originalLog.apply(console, [formatArguments('debug', args)])
  }
}
