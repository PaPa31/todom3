// appController.js

//Global protocol definition for compatibility
window.protocol = window.location.protocol;

// Initialize the application state
const appController = (() => {
  // State object
  const state = {
    protocol: window.protocol,
    mochaAvailable: false,
    note: null,
    file: null,
    folder: null,
    // Remove premature testMode initialization
    // testMode: window.location.search.includes("test=true"),
  };

  // Loading scripts depending on the protocol
  const loadProtocolScripts = () => {
    if (state.protocol === "file:") {
      loadScript("js/protocol-file.js");
    } else if (state.protocol === "http:" || state.protocol === "https:") {
      loadScript("js/protocol-http.js");
    }
  };

  // Function to dynamically load a script
  function loadScript(url, callback) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    //script.onload = callback; // Execute callback once script is loaded

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
      if (callback) callback(false); // Ensure fallback logic proceeds
    };

    // For maximum backward compatibility
    const head = document.getElementsByTagName("head")[0];
    if (head) {
      head.appendChild(script);
    } else {
      console.log("Failed to append script. <head> not found.");
      if (callback) callback(false); // Proceed gracefully even if <head> is missing
    }
  }

  // Function to load CSS
  function loadCSS(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    const head = document.getElementsByTagName("head")[0];
    if (head) {
      head.appendChild(link);
    } else {
      console.log(`Failed to append stylesheet. <head> not found.`);
    }
  }

  // Detect Mocha for tests
  function detectMocha(callback) {
    // To simulate the absence of mocha, I rename the `test` directory to `test1`
    loadScript("test/mocha.js", function (loaded) {
      if (loaded) {
        // Check if Mocha is properly initialized
        if (typeof mocha !== "undefined" && typeof mocha.setup === "function") {
          state.mochaAvailable = true;
          console.log("Mocha loaded and initialized.");
          mocha.setup("bdd"); // Example setup
        } else {
          console.warn(
            "Mocha script loaded, but the object was not initialized."
          );
        }
      } else {
        console.error(
          "Mocha script could not be loaded. Please verify the path or existence of the file."
        );
      }
      callback();
    });
  }

  // Initialize tests
  function initializeTests() {
    if (state.testMode) {
      console.log("Test mode enabled.");

      detectMocha(() => {
        if (state.mochaAvailable) {
          console.log("Initializing Mocha tests...");
          loadCSS("test/mocha.css");
          loadScript("test/chai.min.js", () => {
            try {
              mocha.setup("bdd");
              window.expect = chai.expect; // Make `expect` globally available
              loadScript("test/test-config.js", () => {
                loadScript("test/test-mocha.js", () => {
                  mocha.run();
                });
              });
            } catch (error) {
              console.error("Error during Mocha initialization:", error);
            }
          });
        } else {
          console.warn("Mocha is not available. Running simple tests...");
          loadScript("test/test-config.js", () => {
            loadScript("test/test-simple.js");
          });
        }
      });
    }
  }

  // Application actions
  const actions = {
    createNote: () => console.log("Creating new note"),
    openExistingNote: () => {
      state.note = localStorage.getItem("note") || null;
      console.log("Opening existing note from localStorage:", state.note);
    },
    openFile: () => console.log("Opening file"),
    openFolder: () => console.log("Opening folder"),
    saveFile: () => console.log("Saving file"),
  };

  // Refactored `withLocalStorageKeySetup` for backward compatibility
  function withLocalStorageKeySetup(keys, testFunc) {
    // Backup the relevant localStorage keys
    var originalStorage = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      originalStorage[key] = localStorage.getItem(key);
    }

    var error;
    try {
      // Run the test function
      testFunc();
    } catch (err) {
      error = err;
    }

    // Restore only the relevant localStorage keys
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (originalStorage[key] !== null) {
        localStorage.setItem(key, originalStorage[key]);
      } else {
        localStorage.removeItem(key);
      }
    }

    if (error) {
      throw error;
    }
  }

  // Initialize test mode
  function initializeTestMode() {
    state.testMode = window.location.search.includes("test=true"); // Initialize here
    if (state.testMode) {
      console.log("Test mode is active!");
      // Additional logic for test mode can go here
    }
  }

  // Initialize application states
  function initializeAppStates() {
    initializeDarkMode();
    initializeTestMode();
    // Add other modes or states here
  }

  // Application initialization
  const initializeApp = () => {
    initializeAppStates();
    loadProtocolScripts();
    initializeTests();

    // Perform actions depending on the protocol
    if (state.protocol === "file:") {
      actions.openExistingNote();
    } else if (state.protocol === "http:" || state.protocol === "https:") {
      actions.openExistingNote();
    }
  };

  // Export available methods and initialization
  // Return the public API
  return {
    initialize: initializeApp,
    actions: actions,
    //initializeDarkMode, // Exposed for testing
    withLocalStorageKeySetup, // Expose this for testing
  };
})();

// Initialize the application when the DOM loads
document.addEventListener("DOMContentLoaded", appController.initialize);
