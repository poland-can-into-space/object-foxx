module.exports = main;
function main() {
  const joi = require('joi')
  // default
  const _default = {
    any: joi.any,
    object: joi.object,
    string: joi.string,
    number: joi.number,
    array: joi.array,
    boolean: joi.boolean,
  }
  const {
    boolean,
    object,
    string,
    number,
    array,
  } = _default;
  return Object.assign(_default, {
    // shorter
    obj: object,
    str: string,
    num: number,
    array: array,
    bool: boolean,
    // additional
    int: number().integer,
    float: number
  })
};
