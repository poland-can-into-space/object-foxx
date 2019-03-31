const joi = require("joi")
function main(results, config) {
  if (results.status && results.body) return {
    status: results.status,
    body: typeof results.body === 'object' && results !== null
      ? results.body
      : {data: results}
  }
  for (const respCheck of validateResp(results, config)) {
    return respCheck
  }

  const chosen =
    !global._json_server_config.statusCodeTemplate
      ? checkValue(results)
      : global._json_server_config.statusCodeTemplate(results, config)

  const body = typeof results === 'object' && (typeof chosen !== 'object'||results !== null)
    ? results
    : {data: results}
  return typeof chosen === 'number'
    ? {status: chosen, body}
    : {status: 200, body}
}

function* validateResp(results, config) {
  for (const conf in config.response) {
    var thisConf = config.response[conf]
    if (joi.validate(results, thisConf.schema).err === null) {
      yield {status: conf.status, body: conf.body || results}
    }
  }
}

function checkValue(r) {
  if (Array.isArray(r)) {
    if (r.length > 1) {
      return r;
    } else {
      var r2 = r[0];
    }
  } else {
    var r2 = r
  }
  switch (r2) {
    case undefined:
      return 501
    case false:
      return 403
    case true:
      return 204
    case null:
      return 404
    default:
      return r2;
  }
}

module.exports = main;
