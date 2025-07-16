module.exports = {
  projects: [
    // {
    //   displayName: "hooks",
    //   preset: "ts-jest",
    //   testEnvironment: "node",
    //   moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    //   testMatch: ["<rootDir>/src/**/*.hooks.(test|spec).ts?(x)"],
    //   globals: {
    //     "ts-jest": {
    //       tsconfig: "tsconfig.json",
    //     },
    //   },
    //   moduleNameMapper: {
    //     "^~/(.*)$": "<rootDir>/$1",
    //   },
    // },
    {
      displayName: "hook",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
      testMatch: ["<rootDir>/src/**/*.(test|spec).ts?(x)"],
      globals: {
        "ts-jest": {
          tsconfig: "tsconfig.json",
        },
      },
      moduleNameMapper: {
        "^~/(.*)$": "<rootDir>/$1",
      },
    },
  ],
};
