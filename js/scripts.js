"use strict";
const html = document.documentElement;
const form = document.querySelector("form");
const ol = document.querySelector("ol");
const button = document.querySelector("button");
const input = document.getElementById("input");
const preview = document.getElementById("preview");
const xbutton = document.getElementById("x-button");
const deleteAllItems = document.getElementById("delete-all-items");
const rbutton = document.getElementById("return-last-input-button");
const ubutton = document.getElementById("undo-delete-item");
const dcounter = document.getElementById("deleted-counter");

var output = document.getElementById("output").firstChild,
  position = document.getElementById("position");

let itemsArray = localStorage.getItem("items")
  ? JSON.parse(localStorage.getItem("items"))
  : [];

let counter = 0;
// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];
let deletedItemsArray = [];

let twoClick = false;
let nullInItemsStorage = false;
let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("last")
  ? localStorage.getItem("last")
  : "";
var scrollTop = input.scrollTop;

input.value = lastInputValue;
input.scrollTop = input.scrollHeight;

if (lastInputValue) {
  xbutton.style = "display:block";
} else {
  xbutton.style = "display:none";
}
rbutton.style = "display:none";
ubutton.style = "visibility: hidden; opacity: 0";

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
  buttonTag.setAttribute("title", "Double click to delete item");

  liTag.appendChild(buttonTag);
};

const deleteOneItem = (item) => {
  window.event.stopPropagation();
  if (twoClick && item.id === lastClickId) {
    const indexToDelete = indexedItemsArray.indexOf(item.id);

    ol.removeChild(item);
    showArrows(ol.childElementCount);

    deletedItemsArray.push(itemsArray[indexToDelete]);
    dcounter.innerText = deletedItemsArray.length;
    ubutton.style = "visibility: visible; opacity: 1";

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    localStorage.removeItem("items");
    localStorage.setItem("items", JSON.stringify(itemsArray));
    twoClick = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.style = null;
    lastClickId = item.id;
    item.lastChild.style =
      "filter: brightness(0.5) sepia(1) hue-rotate(-70deg) saturate(5);";
    lastItem = item;
    twoClick = true;
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
      rbutton.style = "display:none";

      localStorage.setItem("last", lastInputValue);
      convertToMarkdown(e.target.value);
    },
    200,
    false
  ),
  false
);

html.addEventListener("click", function () {
  if (twoClick) lastItem.lastChild.style = null;
  twoClick = false;
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  itemsArray.push(input.value);
  localStorage.setItem("items", JSON.stringify(itemsArray));

  liMaker(input.value);
  localStorage.removeItem("last");
  rbutton.style = "display:block";
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

xbutton.addEventListener("click", function (e) {
  localStorage.removeItem("last");
  rbutton.style = "display:block";
  xbutton.style = "display:none";
  input.value = "";
  preview.innerHTML = "";
});

rbutton.addEventListener("click", function () {
  input.value = lastInputValue;
  convertToMarkdown(input.value);
  localStorage.setItem("last", lastInputValue);
  rbutton.style = "display:none";
  xbutton.style = "display:block";
});

ubutton.addEventListener("click", function () {
  let len = deletedItemsArray.length;
  if (len !== 0) {
    const deletedItem = deletedItemsArray.pop();
    itemsArray.push(deletedItem);
    localStorage.setItem("items", JSON.stringify(itemsArray));

    liMaker(deletedItem);
    len = len - 1;
    dcounter.innerText = len;
  }
  if (len === 0) ubutton.style = "visibility: hidden; opacity: 0";
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
