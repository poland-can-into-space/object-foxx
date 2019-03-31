# Object-Foxx
spend less time writing foxx.
## About
I wanted something that will automatically parse AQL and let me ignore everything that I didn't like, like writing router.get yada yada.

## Getting started
### Object style routes
1. In a nutshell

There are 2 kinds of object you must define; one is for defining http routes(Routes Object) and another is for configuring the functions for DRY(Config object).

2. Routes Object

Schema is as follow

```
{
  method: "get", // http method for this route
  path: "/path/to/this/route",
  func: function() {
    const queryResult = //some database query
    return queryResult
  },
  request: {
    body: // joi schema for request body. doesn't work on get method
    // body is the equivalent of router.body(*joi-schema*)
    query: {
      // joi schema for query parameter. only works in get method
      // note that the key in this property must match the name of the parameter
      [key]: {
        schema: scheme -> joi object
        info: string -> description for the  parameter.
      }
    },
    headers: {
      // note that the key in this property must match the name of the parameter
      [key]: {
        schema: scheme -> joi object
        info: string -> description for the  parameter.
      }
    },
    path: {
      // note that the key in this property must match the name of the parameter
      [key]: {
        schema: scheme -> joi object
        info: string -> description for the  parameter.
      }
    },
    // joi schema for path params.
    // note that the key in this property must match the name of the parameter
  },
  response: [
    {
      status:  //status code,
      schema:  // joi schema,
      body:    // optional,
    }
    // values returned from function registered at func property will be validated with joi schema registered here if any.
    // If nothing is defined, value will be validated with the function that will decide which status-code to use.
  ],
  conditions: [
    // array of strings
    // strings must be a key to functions registered with config object(description below)
    // function at the func property will be invoked only when the request parameter passes the functions here.
  ]
}
```

3. Config Object
Schema is as follow:

```
{
  servicePath: // string. prefix for the mounted path
  noAdditionalRoutes: // when set to false, object-foxx will not expose it's api for accessing results of the check it did for aqls and such.
  use: {
  // object or array with functions: functions passed here will be registered to the router object;
  // like -> router.use(func)
  },
  aqls: {
  // object with strings: you will put your aql string here.
  // Every aql string within the object will be checked everytime when you upload your foxx script
  // you are able to use request parameter without explicitly defininig the bindVars;
  // @body -> request body
  // @path -> pathParams
  // @query -> queryParams
  // @headers -> request headers
  },
  conditions: {
  // object with functions: you will put functions you would wish to use prior to to the execution of middleware.
  // You can call these functions by passing corresponding key in the routes object's condition property.
  }
}
```

### useful functions
The project exports 3 different functions.

```
  const {
    main,
    joiAliases,
    AQL
  } = require('object-foxx')
```

1. joiAliases
It's just a alias for joi. Allows you to type less.
The function will return following object;

```
  {
    any: joi.any,
    object: joi.object,
    string: joi.string,
    number: joi.number,
    array: joi.array,
    boolean: joi.boolean,
    obj: object,
    str: string,
    num: number,
    array: array,
    bool: boolean,
    // additional
    int: number().integer(),
    float: number().float()
  }
```

2. AQL

  You are required to use every variables you pass to db.\_query for executing aql which is sometime daunting.
  AQL takes a string or object as a first argument:
  - Object
  when the argument is an object, it must have a `key` property which value must correspond with the aql string you have passed on config-object which was mentioned earlier.
  - String
  When a string is passed, it must be a aql query.
  you are able to access the request parameters with just like the aql functions you registered with the config object.

_notes_
Some may argue that this function may result in higher chance of errors;
Since arangodb validates every incoming requests when it arrives with joi,
I believe explicit declaration of query parameters are overkill.

3. main

  - arg1
  you will pass array of routes object here.
  - arg2
  you will pass the config object

``main(arg1, arg2)``
