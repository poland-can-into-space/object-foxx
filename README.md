# Object-Foxx
## About
Reducing learning/development cost for ArangoDB foxx.

## features!  
1. Automatic AQL validation  
Any aql string registered at config object will be validated upon uploading foxx.
Debugging made easier!  
2. Alias for joi  
It has a convenient function that exports alias for joi.
`joi.string().required()` will become `str().required()`.
3. Error handling block    
The framework will take care of them behind the hood.

## Comparison  
### In a nutshell
Each route will be represented as a javascript object.

### Code
Below is an example of hypothetical API for outerspace restaurant search engine.
- traditional
```
router.get("/humans/:planet/restaurant", function(req, res) {
  try {
    if (!notDDOS(req)) return res.status(403).json({})
    else if (!humanRequest(req)) return res.status(403).json({})
    else {
      const {
        planet
      } = req.pathParams
      const {
        food, race
      } = req.queryParams
      const result = db.query({
        query: `
          for p in Planets
            filter
              p.planet == @planet
            limit 1
          for r in Restaurant
            filter
              r.food == @food
              && !HAS(r.segregation, "humans")
          for g in Guide
            filter
              HAS(g.languages, @race)
            limit 100
          return MERGE(r,{
            language: g.languages
          })
        `,
        bindVars: {
          planet, food, race
        }
      })._documents
      if (result[0] !== null) {
        res.status(200).json(result)
      } else {
        res.status(404).json(result)
      }
    }
  } catch (e) {
     res.throw(500, e)
  }
})
.queryParam("food", joi.string().required(), "category for food")
.queryParam("race", joi.string().required().valid(["Octopus", "Gray", "EarthMan", "MoonMan"]), "your race")
.summary("returns a good restruant in outer space who accepts humans.")
```
- object foxx way
```
  {
    method: "get",
    path: "/humans/:planet/restaurant/",
    func: function(){
      return AQL({key: "galaxticRestaurants"})
    },
    request: {
      query: {
        race: {
          schema: str().required().valid(["Octopus", "Gray", "EarthMan", "MoonMan"]),
          info: "your race"
        },
        food: {
          schema: str().required(),
          info: "category for food"
        }
      }
    },
    condition: [
      "ddos", "humanRequest"
    ],
    info: {
      summary: "returns a good restruant in outerspace who accepts humans"
    }
  }
```
You'd notice there is a big difference.
Main objective of Object-foxx is to simplify things and they will be expained below.

# joiAliases function
- what it does  
It supplies you with joi's alias so that you can type less.
- how to import  
`const {joiAliases} = require("object-foxx")`
- how to use  
Note that you don't need to use every each one of them.
```
const {
  boolean,
  object,
  string,
  number,
  array,
  obj,    //object
  str,    // string
  num,    // number
  bool,   // boolean,
  int,    // umber().integer,
  float,  // number
} = joiAliases();
```
- table

|  property name  |  value behind it  |
| ---- | ---- |
|  boolean  |  joi.boolean |
|  bool  |  joi.boolean  |
|  string  |  joi.string |
|  str  |  joi.string |
|  number  |  joi.number |
|  num  |  joi.number  |
|  int  |  joi.number().integer  |
|  float  |  joi.number  |
|  object  | joi.object |
|  obj  |  joi.object  |
|  array  |  joi.array |

# AQL function
- what it does  
You can execute AQL query without explicitly defining the bindVars. Request body, query, path and headhers will be accessible without defininig it.  
To give you an example;
AQL query that looked like this
```
db._query({
  query: `
    for a in Admins
      filter
        a.authorization == @authorization
      limit 1
    for m in MarsPeople
      filter
        m.race == @race
        && m.skinColor == @skinColor
      limit 5
    return m
  `,
  bindVars: {
    race: req.queryParams.race,
    skinColor: req.queryParams.skinColor,
    authorization: req.headerParams["x-strong-token"]
  }
})._documents
```
will look like this with the AQL function :)
```
AQL(`
  for a in Admins
    filter
      a.authorization == @headers.authorization
    limit 1
  for m in MarsPeople
    filter
      m.race == @query.race
      && m.skinColor == @query.skinColor
    limit 5
  return m
`)
```
- how to import  
`const {AQL} = require("object-foxx")`
- how to use  
`AQL(arg1, arg2)`  
- arg1   
arg1 must be either a string of aql query or object with key property whose value is a string.   
example: `{key: "some value"}`  
When arg1 is supplied with object, it will look for a corresponding query string in `config object`'s `AQL` property.  
It is recommended that any object you wish to use to be supplied in `config object`'s `AQL` property as they will be checked for errors when the foxx is uploaded.
- arg2   
arg2 must be an object but you need not to supply it unless you have a particular values you wish to use in AQL, which is not available in the `req` object.  

# main function
- what it does  
You no longer need to specify the value
- how to import  
`const {main} = require("object-foxx")`
- how to use  
`main(arg1, arg2, arg3 \\ optional)`  
arg1 must be an array of route object(explained later).  
arg2 must be an config object.  
arg3 is optionlal; if you are trying to use routes you have written already, you can pass the router object (the one you made with `createRouter()`).

