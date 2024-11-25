// ------------------- from states.js -------------------

const foldAllToggleButton = document.getElementById("fold-global-toggle");
const itemsFilesToggleButton = document.getElementById("items-files-toggle");

let foldedClass = document.getElementById("list-items");

const listFiles = document.getElementById("list-files");

// starting in Item state & Unfolded view
let isItemState = true;
let isFoldItems = localStorage.getItem("todomFoldItems")
  ? JSON.parse(localStorage.getItem("todomFoldItems"))
  : false;
let isFoldFiles = localStorage.getItem("todomFoldFiles")
  ? JSON.parse(localStorage.getItem("todomFoldFiles"))
  : false;

let itemsArray = localStorage.getItem("todomItemsArray")
  ? JSON.parse(localStorage.getItem("todomItemsArray"))
  : [];
let itemsSpecArray = localStorage.getItem("todomItemsSpecArray")
  ? JSON.parse(localStorage.getItem("todomItemsSpecArray"))
  : [];
let trashArray = localStorage.getItem("todomTrashArray")
  ? JSON.parse(localStorage.getItem("todomTrashArray"))
  : [];
let deletedArray = [];

let filesArray = [];

let idCounterItems = 0;
let idCounterFiles = 0;

// lightweight array to avoid redundant logic and waste of resources
let indexedItems = [];
let indexedFiles = [];

let twoClickToTrash = false;
let twoClickTrashClear = false;

let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("todomLastInputValue")
  ? localStorage.getItem("todomLastInputValue")
  : "";

let itemIndexToEdit;
let editedItemLiDOM;

let fileIndexToEdit;
let editedFileLiDOM;

const createEl = (tag, attr, pa) => {
  const el = document.createElement(tag);
  for (const key in attr) el.setAttribute(key, attr[key]);
  if (pa) pa.appendChild(el);
  return el;
};

function liDomMaker(arrIndex) {
  // simplified version of liDomMaker function
  // use it as placeholder
  const li = document.createElement("li");
  const topDiv = document.createElement("div");
  topDiv.setAttribute("class", "top-in-li");
  const div = document.createElement("div");

  if (isItemState) {
    const correctedItemsIndex = indexedItems.indexOf(arrIndex.toString()) * 1;
    const textArr = itemsArray[correctedItemsIndex].text;

    div.setAttribute("class", "md-item");

    const resizableDiv = document.createElement("div");
    resizableDiv.setAttribute("class", "resizable-div");
    mdToTagsWithoutShape(resizableDiv, textArr[0].variant);

    div.appendChild(resizableDiv);
    li.id = idCounterItems;
  } else {
    const correctedFilesIndex = indexedFiles.indexOf(arrIndex.toString()) * 1;
    fileInfoDivMaker(topDiv, correctedFilesIndex);

    div.setAttribute("class", "md-file");

    const attr = { class: "resizable-div" };
    const fileTextDiv = createEl("div", attr, topDiv);
    mdToTagsWithoutShape(fileTextDiv, filesArray[correctedFilesIndex].text);

    div.appendChild(fileTextDiv);
    li.id = idCounterFiles;
  }

  dual.appendChild(div);
  li.appendChild(topDiv);
  foldedClass.appendChild(li);
}

const fileInfoDivMaker = (parentDiv, arrIndex) => {
  const file = filesArray[arrIndex];
  const fileInfoDiv = createEl("div", { class: "file-info" }, parentDiv);
  const fileNameDiv = createEl("div", { class: "file-name" }, fileInfoDiv);
  fileNameDiv.innerHTML = file.dir ? file.dir : file.name;
  const fileSizeDiv = createEl("div", { class: "file-size" }, fileInfoDiv);
  fileSizeDiv.innerHTML = file.size ? fileSizeTerm(file.size) : "";
};

const datePlaceholder = (oneOfArr) => {
  // for backward compatibility
  // maybe it should be removed this func,
  // when all your items will have dates
  oneOfArr.text = oneOfArr.text.map((variant) => {
    if (typeof variant === "string") {
      // For old notes where the text is a string, wrap it with an object and set date to null
      return { variant: variant, date: "0000-00-00-000000" };
    }
    return variant; // Keep existing objects with variant and date
  });
};

const drawLi = (i) => {
  indexedItems.push(idCounterItems.toString());
  liDomMaker(i); // create li element
  idCounterItems++;
};

const arrCheckForNull = (arr, arr2) => {
  let len = arr.length,
    i;
  const len1 = len;
  for (i = 0; i < len; i++) {
    if (i in arr && arr[i] != undefined) {
      datePlaceholder(arr[i]);
      drawLi(i);
    } else {
      arr.splice(i, 1);
      arr2.splice(i, 1); // sync
      i--;
      len--;
    }
  }

  // cut off extra if any
  if (itemsSpecArray.length > len) {
    itemsSpecArray.length = len;
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  }

  if (len1 > len) {
    console.log("null(s) was/were found and ignored!");
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  }
};

