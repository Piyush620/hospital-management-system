require("dotenv").config();

const { connectTestDb, clearDatabase, disconnectTestDb, getTestMongoUri } = require("../src/test-utils/db");

const main = async () => {
  await connectTestDb();
  await clearDatabase();
  console.log(`Test database reset: ${getTestMongoUri()}`);
};

main()
  .catch((error) => {
    console.error("Failed to reset test database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectTestDb();
  });
