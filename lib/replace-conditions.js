function main(conditions, _debug, registeredFuncs) {
  if (!Array.isArray(conditions)) return false
  var funcs = []
  for (const cond of conditions) {
    if (typeof registeredFuncs[cond] === 'function') {
      funcs.push(registeredFuncs[cond])
    } else {
      console.error("error with conditinos parameter", { cond } );
    }
  }
  return funcs
}

module.exports = main;
