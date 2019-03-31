module.exports = function (res, {status, body}) {
  return res.status(status).send(
    typeof body === 'object'
      ? JSON.stringify(body)
      : body
  );
}
