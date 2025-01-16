// test-simple.js: Simple wrapper to run tests without Mocha, maximum backward compatibility

// Unified test runner with detailed logging
function runTest(testName, testLogic) {
  //console.log(`Running Test: ${testName}`);

  function done(input, expected, output) {
    const success = expected === output;
    const status = success ? "✅ SUCCESS" : "❌ FAILURE";

    console.log(
      `${status} - ${testName}\n` +
        `Input   : ${JSON.stringify(input)}\n` +
        `Expected: ${JSON.stringify(expected)}\n` +
        `Output  : ${JSON.stringify(output)}`
    );

    if (!success) {
      console.error(`Test failed for input: ${JSON.stringify(input)}`);
    }
  }

  try {
    testLogic(done);
  } catch (error) {
    console.error(`❌ ERROR - ${testName}\n${error.stack}`);
  }
}

// Tests for dark mode
runTest("Dark mode is enabled", function (done) {
  withLocalStorageKeySetup(["todomDarkMode"], function () {
    localStorage.setItem("todomDarkMode", "set");
    const output = isDarkMode();
    const expected = "set";
    done("set", expected, output);
  });
});

runTest("Dark mode is disabled", function (done) {
  withLocalStorageKeySetup(["todomDarkMode"], function () {
    localStorage.removeItem("todomDarkMode");
    const output = isDarkMode();
    const expected = null;
    done(null, expected, output);
  });
});

// Tests for list order
runTest("Reversed order is enabled", function (done) {
  withLocalStorageKeySetup(["todomListReverseOrder"], function () {
    localStorage.setItem("todomListReverseOrder", "set");
    const output = isReversed();
    const expected = "set";
    done("set", expected, output);
  });
});

runTest("Reversed order is enabled", function (done) {
  withLocalStorageKeySetup(["todomListReverseOrder"], function () {
    localStorage.removeItem("todomListReverseOrder");
    const output = isReversed();
    const expected = null;
    done(null, expected, output);
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

slugTests.forEach(function ({ input, expected }) {
  runTest(`Slugify`, function (done) {
    const output = processFilename(input);
    if (output && typeof output.then === "function") {
      // Handle asynchronous slugification
      output
        .then(function (result) {
          done(input, expected, result);
        })
        .catch(function (error) {
          console.error(`Error during slugification: ${error.message}`);
          done(input, expected, null);
        });
    } else {
      // Handle synchronous slugification
      done(input, expected, output);
    }
  });
});
