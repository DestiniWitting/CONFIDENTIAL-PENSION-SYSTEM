module.exports = {
  skipFiles: ["test"],
  istanbulReporter: ["html", "lcov", "text", "json"],
  mocha: {
    grep: "@skip-on-coverage",
    invert: true,
  },
};
