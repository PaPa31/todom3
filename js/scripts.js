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

const output = document.getElementById("output");
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

//var scrollTop = input.scrollTop;

input.value = lastInputValue;
input.scrollTop = input.scrollHeight;

returnInputButton.style = "display:none";

let indexToEdit;
let editedItem;

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counter;
  li.appendChild(div);
  ol.appendChild(li);
  spanMaker(li);
  indexedItemsArray.push(counter.toString());
  showArrows(ol.childElementCount);
  counter++;
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
  buttonTag.setAttribute("onclick", "deleteOneItem(this.parentElement)");
  buttonTag.setAttribute("title", "Double-click to move to Trash");

  liTag.appendChild(buttonTag);
};

const editItem = (item) => {
  //console.log(item.firstChild);
  window.event.stopPropagation();
  indexToEdit = indexedItemsArray.indexOf(item.id);

  editedItem = item;

  //console.log("indexToEdit:", indexToEdit);

  input.value = itemsArray[indexToEdit];

  input.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "center",
  });
  window.setTimeout(function () {
    input.focus();
  }, 1000);
  mdToPreview(input.value);
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
  if (twoClickTrashClear) clearTrashButton.classList.remove("border-red");
  twoClickTrashClear = false;
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

const mdToPreview = (markdownString) => {
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
      mdToPreview(e.target.value);
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

function scrollToTargetAdjusted(targetElement, offset) {
  const element = document.getElementById(targetElement);
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + offset;

  window.scrollBy({
    top: offsetPosition,
    behavior: "smooth",
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  console.log("indexToEdit:", indexToEdit);
  if (indexToEdit != null) {
    console.log("old");
    itemsArray[indexToEdit] = input.value;
    indexToEdit = null;
    //ol.removeChild(item);
    //const editedItem = document.getElementById(indexToEdit);
    console.log("editedItem:", editedItem);
    editedItem.firstChild.innerHTML = marked.parse(input.value);

    //editedItem.focus();
    //editedItem.scrollIntoView({
    //  behavior: "smooth",
    //  inline: "center",
    //  block: "center",
    //});
    //editedItem.offset = preview.scrollTop;
    //preview.scrollTop = preview.scrollHeight;
    scrollToTargetAdjusted(editedItem.id, preview.scrollTop);
  } else {
    console.log("new");
    itemsArray.push(input.value);
    liMaker(input.value);
  }

  localStorage.setItem("items", JSON.stringify(itemsArray));

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
  mdToPreview(input.value);
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
  if (twoClickToTrash) lastItem.lastChild.classList.remove("filter-red");
  twoClickToTrash = false;
});

mdToPreview(input.value);
//preview.scrollTop = preview.scrollHeight;

const lastNewLine = function (str) {
  let caret = str.length - 1;
  let sym = str[caret];
  while (sym != "\n" && caret > 0) {
    caret--;
    sym = str[caret];
  }
  return caret;
};

const update = function () {
  const head = input.value.substr(0, input.selectionStart);

  //console.log("head.length:", head.length);

  //console.log("input.value.length:", input.value.length);

  output.value = head;

  output.scrollTop = output.scrollHeight;

  const headLastNewLine = lastNewLine(head);
  //console.log("headLastNewLine:", headLastNewLine);

  //const gap = input.value.length - head.length;
  //console.log("gap:", gap);

  const endHead = headLastNewLine != -1 ? headLastNewLine : head.length;

  const tail = input.value.substr(endHead, input.value.length);
  //console.log(tail);

  const tailLastNewLine = lastNewLine(tail);
  //console.log("tailLastNewLine:", tailLastNewLine);

  let stringToPreview = "";
  if (head.length)
    if (tailLastNewLine == 0) {
      //console.log("stop! we are on the edge!");
      stringToPreview = input.value;
    } else {
      if (head.slice(-2) == "\n\n") {
        //console.log("double newline");
        stringToPreview = head;
      } else {
        //console.log("single newline");
        stringToPreview = head.substr(0, endHead + 1);
      }
      stringToPreview = stringToPreview.replace(/\n\n$/, "\n\x001\n");
    }

  //console.log(stringToPreview);

  marked.parse(stringToPreview, (err, html) => {
    position.innerHTML = html;

    const scrollTop = position.scrollHeight;
    position.scrollTop = scrollTop;
    preview.scrollTop = position.scrollTop;

    if (err) console.log(err);
  });
};

input.addEventListener("keyup", update);
input.addEventListener("mouseup", update);
//position.addEventListener("scroll", debounce(update, 50, false));
