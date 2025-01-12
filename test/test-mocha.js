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
