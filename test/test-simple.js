// test-simple.js: Simple wrapper to run tests without Mocha

function runTest(testName, testFunc) {
  try {
    console.log(`Running Test: ${testName}`);
    testFunc();
    console.log(`✅ ${testName} passed`);
  } catch (error) {
    console.error(`❌ ${testName} failed: ${error.message}`);
  }
}

// Dark Mode Tests
runTest("Dark mode is enabled", () => {
  localStorage.setItem("todomDarkMode", "set");
  if (isDarkMode() !== "set") throw new Error("Dark mode should be enabled");
});

runTest("Dark mode is disabled", () => {
  localStorage.removeItem("todomDarkMode");
  if (isDarkMode() !== null) throw new Error("Dark mode should be disabled");
});

// List Order Tests
runTest("Reversed order is enabled", () => {
  localStorage.setItem("todomListReverseOrder", "set");
  if (isReversed() !== "set")
    throw new Error("Reversed order should be enabled");
});

runTest("Reversed order is disabled", () => {
  localStorage.removeItem("todomListReverseOrder");
  if (isReversed() !== null)
    throw new Error("Reversed order should be disabled");
});

// Slugification Tests
[
  { input: "hello world", expected: "hello-world" },
  { input: "Привет мир", expected: "privet-mir" },
  { input: "你好，世界", expected: "ni-hao-shi-jie" },
  { input: "hello @world!", expected: "hello-world" },
].forEach(({ input, expected }) => {
  runTest(`Input "${input}" should become "${expected}"`, async () => {
    const output = await processFilename(input);
    if (output !== expected)
      throw new Error(`Expected "${expected}", got "${output}"`);
  });
});
