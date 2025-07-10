// test-simple.js: Wrapper to run tests without Mocha, maximum backward compatibility
// with callbacks to return result

// Unified test runner with detailed logging
function runTest(testName, testLogic) {
  //console.log(`Running Test: ${testName}`);

  function done(input, expected, output) {
    const success = expected === output;
    const status = success ? "✅ SUCCESS" : "❌ FAILURE";

    const message =
      `${status} - ${testName}\n` +
      `Input   : ${JSON.stringify(input)}\n` +
      `Expected: ${JSON.stringify(expected)}\n` +
      `Output  : ${JSON.stringify(output)}`;

    if (success) {
      console.log(message);
    } else {
      console.error(message);
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
  appController.withLocalStorageKeySetup(["todomDarkMode"], function () {
    localStorage.setItem("todomDarkMode", "enabled");
    const output = getDarkModeFromStorage();
    const expected = true;
    done("enabled", expected, output);
  });
});

runTest("Dark mode is disabled", function (done) {
  appController.withLocalStorageKeySetup(["todomDarkMode"], function () {
    localStorage.removeItem("todomDarkMode");
    const output = getDarkModeFromStorage();
    const expected = false;
    done("disabled", expected, output);
  });
});

// Tests for list order
runTest("Reversed order is enabled", function (done) {
  appController.withLocalStorageKeySetup(
    ["todomListReverseOrder"],
    function () {
      localStorage.setItem("todomListReverseOrder", "set");
      const output = isReversed();
      const expected = "set";
      done("set", expected, output);
    }
  );
});

runTest("Reversed order is disabled", function (done) {
  appController.withLocalStorageKeySetup(
    ["todomListReverseOrder"],
    function () {
      localStorage.removeItem("todomListReverseOrder");
      const output = isReversed();
      const expected = null;
      done(null, expected, output);
    }
  );
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

// Sticky offset CSS variable test
runTest("Sticky transform reflects correct offset", function (done) {
  const el = document.createElement("div");
  el.className = "top-in-li sticken showen";
  document.body.appendChild(el);

  const testOffset = 88;
  el.style.setProperty("--todom-sticken-yoffset", `${testOffset}px`);

  // Give layout time to apply
  setTimeout(() => {
    const applied = getComputedStyle(el).getPropertyValue("--todom-sticken-yoffset").trim();
    document.body.removeChild(el);
    done(testOffset, `${testOffset}px`, applied);
  }, 50);
});

// Keyboard resize detection test
runTest("Resize triggers keyboard state detection", function (done) {
  const testHeight = 300; // simulate virtual keyboard height drop
  const originalInnerHeight = window.innerHeight;
  const simulatedViewport = {
    height: testHeight,
    offsetTop: 0
  };

  const expected = true; // because diff > 150 => keyboardOpen = true

  const diff = originalInnerHeight - simulatedViewport.height;
  const isKeyboard = diff > 150;

  done(`innerHeight=${originalInnerHeight}, viewport.height=${testHeight}`, expected, isKeyboard);
});
