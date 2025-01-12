// test-config.js

const testConfig = {
  sampleData: {
    notes: ["Note 1", "Note 2", "Note 3"],
    files: ["file1.txt", "file2.txt"],
  },
  utilities: {
    log(message) {
      console.log(`[Test Log]: ${message}`);
    },
    validate(condition, errorMessage) {
      if (!condition) {
        throw new Error(errorMessage);
      }
    },
  },
};

// Export to global scope for compatibility
window.testConfig = testConfig;
