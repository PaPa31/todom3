"use strict";
const html = document.documentElement;
const form = document.querySelector("form");
const ol = document.querySelector("ol");

const input = document.getElementById("input");
const preview = document.getElementById("preview");

const xButton = document.getElementById("x-button");
const returnInputButton = document.getElementById("return-last-input");

const deleteAllItemsButton = document.getElementById("delete-all-items");
const restoreItemButton = document.getElementById("restore-deleted-item");
const clearTrashButton = document.getElementById("clear-trash");

const deletedCounter = document.getElementById("deleted-counter");

const output = document.getElementById("output").firstChild;
const position = document.getElementById("position");

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
  restoreItemButton.classList.add("visible");
  clearTrashButton.classList.add("visible");
} else {
  restoreItemButton.classList.remove("visible");
  clearTrashButton.classList.remove("visible");
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
  xButton.style = "display:block";
} else {
  xButton.style = "display:none";
}

var scrollTop = input.scrollTop;

input.value = lastInputValue;
input.scrollTop = input.scrollHeight;

returnInputButton.style = "display:none";

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
  buttonTag.setAttribute("class", "delete-one-item btn");
  buttonTag.setAttribute("onclick", "deleteOneItem(this.parentElement)");
  buttonTag.setAttribute("title", "Double-click to move to Trash");

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
    restoreItemButton.classList.add("visible");
    clearTrashButton.classList.add("visible");
    localStorage.setItem("trash", JSON.stringify(trashArray));

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    localStorage.removeItem("items");
    localStorage.setItem("items", JSON.stringify(itemsArray));
    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.classList.remove("filter-red");
    lastClickId = item.id;
    item.lastChild.classList.add("filter-red");
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
        xButton.style = "display:block";
      } else {
        xButton.style = "display:none";
      }
      returnInputButton.style = "display:none";

      localStorage.setItem("last", lastInputValue);
      convertToMarkdown(e.target.value);
    },
    200,
    false
  ),
  false
);

html.addEventListener("click", function () {
  if (twoClickTrashClear) clearTrashButton.classList.remove("border-red");
  twoClickTrashClear = false;
  if (twoClickToTrash) lastItem.lastChild.classList.remove("filter-red");
  twoClickToTrash = false;
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  itemsArray.push(input.value);
  localStorage.setItem("items", JSON.stringify(itemsArray));

  liMaker(input.value);
  localStorage.removeItem("last");
  returnInputButton.style = "display:block";
  xButton.style = "display:none";
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

deleteAllItemsButton.addEventListener("click", function (e) {
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

xButton.addEventListener("click", function () {
  localStorage.removeItem("last");
  returnInputButton.style = "display:block";
  xButton.style = "display:none";
  input.value = "";
  preview.innerHTML = "";
});

returnInputButton.addEventListener("click", function () {
  input.value = lastInputValue;
  convertToMarkdown(input.value);
  localStorage.setItem("last", lastInputValue);
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
});

restoreItemButton.addEventListener("click", function () {
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
    restoreItemButton.classList.remove("visible");
    clearTrashButton.classList.remove("visible");
    localStorage.removeItem("trash");
  }
});

clearTrashButton.addEventListener("click", function (e) {
  e.stopPropagation();
  if (twoClickTrashClear) {
    trashArray = [];
    deletedCounter.innerText = "";
    localStorage.removeItem("trash");
    restoreItemButton.classList.remove("visible");
    clearTrashButton.classList.remove("visible");
    clearTrashButton.classList.remove("border-red");
    twoClickTrashClear = false;
  } else {
    clearTrashButton.classList.add("border-red");
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
    scrollTop = position.scrollHeight;
    //console.log(scrollTop);

    position.scrollTop = scrollTop;

    const scrolll = position.scrollTop;
    //console.log(scrolll);
    preview.scrollTop = scrolll;

    if (err) console.log(err);
  });
};

input.addEventListener("keyup", update);
input.addEventListener("mouseup", update);
position.addEventListener("scroll", debounce(update, 50, false));
