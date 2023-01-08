/**
 * @fileoverview
 * @author Luna Null <dev@whiskee.me>
 *
 * This file is the root manager of Gaffer.
 * It spawns the child processes, and manages the IPC.
 *
 * The main processes are:
 * - Prisma (database)
 * - Trestle (Rest API)
 * - discord.js (Discord bot)
 *
 * NOTE: discord.js is planned to be replaced with LBF (Luna Bot Framework) once it is ready.
 *
 * NOTE: While these are the main processes, this does not limit the number of child processes.
 * Gaffer is designed to handle hot-swapping of child processes, and is designed to be able to handle
 * any number of child processes.
 *
 * The reason why these processes are seperated is to allow for hot-swapping of processes, and to
 * allow the processes to run independently of each other.
 * Thus, if one process crashes, the others will not be affected.
 * The crashed process(es) will be respawned/restarted, and the IPC will be re-established.
 */

import { spawn } from 'child_process'
import { join } from 'path'
import processList from './processes'
import { BootRecord, ChildObject } from './types/IPC'
import './prelaunch'


const bootRecord: BootRecord[] = []

const processes: ChildObject[] = []

function spawnProcess(processName: string, restart = false) {
  console.log(`${restart ? 'Restarting' : 'Starting'} ${processName}`)
  const bootDateTime = new Date()
  const processPath = join(__dirname, 'src', 'processes', processName, 'index.ts')

  const child = spawn('ts-node', [processPath])

  bootRecord.push({
    processName,
    bootDateTime,
    processPath,
    action: restart ? 'restart' : 'startup'
  })

  handleProcessIPC({
    name: processName,
    process: child
  })
}

function handleProcessIPC(child: ChildObject) {
  const processName = child.name
  const childProcess = child.process

  childProcess.on('exit', (code, signal) => {
    console.warn(`${processName} exited with code ${code} and signal ${signal}`)
    // Attempt to restart the process

    // If the process was last restarted less than 5 seconds ago, do not restart it
    // Instead, log a shutdown boot record
    const lastRestart = bootRecord
      .filter((record) => record.processName === child.name && record.action === 'restart')
      .pop()
    if (lastRestart) {
      console.error(`Last restart was less than 5 seconds ago. Not restarting ${processName}. Expect an SOS message Soon™.`)

      const lastRestartTime = lastRestart.bootDateTime.getTime()
      const currentTime = new Date().getTime()
      const timeDifference = currentTime - lastRestartTime

      if (timeDifference < 5000) {
        bootRecord.push({
          processName,
          bootDateTime: new Date(),
          action: 'shutdown'
        })

        return
      }
    }

    spawnProcess(processName, true)
  })

  childProcess.on('error', (err) => {
    console.error(`${processName} errored with ${err}`)
  })

  childProcess.on('message', (message) => {
    console.log(`${processName} sent a message: ${message}`)
  })
}

for (const child of processList) {
  spawnProcess(child)
}

console.debug('Boot record:', bootRecord)
