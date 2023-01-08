/**
 * @file Processes - Index
 * 
 * This file gets a list of all the processes, and returns an array of their names.
 */

import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const processList = readdirSync(join(__dirname, '..', 'processes'))

// Filter only the processes that are valid (i.e. they have an index.ts file)
for (const child of processList) {
  const indexFile = join(__dirname, '..', 'processes', child, 'index.ts')

  try {
    readFileSync(indexFile)
  } catch (err) {
    processList.splice(processList.indexOf(child), 1)
  }
}

export default processList