// test-controller.js: Tests using Mocha and Chai

defineTest("Verify that Chai is working correctly", function () {
  if (!window.expect) {
    throw new Error("'expect' is not available.");
  }
});

// Tests for earliest-togglers.js
defineTest("Dark mode is enabled", function () {
  localStorage.setItem("todomDarkMode", "set");
  const result = isDarkMode();
  if (result !== "set") {
    throw new Error(`Expected 'set', got: ${result}`);
  }
});

defineTest("Dark mode is disabled", function () {
  localStorage.removeItem("todomDarkMode");
  const result = isDarkMode();
  if (result !== null) {
    throw new Error(`Expected 'null', got: ${result}`);
  }
});

defineTest("Default date mode", function () {
  localStorage.removeItem("todomDateMode");
  const result = getDateMode();
  if (result !== MODES.HIDE_BOTH) {
    throw new Error(`Expected '${MODES.HIDE_BOTH}', got: ${result}`);
  }
});

defineTest("Toggling date mode", function () {
  const initialMode = getDateMode();
  const nextMode = toggleDateMode();
  if (nextMode !== (initialMode + 1) % 4) {
    throw new Error(`Expected '${(initialMode + 1) % 4}', got: ${nextMode}`);
  }
});

// Tests for list-order.js
defineTest("Reversed list order is enabled", function () {
  localStorage.setItem("todomListReverseOrder", "set");
  const result = isReversed();
  if (result !== "set") {
    throw new Error(`Expected 'set', got: ${result}`);
  }
});

defineTest("Reversed list order is disabled", function () {
  localStorage.removeItem("todomListReverseOrder");
  const result = isReversed();
  if (result !== null) {
    throw new Error(`Expected 'null', got: ${result}`);
  }
});

defineTest("Adding the 'reversed' class", function () {
  const contentElement = document.getElementById("content");
  toggleReversedMode();
  if (!contentElement.classList.contains("reversed")) {
    throw new Error("Expected 'reversed' class to be added.");
  }
});

defineTest("Removing the 'reversed' class", function () {
  const contentElement = document.getElementById("content");
  toggleReversedMode();
  toggleReversedMode();
  if (contentElement.classList.contains("reversed")) {
    throw new Error("Expected 'reversed' class to be removed.");
  }
});

// Tests for latinization and slugification
defineTest("Latinization and slugification tests", function () {
  const testCases = [
    // Simple Latinized Text
    { input: "hello world", expected: "hello-world" },
    { input: "dynamic-slugifier", expected: "dynamic-slugifier" },
    { input: "neobrabotannyye dannyye", expected: "neobrabotannyye-dannyye" },

    // Non-Latin Script
    { input: "Привет мир", expected: "privet-mir" },
    { input: "مرحبا بالعالم", expected: "mrhb-blaalm" },
    { input: "你好，世界", expected: "ni-hao-shi-jie" },

    // Mixed Script
    { input: "Привет 123 world", expected: "privet-123-world" },
    { input: "مرحبا Hello", expected: "mrhb-hello" },
    { input: "你好123world", expected: "ni-hao-123-world" },

    // Special Characters
    { input: "hello @world!", expected: "hello-world" },
    { input: "Привет! Мир?", expected: "privet-mir" },

    // Excessively Long Inputs
    {
      input:
        "This is a very long string that exceeds fifty characters in length",
      expected: "this-is-a-very-long-string-that-exceeds-fifty-ch",
    },
    {
      input: "Очень длинный текст, превышающий лимит символов",
      expected: "ochen-dlinnyy-tekst-prevyshayushchiy-limit-simvo",
    },

    // Edge Cases
    { input: "", expected: "" },
    { input: "     ", expected: "" },
    { input: "@#$%^&*", expected: "" },
    { input: "𐍈𐍈𐍈", expected: "unknown" },
  ];

  testCases.forEach(({ input, expected }) => {
    const output = processFilename(input);
    if (output !== expected) {
      throw new Error(
        `\nInput   : "${input}"\nExpected: "${expected}"\nOutput  : "${output}"\n`
      );
    }
  });
});
