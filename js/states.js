const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

// starting in Item state & Unfolded view
let isFileState = false;
let isFoldedView = false;

let itemsArray = [];

let nullInItemsStorage = false;

let counterItems = 0;
// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];

let twoClickToTrash = false;
let twoClickTrashClear = false;

let lastClickId;
let lastItem;
let lastInputValue = "";

let indexToEdit;
let editedItem;

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counterItems;
  li.appendChild(div);
  ol.appendChild(li);
  spanMaker(li);
  indexedItemsArray.push(counterItems.toString());
  showItemSortingArrows(ol.childElementCount);
  counterItems++;
};

const spanMaker = (liTag) => {
  const spanTag = document.createElement("div");
  spanTag.setAttribute("id", "item-control");
  liTag.appendChild(spanTag);

  editButtonMaker(spanTag);
  trashButtonMaker(spanTag);
};

const editButtonMaker = (spanTag) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "edit-item btn");
  buttonTag.setAttribute(
    "onclick",
    "editItem(this.parentElement.parentElement)"
  );
  buttonTag.setAttribute("title", "Edit item");

  spanTag.appendChild(buttonTag);
};

const trashButtonMaker = (liTag) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-one-item btn");
  buttonTag.setAttribute(
    "onclick",
    "deleteOneItem(this.parentElement.parentElement)"
  );
  buttonTag.setAttribute("title", "Double-click to move to Trash");

  liTag.appendChild(buttonTag);
};

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

const hideTrash = () => {
  if (isFileState && trashArray.length) {
    deletedCounter.innerText = trashArray.length;
    restoreItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
  } else {
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
  }
};

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
  hideTrash();
  initializeFileState();
};

//-----Item state-----
const hideFileState = () => {
  ol.innerHTML = "";
};

const initializeItemState = () => {
  itemsArray =
    localStorage.getItem("items") && JSON.parse(localStorage.getItem("items"));

  lastInputValue = localStorage.getItem("last") && localStorage.getItem("last");

  nullInItemsStorage = false;

  itemsArray?.forEach((item, key) => {
    if (item) {
      liMaker(item);
    } else {
      itemsArray.splice(key, 1);
      nullInItemsStorage = true;
      console.log(`items: ${key} item is null and ignored!`);
    }
  });

  if (nullInItemsStorage) {
    localStorage.setItem("items", JSON.stringify(itemsArray));
  }

  if (lastInputValue) {
    xButton.style = "display:block";
    inputLabel.classList.replace("invisible", "visible");
  } else {
    xButton.style = "display:none";
  }

  input.value = lastInputValue;
  input.scrollTop = input.scrollHeight;
};

const itemState = () => {
  hideFileState();
  hideTrash();
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
