const crypto = require("crypto");

const KEY_LENGTH = 64;
const PREFIX = "scrypt$";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PREFIX}${salt}$${hash}`;
}

function isHashed(stored) {
  return typeof stored === "string" && stored.startsWith(PREFIX);
}

function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;

  // contas antigas guardavam a senha em texto puro; aceitas e migradas no login
  if (!isHashed(stored)) {
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  const [, salt, hash] = stored.split("$");
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, KEY_LENGTH);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

module.exports = { hashPassword, verifyPassword, isHashed };
