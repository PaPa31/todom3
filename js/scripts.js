const html = document.documentElement;
const form = document.querySelector("form");
const ol = document.querySelector("ol");
const button = document.querySelector("button");
const input = document.getElementById("item");
const preview = document.getElementById("preview");
const xbutton = document.getElementById("x-button");

let itemsArray = localStorage.getItem("items")
  ? JSON.parse(localStorage.getItem("items"))
  : [];

let counter = 0;
// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];

let twoClick = false;
let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("last")
  ? localStorage.getItem("last")
  : "";

input.value = lastInputValue;
input.scrollTop = input.scrollHeight;

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counter;
  li.appendChild(div);
  ol.appendChild(li);
  aMaker(li);
  indexedItemsArray.push(counter.toString());
  showArrows(ol.childElementCount);
  counter++;
};

const aMaker = (liTag) => {
  const aTag = document.createElement("a");
  aTag.setAttribute("class", "delete-one-item");
  aTag.setAttribute("href", "javascript: void(0)");
  aTag.setAttribute("onclick", "deleteOneItem(this.parentElement)");
  aTag.setAttribute("title", "Double click to delete item");

  liTag.appendChild(aTag);
};

const deleteOneItem = (item) => {
  window.event.stopPropagation();
  if (twoClick && item.id === lastClickId) {
    const indexToDelete = indexedItemsArray.indexOf(item.id);

    ol.removeChild(item);
    showArrows(ol.childElementCount);

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
    preview.scrollTop = preview.scrollHeight;
    if (err) console.log(err);
  });
};

input.addEventListener("input", function (e) {
  lastInputValue = e.target.value;
  localStorage.setItem("last", lastInputValue);
  convertToMarkdown(e.target.value);
});

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
  input.value = "";
  preview.innerHTML = "";
});

itemsArray?.forEach((item) => {
  liMaker(item);
});

document.querySelectorAll("button")[1].addEventListener("click", function (e) {
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
  input.value = "";
  preview.innerHTML = "";
});

window.addEventListener(
  "resize",
  () => (preview.scrollTop = preview.scrollHeight)
);

convertToMarkdown(input.value);
