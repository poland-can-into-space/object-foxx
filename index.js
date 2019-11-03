const template = require('./lib/template');
const AQL = require('./lib/AQL');
const jsonServerRoutes = require('./lib/json-server-foxx');
const replaceConditions = require('./lib/replace-conditions');

function newRouter(router) {
  if (!router) {
    const createRouter = require('@arangodb/foxx/router')
    return createRouter()
  } else {
    return router;
  }
}

function aqlValidation(config) {
  const db = require("@arangodb").db;
  function save(object, id, error) {
    db._collection("ObjectFoxx_Main").save(Object.assign({
      id,
      TYPE: "AQL_PRECHECK",
      error
    }, object))
  }

  const id = Date.now()
  for (const key in config.AQL) {
    var aql = config.AQL[key]
    console.log(aql);
    try {
      const result = db._createStatement(aql).parse()
      save(result, id, null)
    } catch (e) {
      save({aql}, id, e)
    }
  }
}

function main(routes, config, router) {
  if (config.AQL) {
    aqlValidation(config)
  }
  global._json_server_config = config
  const { servicePath, tag } = config;
  var r = newRouter(router);
  for (const use of global._json_server_config.use) r.use(servicePath, use)
  delete global._json_server_config.use;

  // build routes
  for (const route of routes) {
    var { method, path } = route;
    var replacedConditions = replaceConditions(route.conditions, {
      method, path
    }, config.conditions)
    var templateFunction = template(route.func, replacedConditions, config)
    assignParameter(route, templateFunction, r)
  }

  if (global._json_server_config.noAdditionalRoutes !== true) {
    const distinguish = JSON.parse(JSON.stringify(new Date))
    jsonServerRoutes(distinguish);
  }
  Object.freeze(global._json_server_config);
  module.context.use(servicePath, r, tag);
}

function assignParameter(route, template, r) {
  const {
    method, path
  } = route;
  const newR =  r[method](path, template)
  if (typeof route.request === 'object') {
    registerParam(route.request, newR)
  }
}

function registerParam(request, newR) {
  const joi = require("joi")
  const convertKey = (key) => ({
    headers: "headerParam",
    query: "queryParam",
    path: "pathParam"
  }[key])
  for (var key in request) {
    var param = request[key];
    if (key === "body") {
      if (param.isJoi === true) {
        newR.body(param);
      } else {
        newR.body(joi.object(param));
      }
    } else {
      for (var k in param) {
        if (param[k].isJoi===true) {
          var schema = param[k];
          var info = ""
        } else {
          var { schema, info } = param[k];
        }
        console.log({key: k, type: schema._type});
        newR[convertKey(key)](k, schema, (info || "no info"))
      }
    }
  }
  return newR;
}

/*
const config = {
  conditions: {

  },
  use: [

  ],
  servicePath: "/",
  template: function () {

  },
  noAdditionalRoutes: false // setting to false will disallow jsonServer to expose
}
const exampleRoute = {
  method: "get",
  path: "/path",
  func: function (req, res) {

  },
  request: {
    query: {
      parameter: true
    }
  },
  response: {

  },
  conditions: []
}
*/
const joiAliases = require("./lib/joi-aliases")
module.exports = {
  main, joiAliases, AQL
};
