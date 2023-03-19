"use strict";
const html = document.documentElement;
const form = document.querySelector("form");
const ol = document.querySelector("ol");
const button = document.querySelector("button");
const input = document.getElementById("input");
const preview = document.getElementById("preview");
const xbutton = document.getElementById("x-button");

var output = document.getElementById("output").firstChild,
  position = document.getElementById("position"),
  xy = document.getElementById("xy");

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
var scrollTop = input.scrollTop;

input.value = lastInputValue;
input.scrollTop = input.scrollHeight;

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counter;
  li.appendChild(div);
  ol.appendChild(li);
  spanMaker(li);
  aMaker(li);
  indexedItemsArray.push(counter.toString());
  showArrows(ol.childElementCount);
  counter++;
};

const spanMaker = (liTag) => {
  const spanTag = document.createElement("span");
  liTag.appendChild(spanTag);
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
    //scrollTop = output.scrollTop;
    //const valueEqualTo100Proc = input.scrollHeight;
    //const proc1 = valueEqualTo100Proc / 100;
    //const amountOfProc = (scrollTop / valueEqualTo100Proc) * 100;
    //console.log("raznica:::", input.scrollHeight - Math.round(input.scrollTop));
    //console.log("this.clientHeight:", input.clientHeight);
    //console.log(input.top);
    //console.log(proc1);
    //console.log("input.scrollHeight:", input.scrollHeight);
    //console.log("input.scrollTop:", scrollTop);
    //console.log(amountOfProc);
    //console.log(input.offsetTop);
    //console.log("input.offsetHeight:", input.offsetHeight);
    //const offsetSum = input.offsetTop + input.offsetHeight;
    //console.log(offsetSum);
    //var percentage =
    //  input.scrollTop / (input.scrollHeight - input.offsetHeight);
    //console.log(percentage);
    //console.log(input.getBoundingClientRect().top);
    //console.log(getOffsetTop / input.innerHeight);

    //var position = input.startOffset;
    //console.log(position);

    //preview.scrollTop = scrollTop;

    //preview.scrollTop = preview.scrollHeight;
    //preview.scrollIntoView({
    //  behavior: "smooth",
    //  block: "nearest",
    //  inline: "start",
    //});
    if (err) console.log(err);
  });
};

const debounce = (func, wait, immediate) => {
  let timeout;
  let count = 0;
  return function counter() {
    count += 1;
    const context = this,
      args = arguments;
    //console.log("count: ", count);
    //console.log("context = ", context);
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
  debounce(
    (e) => {
      //console.log("hello");
      //console.log(e.target.innerHeight);
      //console.log("preview.offsetHeight = ", preview.offsetHeight);
      //console.log(preview.__proto__);
      //console.log(preview.toString());
      //console.log(preview.currentTarget.nodeName);
      if (preview.offsetHeight > 160) {
        scrollTop = output.scrollTop;
        //console.log("> 160");
        //preview.scrollTop = preview.scrollHeight;
        preview.scrollTop = scrollTop;
        //preview.scrollIntoView({
        //  behavior: "smooth",
        //  block: "nearest",
        //  inline: "start",
        //});
      }
    },
    200,
    false
  ),
  false
);

convertToMarkdown(input.value);

//handleScroll(e) {
//    let scrollInfo = codeMirror.getScrollInfo();

//    // get line number of the top line in the page
//    let lineNumber = codeMirror.lineAtHeight(scrollInfo.top, 'local');
//    // get the text content from the start to the target line
//    let range = codeMirror.getRange({line: 0, ch: null}, {line: lineNumber, ch: null});
//    var parser = new DOMParser();
//    var doc = parser.parseFromString(marked(range), 'text/html');
//    let totalLines = doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, pre, blockquote, hr, table');
//    return totalLines.length;
//}

//shouldPreviewScroll(length) {
//    let body = React.findDOMNode(this.refs.body);
//    let elems = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, pre, blockquote, hr, table');
//    if (elems.length > 0) {
//        $(body).stop();
//        $(body).animate({ scrollTop: elems[this.props.state.currentLine].offsetTop, queue: false });
//    }
//}

const update = function () {
  console.log("hi");
  output.innerHTML = input.value
    .substr(0, input.selectionStart)
    .replace(/\n$/, "\n\x001");

  marked.parse(output.innerHTML, (err, html) => {
    position.innerHTML = html;

    const scrollTop1 =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollLeft1 =
      document.documentElement.scrollLeft || document.body.scrollLeft;

    var rects = position.getClientRects();
    var lastRect = rects[rects.length - 1];
    console.log("lastRect", lastRect);
    console.log(position.scrollTop);
    //var top = position.scrollHeight - 55;
    //var left = position.offsetLeft;

    //var top = lastRect.top - position.scrollTop;
    //var left = lastRect.left + lastRect.width;

    var top = `${lastRect.top + scrollTop1}px`;
    var left = `${lastRect.left + scrollLeft1}px`;

    //console.log(lastRect);
    xy.style.cssText = "top: " + top + "px;left: " + left + "px";

    scrollTop = position.scrollHeight - 55;
    console.log(position.scrollLeft);
    console.log("position.scrollHeight - 55:", scrollTop);
    preview.scrollTop = scrollTop;

    if (err) console.log(err);
  });
};

input.addEventListener("keyup", update);
input.addEventListener("mouseup", update);
input.addEventListener("scroll", update);
