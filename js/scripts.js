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
  if (twoClickToTrash) lastItem.lastChild.classList.remove("filter-red");
  twoClickToTrash = false;
});

convertToMarkdown(input.value);
//preview.scrollTop = preview.scrollHeight;

const untilNewLine = function () {};

function testInput(re) {
  const midstring = re.test("\n") ? "contains" : "does not contain";
  console.log(`${"\n"} ${midstring} ${re.source}`);
}

function regexLastIndexOf(str, regex) {
  regex = regex.global
    ? regex
    : new RegExp(
        regex.source,
        "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : "")
      );
  var lastIndexOf = -1;
  var nextStop = 0;
  var result;
  while ((result = regex.exec(str)) != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
}

function regexFirstIndexOf(str, regex) {
  regex = regex.global
    ? regex
    : new RegExp(
        regex.source,
        "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : "")
      );
  var IndexOf = -1;
  var nextStop = 0;
  var result;
  while ((result = regex.exec(str)) != null) {
    IndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return IndexOf;
}

const update = function () {
  const str = input.value.substr(0, input.selectionStart);
  //.replace(/\n$/, "\n\x001");
  //output.value = input.value.substr(0, input.selectionStart);
  //.replace(/\n$/, "\n");

  //console.log(input.value.length);
  //const lent = input.value.length;
  output.value = str;

  //output.value = output.value.replace(/\n\n/g, "\n\x001\n");

  const len = str.length;
  const re = /\n/;

  //console.log(str.lastIndexOf("\n$"));

  //var matches = str.match(/\n$/g);
  //var lastMatch = matches[matches.length - 1];

  //console.log(lastMatch);

  //var pos = -1;
  //while ((match = re.exec(str)) != null) pos = match.index;

  //console.log("last match found at " + pos);

  const las = regexLastIndexOf(output.value, re);
  //console.log("las:", las);

  //if (re.test(str[len - 1])) console.log(str[len - 1]);
  //testInput(input.selectionStart);

  //console.log(input.selectionStart);

  const outputScrollTop = output.scrollHeight;
  output.scrollTop = outputScrollTop;

  //const ou = output.scrollTop

  //while

  //console.log(input.value.length);

  const inp2 = input.value.substr(las, input.value.length);
  //console.log(inp2);

  //var index = inp2.search(/\n$/);
  //var index = inp2.match(/\n$/).index;
  //console.log(index);

  //var re = /\b/g,
  //  str = "hello world";
  //var match;
  //var guard = 10;
  //while ((match = re.exec(inp2)) != null) {
  //  console.log("match found at " + match.index);
  //  if (guard-- < 0) {
  //    console.error("Infinite loop detected");
  //    break;
  //  }
  //}

  const firs = regexFirstIndexOf(inp2, re);
  //console.log("firs:", firs);

  //var match1;
  //while ((match1 = re.exec(inp2)) != null) {
  //  console.log(match1.index + " " + re.lastIndex);
  //}
  //const splitInput = text.substring(text.length - 4);

  //const firs = /[\n]*/.exec(inp2)[0];
  //console.log("firs:", firs);

  //marked.parse(output.value.substr(0, las + 1), (err, html) => {

  let rep = /\n\n/;
  //rep = rep.global
  //  ? rep
  //  : new RegExp(
  //      rep.source,
  //      "g" + (rep.ignoreCase ? "i" : "") + (rep.multiLine ? "m" : "")
  //    );
  //console.log(str[len - 1]);
  //console.log(output.value[len - 1]);
  //console.log(output.value.substr(0, las + 1));

  //let stri = output.value.substr(0, las + 1);
  //.replace(/\n$/g, "\n\x001");
  //if (rep.test(output.value)) {
  let stri;
  if (output.value.slice(-2) == "\n\n" || (firs === 0 && las !== -1)) {
    //console.log("Happy");

    //if (output.value[len - 1] == "\x001") {
    //console.log("alone new line");
    stri = output.value;
  } else {
    stri = output.value.substr(0, las + 1);
  }

  //console.log(output.value.length);

  if (firs === 0 && las !== -1) {
    //console.log("krai");
    stri = stri.replace(/\n\x001\n/, "\n\n");
    //stri = stri.replace(/\n$/, "\n\x001");
    //stri = stri.replace(/(.*)$/, "$1\n\x001\n");

    const gap = input.value.length - str.length;
    console.log("gap:", gap);
    //const replaceThis = /(.)\`${gap}`$/;
    //console.log(replaceThis);
    //output.value = output.value.replace(/(\n.*)$/, "$1\n");
    //const repl = new RegExp(`${replaceThis}`, "g");
    //str.replace(re, withThis);
    //stri = stri.replace(/(\n.*)$/, "$1\nbuba");
    stri = input.value; //.replace(/(\n.*)$/, "$1\n");
    //position.value = input.value.replace(/(\n.*)$/, "$1\nbuba");
    //console.log(stri);
  } else {
    stri = stri.replace(/\n\n$/, "\n\x001\n");
  }
  //if (output.value.length == input.value.length) {
  //  console.log("krai");
  //  stri.replace(/.$/, "\n\x001");
  //}
  //const stri = rep.test(output.value)
  //  ? output.value.substr(0, las + 1)
  //  : output.value;

  //console.log(stri);

  marked.parse(stri, (err, html) => {
    position.innerHTML = html;

    const scrollTop = position.scrollHeight;

    //console.log("position.scrollHeight:", position.scrollHeight);

    //console.log("position.scrollTop", position.scrollTop);

    position.scrollTop = scrollTop;
    //console.log("position.scrollTop", position.scrollTop);
    preview.scrollTop = position.scrollTop;
    //preview.scrollHeight = position.scrollHeight;
    //const scrolll = position.scrollTop;
    //preview.scrollTop = scrolll;
    //console.log("preview.scrollHeight", preview.scrollHeight);
    //console.log("preview.scrollTop", preview.scrollTop);

    if (err) console.log(err);
  });

  //if (position.scrollTop == preview.scrollTop) {
  //  console.log("hi");
  //} else {
  //  console.log("bye");
  //}
};

input.addEventListener("keyup", update);
input.addEventListener("mouseup", update);
//position.addEventListener("scroll", debounce(update, 50, false));
