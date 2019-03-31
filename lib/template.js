const createResponse = require('./create-response');
const resp = require('./resp');

function template({ req, res }, func, config, conditions) {
  global.req = req;
  global.res = res;
  try {
    var respObj;
    var preCheckResult = Array.isArray(conditions)
      ? preCheck({ req, res }, conditions)
      : true
    if (preCheckResult !== true) {
      const {
        status, body
      } = preCheckResult;
      respObj = !status && !body
        ? createResponse(preCheckResult, config)
        : preCheckResult
    } else {
      respObj = createResponse(func(req, res, config), config)
    }
    resp(res, respObj)
  } catch (e) {
    res.throw(e.code, e)
  } finally {
    delete global.req
    delete global.res
    delete req
    delete res
  }
};

function main(func, conditions, config) {
  return function(req, res, _next) {
    template({ req, res }, func, config, conditions)
  }
}

function preCheck({ req, res }, conditions) {
  for (const conf of conditions) {
    var check = conf(req, res)
    if (check !== true) {
      return check;
    }
  }
  return true;
}

module.exports = main;
