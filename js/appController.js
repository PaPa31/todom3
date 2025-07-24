// appController.js [SURVIVAL MODE]

// 🔐 R1: Global protocol definition for compatibility
window.protocol = window.location.protocol;

// === Module: Loader ===
var Loader = (function () {
  function loadScript(url, callback) {
    // 🔐 R1: Use legacy-compatible handlers
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = function () {
      console.log("Successfully loaded script: " + url);
      if (callback) callback(true);
    };

    script.onreadystatechange = function () {
      if (this.readyState === "loaded" || this.readyState === "complete") {
        console.log("Legacy browser detected; script ready: " + url);
        if (callback) callback(true);
      }
    };

    script.onerror = function () {
      console.log("Failed to load script: " + url);
      if (callback) callback(false);
    };

    var head = document.getElementsByTagName("head")[0];
    if (head) head.appendChild(script);
    else {
      console.log("Failed to append script. <head> not found.");
      if (callback) callback(false);
    }
  }

  function loadCSS(url) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    var head = document.getElementsByTagName("head")[0];
    if (head) head.appendChild(link);
    else console.log("Failed to append stylesheet. <head> not found.");
  }

  return {
    loadScript: loadScript,
    loadCSS: loadCSS
  };
})();

// === Module: Test ===
var Test = (function () {
  function detectMocha(state, callback) {
    Loader.loadScript("test1/mocha.js", function (loaded) {
      if (loaded) {
        if (typeof mocha !== "undefined" && typeof mocha.setup === "function") {
          state.mochaAvailable = true;
          console.log("Mocha loaded and initialized.");
          mocha.setup("bdd");
        } else {
          console.warn("Mocha script loaded, but mocha object not initialized.");
        }
      } else {
        console.error("Mocha script could not be loaded.");
      }
      callback();
    });
  }

  function initializeTests(state) {
    if (state.testMode) {
      console.log("Test mode enabled.");
      detectMocha(state, function () {
        if (state.mochaAvailable) {
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
            } catch (e) {
              console.error("Error during Mocha init:", e);
            }
          });
        } else {
          Loader.loadScript("test/test-config.js", function () {
            Loader.loadScript("test/test-simple.js");
          });
        }
      });
    }
  }

  return {
    initializeTests: initializeTests
  };
})();

// === Module: Mode ===
var Mode = (function () {
  function initializeTestMode(state) {
    state.testMode = window.location.search.indexOf("test=true") !== -1;
    if (state.testMode) {
      console.log("Test mode is active!");
    }
  }

  return {
    initializeTestMode: initializeTestMode
  };
})();

// === Module: Actions ===
var Actions = (function () {
  function createNote() {
    console.log("Creating new note");
  }

  function openExistingNote(state) {
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
    createNote: createNote,
    openExistingNote: openExistingNote,
    openFile: openFile,
    openFolder: openFolder,
    saveFile: saveFile
  };
})();

// === Module: Storage ===
var Storage = (function () {
  function withLocalStorageKeySetup(keys, testFunc) {
    var originalStorage = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      originalStorage[key] = localStorage.getItem(key);
    }

    var error;
    try {
      testFunc();
    } catch (err) {
      error = err;
    }

    for (var j = 0; j < keys.length; j++) {
      var k = keys[j];
      if (originalStorage[k] !== null) {
        localStorage.setItem(k, originalStorage[k]);
      } else {
        localStorage.removeItem(k);
      }
    }

    if (error) throw error;
  }

  return {
    withLocalStorageKeySetup: withLocalStorageKeySetup
  };
})();

// === Main Controller: App ===
var appController = (function () {
  var state = {
    protocol: window.protocol,
    mochaAvailable: false,
    note: null,
    file: null,
    folder: null
  };

  function loadProtocolScripts() {
    if (state.protocol === "file:") {
      Loader.loadScript("js/protocol-file.js");
    } else if (state.protocol === "http:" || state.protocol === "https:") {
      Loader.loadScript("js/protocol-http.js");
    }
  }

  function initializeAppStates() {
    Mode.initializeTestMode(state);
    // 🔐 R2: debugMode placeholder remains for future
  }

  function initializeApp() {
    initializeAppStates();
    loadProtocolScripts();
    Test.initializeTests(state);

    if (state.protocol === "file:" || state.protocol.indexOf("http") === 0) {
      Actions.openExistingNote(state);
    }
  }

  return {
    initialize: initializeApp,
    actions: Actions,
    withLocalStorageKeySetup: Storage.withLocalStorageKeySetup,
    state: state // 🔐 R6: expose for debug observation
  };
})();

// 🔐 R4: Global attach for debug access
window.appController = appController;

// 🔐 R3: Bind startup
document.addEventListener("DOMContentLoaded", appController.initialize);
