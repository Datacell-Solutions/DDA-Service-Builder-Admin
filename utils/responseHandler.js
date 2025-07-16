const sendResponse = (req, res, status, data) => {
  res.send({ Status: status, Data: data });
  return false;
};

module.exports = { sendResponse };
