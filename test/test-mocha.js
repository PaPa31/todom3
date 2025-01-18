// test-mocha.js: Tests for Mocha and Chai

// Ensure Chai's expect is available globally
const { assert, expect } = chai;

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
    localStorage.setItem("todomDarkMode", "enabled");
    expect(getDarkModeFromStorage()).to.be.true;
  });

  it("Dark mode disabled", function () {
    localStorage.removeItem("todomDarkMode");
    expect(getDarkModeFromStorage()).to.be.false;
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

// Tests for Dark Mode
// Refactored Mocha Tests for Backward Compatibility
describe("Dark Mode Tests4", function () {
  // This is illogical logic :) from AI
  //beforeEach(function () {
  //  // Force turn off dark mode
  //  darkButton.innerHTML = icons.sun;
  //  document.documentElement.classList.remove("dark");
  //  localStorage.removeItem("todomDarkMode");
  //});

  let originalDarkMode;

  beforeEach(function () {
    originalDarkMode = localStorage.getItem("todomDarkMode");

    // This is wrong logic :) from AI
    // Clear localStorage before each test
    // We can't clear localStorage completely - we store all draft notes in localStorage
    //localStorage.clear();

    // Force turn off dark mode
    darkButton.innerHTML = icons.sun;
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("todomDarkMode");
  });

  afterEach(function () {
    if (originalDarkMode !== null) {
      localStorage.setItem("todomDarkMode", originalDarkMode);
    } else {
      localStorage.removeItem("todomDarkMode");
    }
    initializeDarkMode();
  });

  it("should initialize in light mode by default", function () {
    assert.isFalse(document.documentElement.classList.contains("dark"));
  });

  it("should enable dark mode when toggled", function () {
    appController.withLocalStorageKeySetup(["todomDarkMode"], function () {
      handleDarkModeToggle();
      assert.isTrue(document.documentElement.classList.contains("dark"));
      assert.equal(localStorage.getItem("todomDarkMode"), "enabled");
    });
  });

  it("should disable dark mode when toggled off", function () {
    appController.withLocalStorageKeySetup(["todomDarkMode"], function () {
      darkButton.innerHTML = icons.moon;
      document.documentElement.classList.add("dark");
      localStorage.setItem("todomDarkMode", "enabled");
      handleDarkModeToggle();
      assert.isFalse(document.documentElement.classList.contains("dark"));
      assert.equal(localStorage.getItem("todomDarkMode"), "disabled");
    });
  });
});

describe("Dark Mode Tests3", function () {
  //before(function () {
  //  // Ensure the document starts in a known state
  //  darkButton.innerHTML = icons.sun;
  //  document.documentElement.classList.remove("dark");
  //  localStorage.removeItem("todomDarkMode");
  //});

  let originalDarkMode;

  before(function () {
    originalDarkMode = localStorage.getItem("todomDarkMode");

    // This is wrong logic :) from AI
    // Clear localStorage before each test
    // We can't clear localStorage completely - we store all draft notes in localStorage
    //localStorage.clear();

    // Force turn off dark mode
    darkButton.innerHTML = icons.sun;
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("todomDarkMode");
  });

  after(function () {
    if (originalDarkMode !== null) {
      localStorage.setItem("todomDarkMode", originalDarkMode);
    } else {
      localStorage.removeItem("todomDarkMode");
    }
    initializeDarkMode();
  });

  it("should initialize in light mode by default", function () {
    expect(document.documentElement.classList.contains("dark")).to.be.false;
  });

  it("should enable dark mode when toggle is called", function () {
    darkButton.innerHTML = icons.moon;
    document.documentElement.classList.add("dark");
    localStorage.setItem("todomDarkMode", "enabled");
    expect(document.documentElement.classList.contains("dark")).to.be.true;
    expect(localStorage.getItem("todomDarkMode")).to.equal("enabled");
    expect(darkButton.innerHTML).include("moon-icon");
  });

  it("should disable dark mode when toggled off", function () {
    darkButton.innerHTML = icons.sun;
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("todomDarkMode");
    expect(document.documentElement.classList.contains("dark")).to.be.false;
    expect(localStorage.getItem("todomDarkMode")).to.equal(null);
    expect(darkButton.innerHTML).include("sun-icon");
  });
});

describe("Dark Mode Tests2", function () {
  let originalDarkMode;

  beforeEach(function () {
    originalDarkMode = localStorage.getItem("todomDarkMode");

    // This is wrong logic :) from AI
    // Clear localStorage before each test
    // We can't clear localStorage completely - we store all draft notes in localStorage
    //localStorage.clear();

    // Force turn off dark mode
    darkButton.innerHTML = icons.sun;
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("todomDarkMode");
  });

  afterEach(function () {
    if (originalDarkMode !== null) {
      localStorage.setItem("todomDarkMode", originalDarkMode);
    } else {
      localStorage.removeItem("todomDarkMode");
    }
    initializeDarkMode();
  });

  //beforeEach(function () {
  //  // Clear localStorage before each test
  //  // We can't clear localStorage - we store all draft notes in localStorage
  //  //localStorage.clear();
  //  document.documentElement.classList.remove("dark");
  //  localStorage.removeItem("todomDarkMode");
  //});

  it("should initialize in light mode by default", function () {
    assert.isFalse(document.documentElement.classList.contains("dark"));
  });

  it("should enable dark mode when toggled", function () {
    // Simulate user toggling dark mode
    handleDarkModeToggle();

    // Assert dark mode is applied
    assert.isTrue(document.documentElement.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "enabled");
  });

  it("should disable dark mode when toggled off", function () {
    // Set dark mode and then toggle it off
    darkButton.innerHTML = icons.moon;
    document.documentElement.classList.add("dark");
    localStorage.setItem("todomDarkMode", "enabled");
    handleDarkModeToggle();

    // Assert dark mode is disabled
    assert.isFalse(document.documentElement.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "disabled");
  });

  it("should restore dark mode from localStorage on initialization", function () {
    // Simulate dark mode preference in localStorage
    localStorage.setItem("todomDarkMode", "enabled");

    // Simulate initialization
    initializeDarkMode();

    // Assert dark mode is restored
    assert.isTrue(document.documentElement.classList.contains("dark"));
  });

  it("should handle missing or corrupted localStorage gracefully", function () {
    // Simulate corrupted localStorage value
    localStorage.setItem("todomDarkMode", "invalid");

    // Simulate initialization
    initializeDarkMode();

    // Assert app defaults to light mode
    assert.isFalse(document.documentElement.classList.contains("dark"));
  });

  it("should update the toggle button icon appropriately", function () {
    //const button = document.createElement("button");
    //button.id = "dark-button";
    //document.body.appendChild(button);

    // Simulate dark mode toggle
    handleDarkModeToggle();

    // Assert the button icon is updated
    assert.include(darkButton.innerHTML, "moon-icon");

    // Toggle back to light mode
    handleDarkModeToggle();

    // Assert the button icon is updated again
    assert.include(darkButton.innerHTML, "sun-icon");
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
    localStorage.setItem("todomListReverseOrder", "enabled");
    expect(isReversed()).to.equal("enabled");
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
    {
      input: "Очень длинный текст, превышающий лимит символов",
      expected: "ochen-dlinnyy-tekst-prevyshayushchiy-limit-simvo",
    },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`Input "${input}" should become "${expected}"`, async function () {
      const output = await processFilename(input);
      expect(output).to.equal(expected);
    });
  });
});
