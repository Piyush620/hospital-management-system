require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer
};