## Format
### Config Object
Detail about every properties are explained later.
|  property name  |  value that should be passed  |
| ---- | ---- |
|  AQL  |  object(or array) of strings |
|  use  |  array of functions  |
|  conditions  |  object(or array) of functions |
|  servicePath  |  string  |

1. AQL  
`AQL` property must be an object(or array) with aql strings.
Any strings passed here will be parsed with `db._createStatement(string).parse()` method so that it can identify any aql query with errors.  
Results will be stored in `ObjectFoxx-Main` collection.

2. use  
`use` property must be supplied with array of functions. Every functions within the array will be registered with `router.use(func)`.

3. conditions  
`conditions` property must be supplied with object(or array) whose value(element) must be a function.
Any functions registered in `conditions` can be specified in Route Object's `conditions` property **(explained later)** to be used prior to execution of a function registered with `func`.

3. servicePath  
`servicePath` property must be a string. The value passed here will be used in `module.context.use(servicePath)` and will become the prefix for the foxx service.

### Route Object  
Detail about every properties are explained later.
|  property name  |  value that should be passed  | is it optional? |
| ---- | ---- | --- |
|  method  | string | mandatory |
|  path  | string  |mandatory |
|  func  |  function |mandatory |
|  request  |  object(details explained later)  | optional|
|  response  |  object(detials explained later)  |optional|
|  conditions  |  array of strings  |optional|

1. method  
Method for the http request which the route is going to handle. It is not case sensitive.  
Example: `{method: "get"}`
2. path  
Path of the route.  
Example: `{path: "/foxx-route/:collection-name/:document-key/fetch-all"}`
3. func  
Function for the route.
The function given for `func` property is expected to return a value.
The framework will evaluate the returned value and decide which status code to apply.
The table for status code deciding process is as follow.  

- When the returned property is an single element array

|value of the element|status code|
---|---|
|undefined|501|
|false|403|
|true|204|
|null|404|
|other than above|200|
- When the returned property is an array

|value|status code|
---|---|
|undefined|501|
|false|403|
|true|204|
|null|404|
|other than above|200|

- When the returned property is an array with more than 2 elements

|value|status code|
---|---|
|array with more than 2 elements|200|

However, if you wish to decide the status code on your own, you can return a object with status property and body property like this.
```
{
  status: <<status code>>,
  body: <<some value>>
}
```
number at the status will become the status code while value in the body will become the response body. If the value on the body is not an object, framework will generate a object with single property `data` and the value that was on the body property will be assigned there.  
Example: `{data: "value at body"}`

4. request  
`request` property is where you define the required request parameter.
Following table summrizes the what each property does.

|property name|what it does|
---|---|
|path|defines the path parameter. details are explained later.|
|body|equivalent of `router.body(schema)`|
|query|defines query parameter. details are explained later.|
|headers|defines the header parameter.  details are explained later.|

### query, path and headers
While body is simple as the `schema` provided will just be passed onto  `router.body(schema)`, other 3 works little bit different.  
Object-Foxx provide 2 different way of defining them.
- schema and infomation  
If you are planning to provide a description the parameter, provide a object with `schema` property and `info` property.
`schema` property must be provided with joi schema while `info` property must be provided with string that summerizes the parameter.
Example:
```
reqeust: {
  path: {
    pathKey: {
      schema: joi schema,
      info: "string of information about the parameter"
    }
  },
  query: {
    querykey: {
      schema: joi schema,
      info: "string of information about the parameter"
    },
    anotherQuery: {
      schema: joi schema2,
      info: "info2"
    }
  }
}
```  
Is equivalent of   
```
.pathParam("pathKey", pathKey.schema, pathKey.info)
.queryParam("queryKey", queryKey.schema, queryKey.info)
.queryParam("anotherQuery", anotherQuery.schema, anotherQuery.info)
```
- without information about the parameter  
When you need not to provide any information, you can simply provide it with a joi schema.
Example:
```
reqeust: {
  path: {
    pathKey: joi schema
  },
  query: {
    querykey: joi schema,
    anotherQuery:  joi schema
  }
}
```  
is equivalent of   
```
.pathParam("pathKey", pathKey, "no info")
.queryParam("queryKey", queryKey, "no info")
.queryParam("anotherQuery", anotherQuery, "no info")
```
5. response  
`response` is different from `router.response()` in foxx.
You may want to decide which status code to value returned from `func`
```
response: [
  {
    schema: joi schema,
    status: number,
  }
]
```
6. conditions  
Strings within the array must correspond with the properties of the functions supplied at `conditions` in Config object.  
For example, some of your routes may require user to have a special status. Say, the user had to have an **admin** previlige. Client request will come with userId but you need to execute AQL in order to figure out if the user is an **admin** or not.  
You don't want to specify that in `router.use()` as it will give negative impact on the overall response time, but you don't really want to use a separate router object for this.
In this case, `conditions` will suit as you only need to pass a string to `conditions` object like this.  
Example: `conditions: ["isAdmin"]`

## Future remarks  
Things that I'd love to do:
- GUI Foxx route editor
- Improving debugging experience
- Better document
