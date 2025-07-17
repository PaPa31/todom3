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
