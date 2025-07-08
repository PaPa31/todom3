let isKeyboardOpen = false;

function updateStickyPositionForKeyboard() {
  const yOffset = window.visualViewport.offsetTop;
  document.querySelectorAll(".top-in-li.sticken").forEach((el) => {
    el.style.position = "fixed";
    el.style.transform = `translateY(${yOffset}px)`;
  });
}

function restoreStickyDefaults() {
  document.querySelectorAll(".top-in-li.sticken").forEach((el) => {
    el.style.transform = "";
  });
}

window.visualViewport?.addEventListener("resize", () => {
  const diff = window.innerHeight - window.visualViewport.height;
  isKeyboardOpen = diff > 150;

  if (isKeyboardOpen) {
    updateStickyPositionForKeyboard();
  } else {
    restoreStickyDefaults();
  }
});

window.visualViewport?.addEventListener("scroll", () => {
  if (isKeyboardOpen) updateStickyPositionForKeyboard();
});

// Optional: fallback listener
document.addEventListener("focusin", () => {
  setTimeout(() => updateStickyPositionForKeyboard(), 150);
});

document.addEventListener("focusout", () => {
  setTimeout(() => restoreStickyDefaults(), 150);
});

