let isKeyboardOpen = false;
let lastScrollY = window.scrollY;
let lastOffsetTop = window.visualViewport.offsetTop;
let lastKeyboardState = null;

function logState(eventName) {
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
  document.querySelectorAll(".top-in-li.sticken").forEach((el) => {
    el.style.position = "fixed";
    el.style.transform = `translateY(${yOffset}px)`;
  });

  logState("📐 updateStickyPosition");
}

function restoreStickyDefaults() {
  document.querySelectorAll(".top-in-li.sticken").forEach((el) => {
    el.style.transform = "";
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
