# Object-Foxx
spend less time writing foxx.
## About
I wanted something that will automatically parse AQL and let me ignore everything that I didn't like, like writing router.get yada yada.

## features!  
1. Automatic AQL validation  
Any aql string registered at config object will be validated.  
2. Alias for joi  
It has a convinient function that exports alias for joi.
`joi.string().required()` will become `str().required()`.
3. Methods are easier
```
router.get("/path", function(req, res){
  // do stuff
  const aqlResult = db._query({
    query: "query string",
    bindVars: {
      // lots of properties
    }
  })
  if (aqlResult == something) {
    // complicated stuff
    res.status(200).send(JSON.stringify(aqlResult))
  } else {
    res.status(404).send(JSON.stringify(notFound))
  }
})
.queryParam("userId", str().required())
.queryParam("phoneNumber", int().required())
```
will become
```
{
  method: "get",
  path: "/",
  func: function() {
    return AQL(`
      for c in @@Collection
        filter
          c.user == @query.userId
          && c.contact.phoneNumber == @query.phoneNumber
        limit 1
      return c
    `)
  },
  query: {
    userId: str().required(),
    phoneNumber: int().required()
  }
}
```
You no longer need to decide which status code to use and stringifying values. This framework will automatically assign the right property for bindVars and stringify values should it be an object.

- status code
It uses following table to decide;

|value|status code|
---|---|
|undefined|501|
|false|403|
|true|204|
|null|404|
|other than above|200|
_NOTES_  
If the returned value is an array with 1 element, status code will be decided based on the above table.

- response body

|value|what will happen|
|---|---|
|value which is a object but not null|JSON.stringify(value) will becomes the body|
|non-object value|JSON.stringify({data: value}) will become the body|

- assigning status code and response body explicitly

You can return a object with status and body property.  
`{status: number, body: value } `  
number at status will become the status code while body will become the response body.

## Getting started
1. Routes Object

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
