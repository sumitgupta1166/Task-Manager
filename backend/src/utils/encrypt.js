import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.AES_SECRET_KEY || "default_secret_key_32_chars!!!!!";

/**
 * Encrypt a string value using AES
 * @param {string} value - plain text to encrypt
 * @returns {string} - encrypted cipher text
 */
const encrypt = (value) => {
  if (!value) return value;
  return CryptoJS.AES.encrypt(String(value), SECRET_KEY).toString();
};

/**
 * Decrypt an AES encrypted string
 * @param {string} cipherText - encrypted text
 * @returns {string} - decrypted plain text
 */
const decrypt = (cipherText) => {
  if (!cipherText) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export { encrypt, decrypt };
