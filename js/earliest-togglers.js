// early-togglers.js -- aggregates all settings that affect the user interface
// It should be run as early as possible to avoid flickering

// <----- Start Dark Mode ----->
var darkButton = document.getElementById("dark-button");

var icons = {
  moon: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="dark-toggle-icon">
      <path fill="currentColor" d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path>
    </svg>`,
  sun: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="light-toggle-icon">
      <path fill="currentColor" d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"></path>
    </svg>`,
};

document.addEventListener("DOMContentLoaded", () =>
  darkButton.addEventListener("click", handleDarkModeToggle)
);
// when DarkReader is enabled, on startup light mode blinks (especially on http server)
// workaround: disable DarkReader
// Initialize dark mode
function initializeDarkMode() {
  var isDark = getDarkModeFromStorage();
  updateDarkModeUI(isDark);
}

function handleDarkModeToggle() {
  var isDark = getDarkModeFromStorage();
  var newDarkModeState = !isDark;
  setDarkModeInStorage(newDarkModeState);
  updateDarkModeUI(newDarkModeState);
}

function getDarkModeFromStorage() {
  return localStorage.getItem("todomDarkMode") === "enabled";
}

function setDarkModeInStorage(isDark) {
  localStorage.setItem("todomDarkMode", isDark ? "enabled" : "disabled");
}

function updateDarkModeUI(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  darkButton.innerHTML = isDark ? icons.moon : icons.sun;
}
initializeDarkMode();
// <----- End Dark Mode ----->

// <----- Start Reverse Order Mode ----->
var dateButton = document.getElementById("show-date");

var listItems = document.getElementById("list-items"); // global variable

var MODES = {
  HIDE_BOTH: 0,
  HIDE_DATE: 1,
  HIDE_SAVE: 2,
  SHOW_BOTH: 3,
};

var VALID_MODES = [
  MODES.HIDE_BOTH,
  MODES.HIDE_DATE,
  MODES.HIDE_SAVE,
  MODES.SHOW_BOTH,
];

// Initialize state
dateButton.addEventListener("click", function (e) {
  var dateMode = toggleDateMode();
  updateButtonText(dateMode);
  updateDateDisplay(dateMode);

  e.stopPropagation();
});

var dateMode = getDateMode();
updateButtonText(dateMode);
updateDateDisplay(dateMode);

function getDateMode() {
  var storedMode = localStorage.getItem("todomDateMode");
  var parsedMode = parseInt(storedMode);

  // Check if the mode is valid; if not, reset to the default (HIDE_BOTH)
  if (!VALID_MODES.includes(parsedMode)) {
    localStorage.setItem("todomDateMode", MODES.HIDE_BOTH);
    return MODES.HIDE_BOTH;
  }
  return parsedMode;
}

function toggleDateMode() {
  var dateMode = getDateMode();
  var nextMode = (dateMode + 1) % 4; // Rotate through the 4 states
  localStorage.setItem("todomDateMode", nextMode);
  return nextMode;
}

function updateDateDisplay(dateMode) {
  switch (dateMode) {
    case MODES.HIDE_BOTH:
      listItems.style.setProperty("--todom-before-display", "none");
      listItems.style.setProperty("--todom-after-display", "none");
      break;
    case MODES.HIDE_DATE:
      listItems.style.setProperty("--todom-before-display", "initial");
      listItems.style.setProperty("--todom-after-display", "none");
      break;
    case MODES.HIDE_SAVE:
      listItems.style.setProperty("--todom-before-display", "none");
      listItems.style.setProperty("--todom-after-display", "initial");
      break;
    case MODES.SHOW_BOTH:
      listItems.style.setProperty("--todom-before-display", "initial");
      listItems.style.setProperty("--todom-after-display", "initial");
      break;
  }
}

function updateButtonText(dateMode) {
  switch (dateMode) {
    case MODES.HIDE_BOTH:
      dateButton.innerHTML = "<span>Save</span><hr><span>Date</span>";
      break;
    case MODES.HIDE_DATE:
      dateButton.innerHTML =
        "<span class='red'>Save</span><hr><span>Date</span>";
      break;
    case MODES.HIDE_SAVE:
      dateButton.innerHTML =
        "<span>Save</span><hr><span class='red'>Date</span>";
      break;
    case MODES.SHOW_BOTH:
      dateButton.innerHTML =
        "<span class='red'>Save</span><hr><span class='red'>Date</span>";
      break;
  }
}
// <----- End Reverse Order Mode ----->
