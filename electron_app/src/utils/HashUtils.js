const CryptoJS = require('crypto-js');

const hashPassword = password => {
  const strngToHash = password;
  return CryptoJS.SHA256(strngToHash).toString(CryptoJS.enc.Base64);
};

module.exports = { hashPassword };
