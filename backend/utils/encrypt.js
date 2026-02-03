const CryptoJS = require("crypto-js");

exports.encrypt = (text) => {
  const SECRET = process.env.MSG_SECRET;
  if (!SECRET) throw new Error("MSG_SECRET not defined");

  return CryptoJS.AES.encrypt(text, SECRET).toString();
};

exports.decrypt = (cipher) => {
  const SECRET = process.env.MSG_SECRET;
  if (!SECRET) throw new Error("MSG_SECRET not defined");

  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};
