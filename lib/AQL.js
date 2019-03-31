const db = require('@arangodb').db;
function main(aql, variables) {
  const aqlString = aql.key
    ? global._json_server_config.AQL[aql.key]
    : aql;
  const params = avoidAqlError(aqlString, variables)
  return db._query(params)._documents
}

function alias(req) {
  const {
    queryParams,
    pathParams,
    _raw,
    body
  } = req;
  return {
    parameters: _raw.parameters,
    headers: _raw.headers,
    query: queryParams,
    path: pathParams,
    body
  }
}

function avoidAqlError(aql, variables) {
  const bindVars = Object.assign({}, alias(global.req), variables)
  let array = []
  for (var key in bindVars) array.push(`@${key}`);
  const query = `
    filter
      length([${array.join(" , ")}]) == ${array.length}
    ${aql}
  `
  return { query, bindVars }
}

module.exports = main;
