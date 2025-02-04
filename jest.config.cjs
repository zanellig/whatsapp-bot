/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest", // Use ts-jest preset
  testEnvironment: "node", // Use Node as the test environment
  // Resolve your "~/*" alias defined in tsconfig.json
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
  },
  // Force Jest to run tests in a single process.
  // (This avoids excessive process spawning and high RAM usage.)
  maxWorkers: 1,
};
