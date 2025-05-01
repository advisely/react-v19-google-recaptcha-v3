module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transformIgnorePatterns: [
    "/node_modules/(?!.*).+\\.(js|jsx|ts|tsx)$"
  ]
};