export default {
  testEnvironment: "node",
  transform: {},
  moduleNameMapper: {
    "^#(.*)$": "<rootDir>/$1",
  },
  setupFiles: ["dotenv/config"],
};
