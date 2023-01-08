/**
 * This is the prelaunch file, it does all our initial setup crap.
 */

import fs from 'fs'
import 'colors'

// Load the environment params in .env(s)
require('dotenv').config()

// declare the global variables
declare global {
  var skipUpdate: boolean
  var ignoreFail: boolean
}

// Get args
const args = process.argv.slice(2)

/**
 * MAH CODE
 */
interface LaunchModule {
  /**
   * The directories that are required for this module to run.
   */
  requiredDirectories?: string[],
  init?: () => void
}

const prelaunchFiles: fs.Dirent[] = fs.readdirSync(__dirname, { withFileTypes: true })
  .filter((dirent: fs.Dirent) => dirent.isFile() && dirent.name !== 'index.ts' && dirent.name.endsWith('.ts'))

for (const file of prelaunchFiles) {
  const module: LaunchModule = require(`./${file.name}`)

  console.log(`Loading prelaunch module ${file.name}...`.cyan)

  if (module.requiredDirectories) {
    for (const dir of module.requiredDirectories) {
      const path: string = `./${dir}`
      console.log(`Creating directory ${path}...`.cyan)
      const pathExists: boolean = fs.existsSync(path)
      if (!pathExists) fs.mkdirSync(path)
      console.log(`Directory ${path} created.`.green)
    }
  }

  if (module.init) module.init()
}
