module.exports = {
    plugins: ["security"],
    extends: ["plugin:security/recommended"],
    rules: {
      // Downgrade noisy rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-child-process": "warn",
  
      // Block only real risks
      "security/detect-eval-with-expression": "error",
      "security/detect-unsafe-regex": "error"
    }
  };
  