// appController.js [SURVIVAL MODE]

var rules = {
  "meta": {
    "title": "Survival Rules - Matroshka Mode",
    "version": "1.0.0",
    "description": "Recursive behavioral model for code and thought integrity. No rule forgotten. Each rule expandable.",
    "audit": {
      "last_audited": "2025-07-27",
      "auditor": "chatgpt+papa31",
      "hash_verified_by": ["user-python", "chatgpt-python"],
      "rule_count": 12,
      "merged": ["R5", "R7"],
      "crosslinked": ["R9→R10", "R9→R13", "R8→R13"]
    }
  },
  "matroshka": {
    "R1": {
      "name": "NO_COMMENT_LEFT_BEHIND",
      "description": "All comments must be preserved during refactor. If position unknown, move to // [UNSORTED] COMMENTS.",
      "child_rules": {
        "R1.1": "Preserve inline comments",
        "R1.2": "Preserve block comments",
        "R1.3": "Preserve historical // [SURVIVAL] comments (merged from R5)"
      }
    },
    "R2": {
      "name": "MAX_BACKWARD_COMPAT",
      "description": "All code must run in older browsers/environments unless explicitly upgraded.",
      "child_rules": {
        "R2.1": "Avoid ES6+ features unless necessary",
        "R2.2": "Support CommonJS + global attach where possible",
        "R2.3": "Polyfill if absolutely needed"
      }
    },
    "R3": {
      "name": "NO_BLA_BLA_BLA",
      "description": "Avoid unnecessary speculation. Replace with testable, working minimal examples.",
      "child_rules": {
        "R3.1": "Sketch only when useful",
        "R3.2": "Each assumption must be testable"
      }
    },
    "R4": {
      "name": "ITERATE",
      "description": "Work in real feedback loops. Code must be copy/pasteable and tested per iteration.",
      "child_rules": {
        "R4.1": "No fantasy APIs",
        "R4.2": "Output must match user's environment",
        "R4.3": "User feedback must drive iteration"
      }
    },
    "R6": {
      "name": "SESSION_MODE:WORKING_ONLY",
      "description": "Conversation must remain focused only on code that can run now. No theory branches."
    },
    "R8": {
      "name": "RECURSIVE_ANALYSIS",
      "description": "Requirements must be broken down into layers. Each layer verifiable and traceable.",
      "child_rules": {
        "R8.1": "Meta-level: What is the rule doing?",
        "R8.2": "Code-level: Where is it enforced?",
        "R8.3": "User-level: How do you check compliance?"
      }
    },
    "R9": {
      "name": "MAX_ATTENTION_ENFORCED",
      "description": "Assistant must confirm every step with extreme attention. Fuzziness = violation."
    },
    "R10": {
      "name": "FINAL_SUMMARY_COMMAND",
      "description": "When user invokes the command (e.g. 'Bro, create please Final Summary'), ChatGPT must analyze the entire session from beginning to end with full attention. Recursively distill all core ideas, tool use, decisions, digressions, and unresolved threads into a clear, human-readable block. The summary must serve both as closure (a spiral end) and as a launchpad for continuation (next spiral). Output must appear under the heading: ## Final Summary.",
      "trigger_phrases": [
        "Final Summary",
        "Bro, give summary",
        "Please create Final Summary",
        "Finalize as Summary"
      ],
      "keywords": ["closure", "continuation", "recursion", "distillation", "checkpoint"],
      "child_rules": {
        "R10.1": "Must invoke R9 to ensure full attention is enforced"
      }
    },
    "R11": {
      "name": "NO_BACKTICK_HAZARD",
      "description": "Avoid using unescaped or misinterpreted backticks (`) in shell scripts — especially inside double-quoted strings or sed/awk blocks. Backticks can trigger unexpected EOF errors due to subshell substitution.",
      "child_rules": {
        "R11.1": "Do not use backticks inside double-quoted strings in shell scripts",
        "R11.2": "Use awk instead of sed when backtick characters are involved",
        "R11.3": "Avoid nested command substitution unless explicitly needed",
        "R11.4": "Write shell scripts so they can run on minimal environments (Mars-ready = POSIX safe, no jq, no bashisms)"
      }
    },
    "R12": {
      "name": "NO_BLANKLINE_BLOAT",
      "description": "Prevent redundant or unintended blank lines in generated output (Markdown, JSON, logs). Maintain visual and structural cleanliness near auto-generated or injected blocks.",
      "child_rules": {
        "R12.1": "Trim blank lines before and after auto-generated blocks",
        "R12.2": "Enforce exactly one newline for logical separation",
        "R12.3": "Use awk or line-aware logic to surgically remove blankline bloat"
      }
    },
    "R13": {
      "name": "SELF_CHECKING_RULE",
      "description": "Ruleset must recursively check itself for logical redundancy, verbosity, and overlap. Rules should be maximally compact, distinct, and cross-referenced.",
      "child_rules": {
        "R13.1": "No rule shall duplicate another rule's intent or scope.",
        "R13.2": "Each rule should be as brief as possible while remaining clear.",
        "R13.3": "Rules shall be grouped by functional domain (e.g., output, code integrity, logic control).",
        "R13.4": "Any new rule must declare its overlap (if any) with existing rules.",
        "R13.5": "Run periodic 'ruleset audit' to compress and restructure as needed.",
        "R13.6": "Must invoke R9 to ensure audit precision (no fuzzy logic)",
        "R13.7": "Must use R8-style recursive breakdown when auditing rules"
      }
    },
    "R14": {
      "name": "NO_UNICODE_AMBIGUITY",
      "description": "Avoid Unicode characters that may be interpreted inconsistently across platforms. All rule comments and identifiers must use only ASCII-safe characters.",
      "child_rules": {
        "R14.1": "Do not use emojis or variation selectors in rule metadata or keys",
        "R14.2": "Replace emoji markers with ASCII-safe equivalents (e.g., // [UNSORTED], // [SURVIVAL])",
        "R14.3": "Use Unicode normalization (NFC) before hashing or diffing",
        "R14.4": "Ruleset must remain portable across minimal/non-Unicode environments",
        "R14.5": "Invoke R13 and R9 before introducing new Unicode characters"
      }
    }
  }
}

// [SURVIVAL] R1: Global protocol definition for compatibility
window.protocol = window.location.protocol;

// === Module: Loader ===
var Loader = (function () {
  function loadScript(url, callback) {
    // [SURVIVAL] R1: Use legacy-compatible handlers
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
    // [SURVIVAL] R2: debugMode placeholder remains for future
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
    state: state // [SURVIVAL] R6: expose for debug observation
  };
})();

// [SURVIVAL] R4: Global attach for debug access
window.appController = appController;

// [SURVIVAL] R3: Bind startup
document.addEventListener("DOMContentLoaded", appController.initialize);
