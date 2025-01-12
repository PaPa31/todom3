// appController.js

//Global protocol definition for compatibility
window.protocol = window.location.protocol;

// Initialize the application state
const appController = (() => {
  // State object
  const state = {
    protocol: window.protocol,
    testMode: window.location.search.includes("test=true"),
    mochaAvailable: false,
    note: null,
    file: null,
    folder: null,
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
      if (callback) callback();
    };

    script.onreadystatechange = function () {
      if (this.readyState === "loaded" || this.readyState === "complete") {
        if (callback) callback();
      }
    };

    script.onerror = function () {
      console.log(`Failed to load script: ${url}`);
      if (callback) callback(); // Ensure fallback logic proceeds
    };

    // For maximum backward compatibility
    const head = document.getElementsByTagName("head")[0];
    if (head) {
      head.appendChild(script);
    } else {
      console.log("Failed to append script. <head> not found.");
      if (callback) callback(); // Proceed gracefully even if <head> is missing
    }
  }

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

  function detectMocha(callback) {
    //loadScript("test1/mocha.js", () => {
    //  state.mochaAvailable = window.mocha && typeof mocha.run === "function";
    //  console.log(`Mocha detected: ${state.mochaAvailable}`);
    //  callback();
    //});
    loadScript("test/mocha.js", function () {
      // Check if Mocha is available and initialize it
      if (typeof mocha !== "undefined" && typeof mocha.setup === "function") {
        state.mochaAvailable = true;
        console.log("Mocha loaded and initialized.");
        mocha.setup("bdd"); // Example setup
      } else {
        console.log("Mocha script loaded, but the object was not initialized.");
      }
      callback();
    });
  }

  const initializeMocha = (callback) => {
    loadScript("test/mocha.js", () => {
      try {
        mocha.setup("bdd"); // Explicitly initialize Mocha
        state.mochaAvailable = true;
        console.log("Mocha initialized successfully.");
        callback(true);
      } catch (error) {
        console.error("Failed to initialize Mocha:", error);
        callback(false);
      }
    });
  };

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

  // Application initialization
  const initializeApp = () => {
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
  return {
    initialize: initializeApp,
    actions: actions,
  };
})();

// Initialize the application when the DOM loads
document.addEventListener("DOMContentLoaded", appController.initialize);
