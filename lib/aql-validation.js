function save(object, id, error) {
  const db = require("@arangodb").db;
  db._collection("ObjectFoxx_Main").save(Object.assign({
    id,
    TYPE: "AQL_PRECHECK",
    error
  }, object))
}


function main(config) {
  const id = Date.now()
  for (const aql of config.AQL) {
    try {
      const result = db._createStatement(stmt).parse(aql)
      save(result, id, null)
    } catch (e) {
      save({aql}, id, e)
    }
  }
}

exports.modules = main;
