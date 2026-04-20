const User = require("../models/User");

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "System Admin";

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existingAdmin) {
    return;
  }

  const admin = new User({
    fullName: adminName,
    email: adminEmail,
    role: "ADMIN",
  });
  admin.setPassword(adminPassword);
  await admin.save();

  console.log(`Initial admin created: ${adminEmail}`);
};

module.exports = seedAdmin;
