let isKeyboardOpen = false;
let lastScrollY = window.scrollY;
let lastOffsetTop = window.visualViewport.offsetTop;
let lastKeyboardState = null;
let lastAppliedOffset = 0;

function logState(eventName) {
  return; // stop log
  const state = {
    scrollY: window.scrollY,
    offsetTop: window.visualViewport.offsetTop,
    viewportHeight: window.visualViewport.height,
    keyboardOpen: isKeyboardOpen,
  };

  const stateStr = JSON.stringify(state);
  if (stateStr !== lastKeyboardState) {
    console.log(`[${eventName}]`, state);
    lastKeyboardState = stateStr;
  }
}

function updateStickyPositionForKeyboard() {
  const yOffset = window.visualViewport.offsetTop;
  if (yOffset !== lastAppliedOffset) {
    document.querySelectorAll(".top-in-li.sticken").forEach((el) => {
      el.style.setProperty("--todom-sticken-yoffset", `${yOffset}px`);
    });
    lastAppliedOffset = yOffset;
    logState("📐 updateStickyPosition");
  }
}

function restoreStickyDefaults() {
  document.querySelectorAll(".top-in-li.sticken").forEach((el) => {
    el.style.transform = "";
    el.style.removeProperty("--todom-sticken-yoffset"); // 🧼 Reset sticky offset
  });

  logState("🔁 restoreSticky");
}

window.visualViewport?.addEventListener("resize", () => {
  const diff = window.innerHeight - window.visualViewport.height;
  isKeyboardOpen = diff > 150;

  if (isKeyboardOpen) {
    updateStickyPositionForKeyboard();
  } else {
    restoreStickyDefaults();
  }

  logState("📏 resize");
});

window.visualViewport?.addEventListener("scroll", () => {
  if (isKeyboardOpen) updateStickyPositionForKeyboard();
  logState("📜 visualViewport scroll");
});

// Optional: fallback listener
document.addEventListener("focusin", () => {
  setTimeout(() => {
    logState("🟢 focusin");
    updateStickyPositionForKeyboard();
  }, 150);
});

document.addEventListener("focusout", () => {
  setTimeout(() => {
    logState("🔴 focusout");
    restoreStickyDefaults();
  }, 150);
});

window.addEventListener("scroll", () => {
  if (Math.abs(window.scrollY - lastScrollY) > 50) {
    logState("🌀 window scroll");
    lastScrollY = window.scrollY;
  }
});
