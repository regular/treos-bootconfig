function makeBootloaderConfig(bootloader, bootVars) {
  const config = makeConfig(bootloader.config, bootVars)
  const entries = Object.entries(bootloader.entries).map( ([filename, fields]) =>{
    const content = makeBootEntry(fields, bootVars)
    return {filename, content}
  })
  
  const suppressEntries = (bootVars['treos-bootconfig-suppress'] || '').split(',')

  return entries.reduce( (acc, {filename, content})=>{
    if (!suppressEntries.includes(filename)) {
      acc[`loader/entries/${filename}`] = content + '\n'
    }
    return acc
  }, {
    'loader/loader.conf': config + '\n'
  })
}

function makeConfig(d, bootVars) {
  return Object.entries(d).map(([key, value]) => {
    if (!Array.isArray(value)) {
      value = expand(value, bootVars)
      return `${key}\t${value}`
    }
    return value.map(v=>`${key}\t${expand(v, bootVars)}`).join('\n')
  }).join('\n')
}

function expand(value,  bootVars) {
  return value.replace(/\$\{([\w-_]+)\}/g, (_, key) => bootVars[key] || '')
}

function makeBootEntry(d, bootVars) {
  const options = d.options
  d = Object.assign({}, d)
  delete d.options

  const opts = 'options\t' + Object.entries(options).map( ([key, value]) => {
    if (value==true) return key
    value = expand(value, bootVars)
    return `${key}=${value}`
  }).join(' ')

  return [makeConfig(d, bootVars), opts].join('\n')
}

module.exports = makeBootloaderConfig
