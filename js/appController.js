// 🔐 SURVIVAL: Global protocol definition for compatibility
window.protocol = window.location.protocol;

// === Module: Loader ===
var Loader = (function () {
  function loadScript(url, callback) {
    // 🔐 SURVIVAL: Use legacy onreadystatechange handler for old IE
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = function () {
      console.log(`Successfully loaded script: ${url}`);
      if (callback) callback(true);
    };

    script.onreadystatechange = function () {
      if (this.readyState === "loaded" || this.readyState === "complete") {
        console.log(`Legacy browser detected; script ready: ${url}`);
        if (callback) callback(true);
      }
    };

    script.onerror = function () {
      console.log(`Failed to load script: ${url}`);
      if (callback) callback(false);
    };

    const head = document.getElementsByTagName("head")[0];
    if (head) head.appendChild(script);
    else {
      console.log("Failed to append script. <head> not found.");
      if (callback) callback(false);
    }
  }

  function loadCSS(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    const head = document.getElementsByTagName("head")[0];
    if (head) head.appendChild(link);
    else console.log("Failed to append stylesheet. <head> not found.");
  }

  return {
    loadScript,
    loadCSS,
  };
})();

// === Module: Test ===
var Test = (function () {
  function detectMocha(state, callback) {
    // 🔐 SURVIVAL: preserve test/mocha.js loader logic
    Loader.loadScript("test/mocha.js", function (loaded) {
      if (loaded) {
        if (typeof mocha !== "undefined" && typeof mocha.setup === "function") {
          state.mochaAvailable = true;
          console.log("Mocha loaded and initialized.");
          mocha.setup("bdd");
        } else {
          console.warn(
            "Mocha script loaded, but the object was not initialized."
          );
        }
      } else {
        console.error("Mocha script could not be loaded.");
      }
      callback();
    });
  }

  function initializeTests(state) {
    // 🔐 SURVIVAL: preserve test mode detection logic
    if (state.testMode) {
      console.log("Test mode enabled.");
      detectMocha(state, function () {
        if (state.mochaAvailable) {
          console.log("Initializing Mocha tests...");
          Loader.loadCSS("test/mocha.css");
          Loader.loadScript("test/chai.min.js", function () {
            try {
              mocha.setup("bdd");
              window.expect = chai.expect;
              Loader.loadScript("test/test-config.js", function () {
                Loader.loadScript("test/test-mocha.js", function () {
                  mocha.run();
                });
              });
            } catch (error) {
              console.error("Error during Mocha initialization:", error);
            }
          });
        } else {
          console.warn("Mocha not available. Running fallback tests...");
          Loader.loadScript("test/test-config.js", function () {
            Loader.loadScript("test/test-simple.js");
          });
        }
      });
    }
  }

  return {
    initializeTests,
  };
})();

// === Module: Mode ===
var Mode = (function () {
  function initializeTestMode(state) {
    state.testMode = window.location.search.includes("test=true");
    if (state.testMode) {
      console.log("Test mode is active!");
    }
  }
  return {
    initializeTestMode,
  };
})();

// 🔐 SURVIVAL: placeholder for future debug mode
// Mode.debugMode will be added later per NO_COMMENT_LEFT_BEHIND

// === Module: Actions ===
var Actions = (function () {
  function createNote() {
    console.log("Creating new note");
  }
  function openExistingNote(state) {
    // 🔐 SURVIVAL: localStorage retrieval logic
    state.note = localStorage.getItem("note") || null;
    console.log("Opening existing note from localStorage:", state.note);
  }
  function openFile() {
    console.log("Opening file");
  }
  function openFolder() {
    console.log("Opening folder");
  }
  function saveFile() {
    console.log("Saving file");
  }
  return {
    createNote,
    openExistingNote,
    openFile,
    openFolder,
    saveFile,
  };
})();

// === Module: Storage ===
var Storage = (function () {
  function withLocalStorageKeySetup(keys, testFunc) {
    const originalStorage = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      originalStorage[key] = localStorage.getItem(key);
    }

    let error;
    try {
      testFunc();
    } catch (err) {
      error = err;
    }

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (originalStorage[key] !== null) {
        localStorage.setItem(key, originalStorage[key]);
      } else {
        localStorage.removeItem(key);
      }
    }

    if (error) throw error;
  }
  return {
    withLocalStorageKeySetup,
  };
})();

// === Main Application Controller ===
var appController = (function () {
  const state = {
    protocol: window.protocol,
    mochaAvailable: false,
    note: null,
    file: null,
    folder: null,
    // 🔐 SURVIVAL: testMode will be set by Mode.initializeTestMode
  };

  function loadProtocolScripts() {
    if (state.protocol === "file:") {
      Loader.loadScript("js/protocol-file.js");
    } else if (
      state.protocol === "http:" ||
      state.protocol === "https:"
    ) {
      Loader.loadScript("js/protocol-http.js");
    }
  }

  function initializeAppStates() {
    Mode.initializeTestMode(state);
    // 🔐 SURVIVAL: future initializeDebugMode(state) goes here
  }

  function initializeApp() {
    initializeAppStates();
    loadProtocolScripts();
    Test.initializeTests(state);

    if (
      state.protocol === "file:" ||
      state.protocol.startsWith("http")
    ) {
      Actions.openExistingNote(state);
    }
  }

  return {
    initialize: initializeApp,
    actions: Actions,
    withLocalStorageKeySetup: Storage.withLocalStorageKeySetup,
  };
})();

document.addEventListener("DOMContentLoaded", appController.initialize);

// 🗃️ UNSORTED COMMENTS (preserved during refactor):
// 🔐 SURVIVAL: placeholder for loader function callback usages
