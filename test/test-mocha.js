// test-mocha.js: Tests for Mocha and Chai

describe("Checking if Chai works", function () {
  it("'expect' should be available", function () {
    expect(true).to.be.true;
  });
});

describe("Tests for earliest-togglers.js", function () {
  let originalDarkMode, originalDateMode;

  beforeEach(function () {
    originalDarkMode = localStorage.getItem("todomDarkMode");
    originalDateMode = localStorage.getItem("todomDateMode");
  });

  afterEach(function () {
    if (originalDarkMode !== null) {
      localStorage.setItem("todomDarkMode", originalDarkMode);
    } else {
      localStorage.removeItem("todomDarkMode");
    }

    if (originalDateMode !== null) {
      localStorage.setItem("todomDateMode", originalDateMode);
    } else {
      localStorage.removeItem("todomDateMode");
    }
  });

  it("Dark mode enabled", function () {
    localStorage.setItem("todomDarkMode", "set");
    expect(isDarkMode()).to.equal("set");
  });

  it("Dark mode disabled", function () {
    localStorage.removeItem("todomDarkMode");
    expect(isDarkMode()).to.be.null;
  });

  it("Default date mode", function () {
    localStorage.removeItem("todomDateMode");
    expect(getDateMode()).to.equal(MODES.HIDE_BOTH);
  });

  it("Toggle date mode", function () {
    const initialMode = getDateMode();
    const nextMode = toggleDateMode();
    expect(nextMode).to.equal((initialMode + 1) % 4);
  });
});

describe("Dark Mode Tests", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("should initialize in light mode by default", () => {
    assert.isFalse(document.documentElement.classList.contains("dark"));
  });

  it("should enable dark mode when toggled", () => {
    // Simulate user toggling dark mode
    toggleDarkMode();

    // Assert dark mode is applied
    assert.isTrue(document.documentElement.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "set");
  });

  it("should disable dark mode when toggled off", () => {
    // Set dark mode and then toggle it off
    localStorage.setItem("todomDarkMode", "set");
    toggleDarkMode();

    // Assert dark mode is disabled
    assert.isFalse(document.documentElement.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "");
  });

  it("should restore dark mode from localStorage on initialization", () => {
    // Simulate dark mode preference in localStorage
    localStorage.setItem("todomDarkMode", "set");

    // Simulate initialization
    initializeDarkMode();

    // Assert dark mode is restored
    assert.isTrue(document.documentElement.classList.contains("dark"));
  });

  it("should handle missing or corrupted localStorage gracefully", () => {
    // Simulate corrupted localStorage value
    localStorage.setItem("todomDarkMode", "invalid");

    // Simulate initialization
    initializeDarkMode();

    // Assert app defaults to light mode
    assert.isFalse(document.documentElement.classList.contains("dark"));
  });

  it("should update the toggle button icon appropriately", () => {
    const button = document.createElement("button");
    button.id = "dark-button";
    document.body.appendChild(button);

    // Simulate dark mode toggle
    toggleDarkMode();

    // Assert the button icon is updated
    assert.include(button.innerHTML, "moon");

    // Toggle back to light mode
    toggleDarkMode();

    // Assert the button icon is updated again
    assert.include(button.innerHTML, "sun");
  });
});

describe("Tests for list-order.js", function () {
  let originalListOrder;
  const contentElement = document.getElementById("content");

  beforeEach(function () {
    originalListOrder = localStorage.getItem("todomListReverseOrder");
    contentElement.classList.remove("reversed");
  });

  afterEach(function () {
    if (originalListOrder !== null) {
      localStorage.setItem("todomListReverseOrder", originalListOrder);
    } else {
      localStorage.removeItem("todomListReverseOrder");
    }
    if (isReversed()) {
      contentElement.classList.add("reversed");
    } else {
      contentElement.classList.remove("reversed");
    }
  });

  it("Enable reverse order", function () {
    localStorage.setItem("todomListReverseOrder", "set");
    expect(isReversed()).to.equal("set");
  });

  it("Disable reverse order", function () {
    localStorage.removeItem("todomListReverseOrder");
    expect(isReversed()).to.be.null;
  });

  it("Add class 'reversed'", function () {
    toggleReversedMode();
    expect(contentElement.classList.contains("reversed")).to.be.true;
  });

  it("Removing class 'reversed'", function () {
    toggleReversedMode();
    toggleReversedMode();
    expect(contentElement.classList.contains("reversed")).to.be.false;
  });
});

// Tests for `latinization.js`
describe("Slugification Tests", function () {
  const testCases = [
    { input: "hello world", expected: "hello-world" },
    { input: "Привет мир", expected: "privet-mir" },
    { input: "你好，世界", expected: "ni-hao-shi-jie" },
    { input: "hello @world!", expected: "hello-world" },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`Input "${input}" should become "${expected}"`, async function () {
      const output = await processFilename(input);
      expect(output).to.equal(expected);
    });
  });
});
