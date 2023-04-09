const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

// starting in Item state & Unfolded view
let isFileState = false;
let isFoldedView = false;

firstHeaderButton.addEventListener("click", function (e) {
  if (isFoldedView) {
    // Unfolded view
    firstHeaderButton.classList.replace("fold", "unfold");
  } else {
    // Folded view
    firstHeaderButton.classList.replace("unfold", "fold");
  }
  isFoldedView = !isFoldedView;
});

//-----File state-----
const hideItemState = () => {
  defaultItemStateVars();
};

var phrase = "README.md";

const logFileText = async (file) => {
  const response = await fetch(file);
  const text = await response.text();
  ol.innerHTML = text;
};

const initializeFileState = () => {
  ol.innerHTML = "";
  logFileText(phrase);
};

const fileState = () => {
  hideItemState();
  initializeFileState();
};

//-----Item state-----
const hideFileState = () => {
  ol.innerHTML = "";
};

const initializeItemState = () => {};

const itemState = () => {
  hideFileState();
  initializeItemState();
};

secondHeaderButton.addEventListener("click", function (e) {
  if (isFileState) {
    firstHeaderButton.innerText = "Items";
    secondHeaderButton.innerText = "Files";
    itemState();
  } else {
    firstHeaderButton.innerText = "Files";
    secondHeaderButton.innerText = "Items";
    fileState();
  }
  isFileState = !isFileState;
});
