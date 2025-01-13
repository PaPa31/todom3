// test-simple.js: Simple wrapper to run tests without Mocha, maximum backward compatibility

function runTest(testName, testFunc) {
  console.log("Running Test: " + testName);
  try {
    var result = testFunc(function (error) {
      if (error) {
        console.error("❌ " + testName + " failed: " + error.message);
      } else {
        console.log("✅ " + testName + " passed");
      }
    });

    if (result && typeof result.then === "function") {
      result
        .then(function () {
          console.log("✅ " + testName + " passed");
        })
        .catch(function (error) {
          console.error("❌ " + testName + " failed: " + error.message);
        });
    }
  } catch (error) {
    console.error("❌ " + testName + " failed: " + error.message);
  }
}

// Wrapper for localStorage with backup/restore
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
runTest("Dark mode is enabled", function () {
  withLocalStorageSetup(function () {
    localStorage.setItem("todomDarkMode", "set");
    if (isDarkMode() !== "set") {
      throw new Error("Dark mode should be enabled");
    }
  });
});

runTest("Dark mode is disabled", function () {
  withLocalStorageSetup(function () {
    localStorage.removeItem("todomDarkMode");
    if (isDarkMode() !== null) {
      throw new Error("Dark mode should be disabled");
    }
  });
});

// Tests for list order
runTest("Reversed order is enabled", function () {
  withLocalStorageSetup(function () {
    localStorage.setItem("todomListReverseOrder", "set");
    if (isReversed() !== "set") {
      throw new Error("Reversed order should be enabled");
    }
  });
});

runTest("Reversed order is disabled", function () {
  withLocalStorageSetup(function () {
    localStorage.removeItem("todomListReverseOrder");
    if (isReversed() !== null) {
      throw new Error("Reversed order should be disabled");
    }
  });
});

// Slugification tests
[
  { input: "hello world", expected: "hello-world" },
  { input: "Привет мир", expected: "privet-mir" },
  { input: "你好，世界", expected: "ni-hao-shi-jie" },
  { input: "hello @world!", expected: "hello-world" },
].forEach(function (testCase) {
  runTest(
    'Input "' + testCase.input + '" should become "' + testCase.expected + '"',
    function (done) {
      var result = processFilename(testCase.input);
      if (result && typeof result.then === "function") {
        result
          .then(function (output) {
            if (output !== testCase.expected) {
              done(
                new Error(
                  'Expected "' + testCase.expected + '", got "' + output + '"'
                )
              );
            } else {
              done();
            }
          })
          .catch(function (error) {
            done(new Error("Error during slugification: " + error.message));
          });
      } else {
        if (result !== testCase.expected) {
          throw new Error(
            'Expected "' + testCase.expected + '", got "' + result + '"'
          );
        }
      }
    }
  );
});
