
module.exports = function(rawBootVars) {
  const bootVars = {}
  rawBootVars.replace(/([\w-_]+)=([\S]+)/g, (a,key,value)=>{
    bootVars[key] = value
  })
  return bootVars
}
