#!/usr/bin/env node

/* Usage
 *
 *   treos-bootconfig TREOS-ISSUE.JSON [DESTDIR] [--boot-vars "KEY1=VALUE1 KEY2=VALUE2"
 *
 * ISSUEFILE is the path to treos-issue.json describing the desired boot loader configuration
 * DESTDIR where to put the output files
 * KEYx, VALUEx are used in replacing placehoder strings in boot options. Defaults to contents of
 * proc/cmdline.
*/

const fs = require('fs')
const {basename, join, resolve, relative, dirname} = require('path')
const mkdirp = require('mkdirp')
const argv = require('minimist')(process.argv.slice(2));

const makeBootloaderConfigFiles = require('../systemd-boot.js')
const parseVars = require('../parse-vars')

if (argv._.length < 1) {
  console.error('Usage: treos-bootconfig TREOS-ISSUE.JSON [DESTDIR] [--boot-vars "KEY1=VALUE1 KEY2=VALUE2"')
  process.exit(1)
}

const bootVars = parseVars(argv['boot-vars'] || fs.readFileSync('/proc/cmdline', 'utf8'))
console.error('Bootvars')
console.error(bootVars)

const issueFile = argv._[0]
console.error(`reading ${issueFile}`)
const fileContent = fs.readFileSync(issueFile)
let issue
try {
  issue = JSON.parse(fileContent)
} catch(err) {
  console.error(err.message)
  process.exit(1)
}

const files = makeBootloaderConfigFiles(issue.bootloader, bootVars)
//console.log(files)
const destdir = argv._[1] || '.'
Object.entries(files).forEach( ([name, content])=>{
  const dir = dirname(resolve(destdir, name))
  const filename = basename(resolve(destdir, name))
  //console.log(dir, filename)
  mkdirp.sync(dir)
  fs.writeFileSync(join(dir, filename), content, 'utf8')
})
