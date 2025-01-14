// test-simple.js: Simple wrapper to run tests without Mocha, maximum backward compatibility

function runTest(testName, testFunc) {
  console.log("Running Test: " + testName);
  try {
    // Execute the test function and capture its result
    var result = testFunc(function (error, output) {
      if (error) {
        console.error("❌ Failed:\n" + testName + "\n" + error.message);
      } else {
        console.log("✅ Passed:\n" + testName + '\nOutput  : "' + output + '"');
      }
    });

    // Handle promises returned from the test function
    if (result && typeof result.then === "function") {
      result
        .then(function (output) {
          console.log(
            "✅ Passed:\n" + testName + '\nOutput  : "' + output + '"'
          );
        })
        .catch(function (error) {
          console.error("❌ Failed:\n" + testName + "\n" + error.message);
        });
    }
  } catch (error) {
    console.error("❌ Failed:\n" + testName + "\n" + error.message);
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
  {
    input: "Очень длинный текст, превышающий лимит символов",
    expected: "ochen-dlinnyy-tekst-prevyshayushchiy-limit-simvo",
  },
].forEach(function (testCase) {
  runTest(
    'Input   : "' + testCase.input + '"\nExpected: "' + testCase.expected + '"',
    function (done) {
      var result = processFilename(testCase.input);
      if (result && typeof result.then === "function") {
        result
          .then(function (output) {
            if (output !== testCase.expected) {
              done(new Error('Output  : "' + output + '"'), null);
            } else {
              done(null, output); // Pass output on success
            }
          })
          .catch(function (error) {
            done(
              new Error("Error during slugification: " + error.message),
              null
            );
          });
      } else {
        if (result !== testCase.expected) {
          done(
            new Error(
              '\nExpected: "' +
                testCase.expected +
                '"\nOutput : "' +
                result +
                '"'
            ),
            null
          );
        } else {
          done(null, result); // Pass output on success
        }
      }
    }
  );
});
