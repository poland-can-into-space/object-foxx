const {
  joiAliases, main, AQL
} = require('../index.js');
const {
  str, bool, num
} = joiAliases()

const config = {
  servicePath: "/example",
  tag: "tag example",
  use: [
    function(_req, res, next) {
      res.headers["x-use-test"] = "hey this is an example!"
      next()
    }
  ],
  AQL: {
    returnRandom: `
      return RANDOM_TOKEN(@body.num)
    `,
    unix: `
      return DATE_NOW()
    `,
    bad: `
      return false
    `,
    error: `
      for i in COLLECTION_WHO_DOESN_T_EXIST
        return i
    `
  },
  conditions: {
    auth: function(req, _res) {
      return req.queryParams.auth == true
    },
    hacker: function(req, _res) {
      if (req.queryParams.isHacker) {
        return true;
      } else {
        return false;
      }
    },
    teaPod: function(_req, _res) {
      return {
        status: 200,
        body: {
          message: "arangodb doesn't support status code 418. sign the petition please!"
        }
      }
    }
  }
}

const routes = [
  {
    method: "get",
    path: "/hello-world",
    func: function() {
      const {
        friend, jpn
      } = req.queryParams
      const greet = !jpn ? `hello ${friend}` : `やあ ${friend}`

      return {
        greet
      };
    },
    request: {
      query: {
        friend: {
          schema: str().required(),
          info: "specify your name!"
        },
        jpn: {
          schema: bool().required().valid([true, false]),
          info: "it will greet in japanese when true"
        }
      }
    }
  },
  {
    method: "post",
    path: "/random-token/",
    func: function() {
      return AQL(`
        return RANDOM_TOKEN(@body.num)
      `)[0]
    },
    request: {
      body: {
        num: num().integer().required()
      }
    }
  },
  {
    method: "get",
    path: "/tea-cup",
    func: function() {
      // empty
    },
    conditions: [
      "teaPod"
    ]
  },
  {
    method: "get",
    path: "/try/:aql-key",
    func: function() {
      const aqlKey = req.pathParams["aql-key"]
      return AQL({ key: aqlKey });
    },
    request:  {
      path: {
        "aql-key": str().valid((function () {
          return Object.keys(config.AQL)
        })())
      }
    }
  },
  {
    method: "get",
    path: "/try/conditions",
    func: function() {
      return {
        status: 200,
        body: {
          message: "no issue!"
        }
      }
    },
    request: {
      query: {
        isHacker: bool().required().valid([true, false]),
        auth: bool().required().valid([true, false])
      }
    },
    conditions: [
      "hacker", "auth"
    ]
  }
]

main(routes, config);
try {
} catch (e) {
  console.error(e);
}
