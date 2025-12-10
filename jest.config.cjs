const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "jsdom",
    roots: ["<rootDir>/tests"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(unified|remark-parse|remark-gfm|remark-math|remark-rehype|rehype-stringify|rehype-katex|rehype-highlight)/)",
  ],
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
        ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
            prefix: "<rootDir>/",
        }),
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    collectCoverageFrom: ["src/**/*.{ts,tsx}"],
    extensionsToTreatAsEsm: [".ts", ".tsx"],
};

