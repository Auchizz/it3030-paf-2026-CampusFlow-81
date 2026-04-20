const crypto = require("crypto");

const base64UrlEncode = (value) =>
  Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value) => {
  const paddedValue = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  return JSON.parse(Buffer.from(paddedValue.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
};

const getSecret = () => process.env.JWT_SECRET || "change-this-local-development-secret";

const sign = (value) =>
  crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const createToken = (user) => {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlEncode({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  });

  const signature = sign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
};

const verifyToken = (token) => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature || sign(`${header}.${payload}`) !== signature) {
    throw new Error("Invalid token");
  }

  const decodedPayload = base64UrlDecode(payload);

  if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return decodedPayload;
};

module.exports = {
  createToken,
  verifyToken,
};
