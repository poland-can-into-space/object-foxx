module.exports = main;

function main(id) {
  return function () {
    const joi = require("joi")
    return [
      {
        method: "get",
        path: "/_object-foxx/aql-check",
        func: function () {
          return AQL(`
            let a_unset = (
              filter
                @queryParams["full-document"]
              return ["parseResult", "timestamp"]
            )
            for i in JsonServer_Main
              filter
                i.TYPE == "AQL_PRECHECK"
                && i.error == @queryParams["is-error"]
                && i._distinguish == ${id}
              return UNSET(i, a_unset)
          `)
        },
        request: {
          query: {
            "is-error": {
              schema: joi.boolean().required().default(true),
              info: "it will return aql with error when you put true"
            },
            "full-document": {
              schema: joi.boolean().required().default(false),
              info: "document may be lengthy; set false to make it short"
            }
          }
        }
      }
    ]
  }
}
