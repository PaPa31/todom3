"use strict";
const html = document.documentElement;
const form = document.querySelector("form");
const ol = document.querySelector("ol");
const button = document.querySelector("button");
const input = document.getElementById("input");
const preview = document.getElementById("preview");
const xbutton = document.getElementById("x-button");
const deleteAllItems = document.getElementById("delete-all-items");
const returnButton = document.getElementById("return-last-input-button");
const restoreButton = document.getElementById("restore-deleted-item");
const deletedCounter = document.getElementById("deleted-counter");
const trashManager = document.getElementById("trash-manager");
const clearTrash = document.getElementById("clear-trash");

var output = document.getElementById("output").firstChild,
  position = document.getElementById("position");

let itemsArray = localStorage.getItem("items")
  ? JSON.parse(localStorage.getItem("items"))
  : [];

let counter = 0;
// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];
let trashArray = localStorage.getItem("trash")
  ? JSON.parse(localStorage.getItem("trash"))
  : [];

if (trashArray.length) {
  deletedCounter.innerText = trashArray.length;
  trashManager.style = "visibility: visible; opacity: 1";
} else {
  trashManager.style = "visibility: hidden; opacity: 0";
}

let twoClickToTrash = false;
let twoClickTrashClear = false;

let nullInItemsStorage = false;

let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("last")
  ? localStorage.getItem("last")
  : "";

if (lastInputValue) {
  xbutton.style = "display:block";
} else {
  xbutton.style = "display:none";
}

var scrollTop = input.scrollTop;

input.value = lastInputValue;
input.scrollTop = input.scrollHeight;

returnButton.style = "display:none";

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counter;
  li.appendChild(div);
  ol.appendChild(li);
  spanMaker(li);
  buttonMaker(li);
  indexedItemsArray.push(counter.toString());
  showArrows(ol.childElementCount);
  counter++;
};

const spanMaker = (liTag) => {
  const spanTag = document.createElement("span");
  liTag.appendChild(spanTag);
};

const buttonMaker = (liTag) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-one-item");
  buttonTag.setAttribute("onclick", "deleteOneItem(this.parentElement)");
  buttonTag.setAttribute("title", "Double-click to trash");

  liTag.appendChild(buttonTag);
};

const deleteOneItem = (item) => {
  window.event.stopPropagation();
  if (twoClickToTrash && item.id === lastClickId) {
    const indexToDelete = indexedItemsArray.indexOf(item.id);

    ol.removeChild(item);
    showArrows(ol.childElementCount);

    trashArray.push(itemsArray[indexToDelete]);
    deletedCounter.innerText = trashArray.length;
    trashManager.style = "visibility: visible; opacity: 1";
    localStorage.setItem("trash", JSON.stringify(trashArray));

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    localStorage.removeItem("items");
    localStorage.setItem("items", JSON.stringify(itemsArray));
    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.style = null;
    lastClickId = item.id;
    item.lastChild.style =
      "filter: brightness(0.5) sepia(1) hue-rotate(-70deg) saturate(5);";
    lastItem = item;
    twoClickToTrash = true;
  }
};

const showArrows = (count) => {
  const arrows = document.getElementById("list-order");
  if (count > 1) {
    //with only opacity rule the arrows are hidden but still clickable
    arrows.style = "visibility: visible; opacity: 1";
  } else {
    arrows.style = "visibility: hidden; opacity: 0";
  }
};

const convertToMarkdown = (markdownString) => {
  marked.parse(markdownString, (err, html) => {
    preview.innerHTML = html;

    if (err) console.log(err);
  });
};

const debounce = (func, wait, immediate) => {
  let timeout;
  return function counter() {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

input.addEventListener(
  "input",
  debounce(
    function (e) {
      lastInputValue = e.target.value;
      if (lastInputValue) {
        xbutton.style = "display:block";
      } else {
        xbutton.style = "display:none";
      }
      returnButton.style = "display:none";

      localStorage.setItem("last", lastInputValue);
      convertToMarkdown(e.target.value);
    },
    200,
    false
  ),
  false
);

html.addEventListener("click", function () {
  if (twoClickTrashClear) clearTrash.classList.remove("border-red");
  twoClickTrashClear = false;
  if (twoClickToTrash) lastItem.lastChild.style = null;
  twoClickToTrash = false;
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  itemsArray.push(input.value);
  localStorage.setItem("items", JSON.stringify(itemsArray));

  liMaker(input.value);
  localStorage.removeItem("last");
  returnButton.style = "display:block";
  xbutton.style = "display:none";
  input.value = "";
  preview.innerHTML = "";
});

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

deleteAllItems.addEventListener("click", function (e) {
  if (confirm("Are you sure?")) {
    localStorage.removeItem("items");
    indexedItemsArray = [];
    itemsArray = [];
    counter = 0;
    showArrows(0);
    while (ol.firstChild) {
      ol.removeChild(ol.firstChild);
    }
  } else {
    e.preventDefault();
  }
});

xbutton.addEventListener("click", function () {
  localStorage.removeItem("last");
  returnButton.style = "display:block";
  xbutton.style = "display:none";
  input.value = "";
  preview.innerHTML = "";
});

returnButton.addEventListener("click", function () {
  input.value = lastInputValue;
  convertToMarkdown(input.value);
  localStorage.setItem("last", lastInputValue);
  returnButton.style = "display:none";
  xbutton.style = "display:block";
});

restoreButton.addEventListener("click", function () {
  let len = trashArray.length;
  if (len !== 0) {
    const deletedItem = trashArray.pop();
    itemsArray.push(deletedItem);
    localStorage.setItem("items", JSON.stringify(itemsArray));
    localStorage.setItem("trash", JSON.stringify(trashArray));

    liMaker(deletedItem);
    len = len - 1;
    deletedCounter.innerText = len;
  }
  if (len === 0) {
    trashManager.style = "visibility: hidden; opacity: 0";
    localStorage.removeItem("trash");
  }
});

clearTrash.addEventListener("click", function (e) {
  e.stopPropagation();
  if (twoClickTrashClear) {
    trashArray = [];
    localStorage.removeItem("trash");
    trashManager.style = "visibility: hidden; opacity: 0";
    clearTrash.classList.remove("border-red");
    twoClickTrashClear = false;
  } else {
    clearTrash.classList.add("border-red");
    twoClickTrashClear = true;
  }
});

convertToMarkdown(input.value);
//preview.scrollTop = preview.scrollHeight;

const update = function () {
  output.innerHTML = input.value
    .substr(0, input.selectionStart)
    .replace(/\n$/, "\n\x001");

  marked.parse(output.innerHTML, (err, html) => {
    position.innerHTML = html;
    scrollTop = position.scrollHeight - 70;
    preview.scrollTop = scrollTop;
    if (err) console.log(err);
  });
};

input.addEventListener("keyup", update);
input.addEventListener("mouseup", update);
//input.addEventListener("scroll", update);
