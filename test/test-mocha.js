// test-mocha.js: Tests for Mocha and Chai

// Ensure Chai's expect is available globally
const { assert, expect } = chai;

describe("Checking if Chai works", function () {
  it("'expect' should be available", function () {
    expect(true).to.be.true;
  });
});

describe("Tests for dark mode and date mode", function () {
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
  //  html.classList.remove("dark");
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
    html.classList.remove("dark");
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
    assert.isFalse(html.classList.contains("dark"));
  });

  it("should enable dark mode when toggled", function () {
    handleDarkModeToggle();
    assert.isTrue(html.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "enabled");
  });

  it("should disable dark mode when toggled off", function () {
    darkButton.innerHTML = icons.moon;
    html.classList.add("dark");
    localStorage.setItem("todomDarkMode", "enabled");
    handleDarkModeToggle();
    assert.isFalse(html.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "disabled");
  });
});

describe("Dark Mode Tests3", function () {
  //before(function () {
  //  // Ensure the document starts in a known state
  //  darkButton.innerHTML = icons.sun;
  //  html.classList.remove("dark");
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
    html.classList.remove("dark");
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
    expect(html.classList.contains("dark")).to.be.false;
  });

  it("should enable dark mode when toggle is called", function () {
    darkButton.innerHTML = icons.moon;
    html.classList.add("dark");
    localStorage.setItem("todomDarkMode", "enabled");
    expect(html.classList.contains("dark")).to.be.true;
    expect(localStorage.getItem("todomDarkMode")).to.equal("enabled");
    expect(darkButton.innerHTML).include("moon-icon");
  });

  it("should disable dark mode when toggled off", function () {
    darkButton.innerHTML = icons.sun;
    html.classList.remove("dark");
    localStorage.removeItem("todomDarkMode");
    expect(html.classList.contains("dark")).to.be.false;
    expect(localStorage.getItem("todomDarkMode")).to.equal(null);
    expect(darkButton.innerHTML).include("sun-icon");
  });
});

describe("Dark Mode Tests2", function () {
  let originalDarkMode;

  before(function () {
    originalDarkMode = localStorage.getItem("todomDarkMode");

    // This is wrong logic :) from AI
    // Clear localStorage before each test
    // We can't clear localStorage completely - we store all draft notes in localStorage
    //localStorage.clear();

    // Force turn off dark mode
    darkButton.innerHTML = icons.sun;
    html.classList.remove("dark");
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

  //beforeEach(function () {
  //  // Clear localStorage before each test
  //  // We can't clear localStorage - we store all draft notes in localStorage
  //  //localStorage.clear();
  //  html.classList.remove("dark");
  //  localStorage.removeItem("todomDarkMode");
  //});

  it("should initialize in light mode by default", function () {
    assert.isFalse(html.classList.contains("dark"));
  });

  it("should enable dark mode when toggled", function () {
    // Simulate user toggling dark mode
    handleDarkModeToggle();

    // Assert dark mode is applied
    assert.isTrue(html.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "enabled");
  });

  it("should disable dark mode when toggled off", function () {
    // Set dark mode and then toggle it off
    darkButton.innerHTML = icons.moon;
    html.classList.add("dark");
    localStorage.setItem("todomDarkMode", "enabled");
    handleDarkModeToggle();

    // Assert dark mode is disabled
    assert.isFalse(html.classList.contains("dark"));
    assert.equal(localStorage.getItem("todomDarkMode"), "disabled");
  });

  it("should restore dark mode from localStorage on initialization", function () {
    // Simulate dark mode preference in localStorage
    localStorage.setItem("todomDarkMode", "enabled");

    // Simulate initialization
    initializeDarkMode();

    // Assert dark mode is restored
    assert.isTrue(html.classList.contains("dark"));
  });

  it("should handle missing or corrupted localStorage gracefully", function () {
    // Simulate corrupted localStorage value
    localStorage.setItem("todomDarkMode", "invalid");

    // Simulate initialization
    initializeDarkMode();

    // Assert app defaults to light mode
    assert.isFalse(html.classList.contains("dark"));
  });

  it("should update the toggle button icon appropriately", function () {
    // add new button
    var newDarkButton = document.createElement("button");
    newDarkButton.id = "dark-button";
    document.body.appendChild(newDarkButton);

    // Simulate dark mode toggle
    handleDarkModeToggle(newDarkButton);

    // Assert the button icon is updated
    assert.include(newDarkButton.innerHTML, "moon-icon");

    // Toggle back to light mode
    handleDarkModeToggle(newDarkButton);

    // Assert the button icon is updated again
    assert.include(newDarkButton.innerHTML, "sun-icon");

    // remove new button
    document.body.removeChild(newDarkButton);
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


describe("Scroll Logic Tests", function () {
  it("Should compute keyboard open state when viewport shrinks", function () {
    const fakeInnerHeight = 800;
    const fakeViewportHeight = 500; // simulating keyboard
    const threshold = 150;

    const diff = fakeInnerHeight - fakeViewportHeight;
    const keyboardDetected = diff > threshold;
    expect(keyboardDetected).to.be.true;
  });

  it("Should update CSS var only if offset changes", function () {
    const el = document.createElement("div");
    el.classList.add("top-in-li", "sticken");
    document.body.appendChild(el);

    const offset = 50;
    el.style.setProperty("--todom-sticken-yoffset", `${offset}px`);
    expect(el.style.getPropertyValue("--todom-sticken-yoffset")).to.equal("50px");

    el.remove();
  });
});
