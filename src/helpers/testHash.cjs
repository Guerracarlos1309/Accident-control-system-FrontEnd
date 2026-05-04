const bcrypt = require('bcryptjs');

const hash = "$2b$10$KwIB9ZtlUIGsUjhnUypfLO5b.aTH1UZhdPB.nV3b8YpDizFjZpXTK";

async function test() {
  console.log("123456: ", await bcrypt.compare("123456", hash));
  console.log("admin123: ", await bcrypt.compare("admin123", hash));
  console.log("admin: ", await bcrypt.compare("admin", hash));
  console.log("password: ", await bcrypt.compare("password", hash));
}
test();