const showOrHideTrash = () => {
  if (trashArray.length) {
    trashedCounter.innerText = trashArray.length;
    restoreTrashedItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
  } else {
    restoreTrashedItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
  }
};

const sho = (el) => {
  el.classList.replace("none", "inline-block");
  el.classList.replace("invisible", "visible");
};

const hid = (el) => {
  if (isItemState) el.classList.replace("inline-block", "none");
  el.classList.replace("visible", "invisible");
};

const showOrHideDeleteAllItems = () => {
  if (
    (isItemState && itemsArray && itemsArray.length) ||
    (!isItemState && filesArray && filesArray.length)
  ) {
    sho(deleteAllItemsButton);
  } else {
    hid(deleteAllItemsButton);
  }
};

const initializeItemState = () => {
  saveAsNewButton.innerText = "Save item";
  itemsFilesToggleButton.innerText = "Items";
  openFileButton.innerText = "Split file";
  deleteAllItemsButton.innerText = "Delete All Items";
  saveAsFileButton.classList.replace("none", "inline-block");
  openDirButton.classList.replace("inline-block", "none");
  restoreTrashedItemButton.classList.replace("none", "inline-block");
  clearTrashButton.classList.replace("none", "inline-block");
  undoLastDeleteButton.classList.replace("none", "inline-block");

  listFiles.style.setProperty("display", "none");
  listItems.style.setProperty("display", "flex");
  foldedClass = document.getElementById("list-items");

  if (indexedItems.length === 0) {
    idCounterItems = 0;
    indexedItems = [];

    if (itemsArray.length !== 0) {
      arrCheckForNull(itemsArray, itemsSpecArray);
    } else {
      // sync by reset
      itemsSpecArray.length = 0;
      localStorage.removeItem("todomItemsArray");
      localStorage.removeItem("todomItemsSpecArray");
    }
  }
  showItemSortingArrows(foldedClass.childElementCount);
  //newElementsFromOtherState(foldedClass);
};

// --------------- from scripts.js -------------------
("use strict");
const html = document.documentElement;
const form = document.querySelector("form");

const input = document.getElementById("input");
const preview = document.getElementById("preview");

const xButton = document.getElementById("x-button");
const returnInputButton = document.getElementById("return-last-input");

const deleteAllItemsButton = document.getElementById("delete-all-items");
const restoreTrashedItemButton = document.getElementById(
  "restore-trashed-item"
);
const clearTrashButton = document.getElementById("clear-trash");
const undoLastDeleteButton = document.getElementById("undo-delete");
const saveAsOldButton = document.getElementById("save-as-old");
const saveAsNewButton = document.getElementById("save-as-new");
const saveAsFileButton = document.getElementById("save-as-file");
const openFileButton = document.getElementById("open-file");
const openDirButton = document.getElementById("open-dir");

const trashedCounter = document.getElementById("trashed-counter");
const deletedCounter = document.getElementById("deleted-counter");

const output = document.getElementById("output");
const position = document.getElementById("position");

const inputLabel = document.getElementById("input-label");

clearTrashButton.classList.add("invisible", "none");
clearTrashButton.removeAttribute("style");

deleteAllItemsButton.classList.add("invisible");
deleteAllItemsButton.removeAttribute("style");

saveAsFileButton.classList.add("inline-block");

saveAsOldButton.classList.add("none");
saveAsOldButton.removeAttribute("style");

openDirButton.classList.add("none");
openDirButton.removeAttribute("style");

restoreTrashedItemButton.classList.add("invisible", "none");
restoreTrashedItemButton.removeAttribute("style");

undoLastDeleteButton.classList.add("invisible", "none");
undoLastDeleteButton.removeAttribute("style");

inputLabel.classList.add("invisible");
inputLabel.removeAttribute("style");

input.removeAttribute("style");
input.classList.add("border");

returnInputButton.style = "display:none";

let variant = true;

input.addEventListener("input", inputHandler);

const markdown = (s) => {
  s = s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");
  s = s.replace(/\u200B/, "");
  return marked.parse(s);
};

const mdToTagsWithoutShape = (el, text) => {
  el.innerHTML = markdown(text); // need to add marked.min.js
};

const showItemSortingArrows = (count) => {
  const arrows = document.getElementById("list-order");
  if (count > 1) {
    //with only opacity rule the arrows are hidden but still clickable
    arrows.style = "";
  } else {
    arrows.style = "visibility: hidden; opacity: 0";
  }
};

if (input.value) {
  xUI();
  mdToPreview(input.value);
  //preview.scrollTop = preview.scrollHeight;
}

initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();
