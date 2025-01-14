// test-simple.js: Simple wrapper to run tests without Mocha, maximum backward compatibility

// Unified test runner
function runTest(testName, testFunc) {
  //console.log("Running Test: " + testName);

  function done(error, output) {
    if (error) {
      console.error("❌ " + testName + "\n" + error.message);
    } else {
      console.log("✅ " + testName + '\nOutput  : "' + output + '"');
    }
  }

  try {
    const result = testFunc(done); // Pass `done` to the test function

    // Handle asynchronous tests that return promises
    if (result && typeof result.then === "function") {
      result
        .then(function (output) {
          done(null, output);
        })
        .catch(function (error) {
          done(error, null);
        });
    }
  } catch (error) {
    done(error, null);
  }
}

// Wrapper for localStorage with backup/restore functionality
function withLocalStorageSetup(testFunc) {
  var originalStorage = {};
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    originalStorage[key] = localStorage.getItem(key);
  }

  try {
    testFunc();
  } finally {
    localStorage.clear();
    for (var key in originalStorage) {
      localStorage.setItem(key, originalStorage[key]);
    }
  }
}

// Tests for dark mode
//runTest("Dark mode is enabled", function (done) {
//  withLocalStorageSetup(function () {
//    localStorage.setItem("todomDarkMode", "set");
//    var output = isDarkMode();
//    if (output !== "set") {
//      done(new Error("Dark mode should be enabled"), null);
//    } else {
//      done(null, output);
//    }
//  });
//});
runTest("Dark mode is enabled", function () {
  withLocalStorageSetup(function () {
    localStorage.setItem("todomDarkMode", "set");
    if (isDarkMode() !== "set") {
      throw new Error("Dark mode should be enabled");
    }
  });
});

runTest("Dark mode is disabled", function (done) {
  withLocalStorageSetup(function () {
    localStorage.removeItem("todomDarkMode");
    var output = isDarkMode();
    if (output !== null) {
      done(new Error("Dark mode should be disabled"), null);
    } else {
      done(null, output);
    }
  });
});

// Tests for list order
runTest("Reversed order is enabled", function (done) {
  withLocalStorageSetup(function () {
    localStorage.setItem("todomListReverseOrder", "set");
    var output = isReversed();
    if (output !== "set") {
      done(new Error("Reversed order should be enabled"), null);
    } else {
      done(null, output);
    }
  });
});

runTest("Reversed order is disabled", function (done) {
  withLocalStorageSetup(function () {
    localStorage.removeItem("todomListReverseOrder");
    var output = isReversed();
    if (output !== null) {
      done(new Error("Reversed order should be disabled"), null);
    } else {
      done(null, output);
    }
  });
});

// Slugification tests
var slugTests = [
  { input: "hello world", expected: "hello-world" },
  { input: "Привет мир", expected: "privet-mir" },
  { input: "你好，世界", expected: "ni-hao-shi-jie" },
  { input: "hello @world!", expected: "hello-world" },
  {
    input: "Очень длинный текст, превышающий лимит символов",
    expected: "ochen-dlinnyy-tekst-prevyshayushchiy-limit-simvo",
  },
];

slugTests.forEach(function (testCase) {
  runTest(
    'Slugify\nInput   : "' +
      testCase.input +
      '"\nExpected: "' +
      testCase.expected +
      '"',
    function (done) {
      var result = processFilename(testCase.input);
      if (result && typeof result.then === "function") {
        // Handle async slugification
        result
          .then(function (output) {
            if (output !== testCase.expected) {
              done(new Error(`Output  : "${output}"`), null);
            } else {
              done(null, output);
            }
          })
          .catch(function (error) {
            done(
              new Error(`Error during slugification: ${error.message}`),
              null
            );
          });
      } else {
        // Handle sync slugification
        if (result !== testCase.expected) {
          done(new Error(`\nOutput  : "${result}"`), null);
        } else {
          done(null, result);
        }
      }
    }
  );
});
