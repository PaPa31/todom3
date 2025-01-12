// test-runner.js: Simple wrapper for running tests

const testRunner = {
  tests: [],
  addTest(testName, testFunc) {
    this.tests.push({ testName, testFunc });
  },
  runAllTests() {
    this.tests.forEach(({ testName, testFunc }) => {
      try {
        console.log(`Running test: ${testName}`);
        testFunc();
        console.log(`✅ ${testName} passed`);
      } catch (error) {
        console.error(`❌ Error in test ${testName}:`, error.message);
      }
    });
  },
};

// Make available globally
window.testRunner = testRunner;
