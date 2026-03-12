const mongoose = require("mongoose");

const getTestMongoUri = () =>
  process.env.TEST_MONGO_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/hms_test";

const connectTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(getTestMongoUri());
};

const clearDatabase = async () => {
  const collections = Object.values(mongoose.connection.collections);

  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

const disconnectTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = {
  getTestMongoUri,
  connectTestDb,
  clearDatabase,
  disconnectTestDb
};
