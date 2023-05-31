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
const saveButton = document.getElementById("save-button");
const saveAsFileButton = document.getElementById("save-as-file");
const openFileButton = document.getElementById("open-file");
const openDirButton = document.getElementById("open-dir");

const deletedCounter = document.getElementById("deleted-counter");

const output = document.getElementById("output");
const position = document.getElementById("position");

const inputLabel = document.getElementById("input-label");

clearTrashButton.classList.add("invisible", "none");
clearTrashButton.removeAttribute("style");

deleteAllItemsButton.classList.add("invisible");
deleteAllItemsButton.removeAttribute("style");

saveAsFileButton.classList.add("inline-block");

openDirButton.classList.add("none");
openDirButton.removeAttribute("style");

restoreItemButton.classList.add("invisible", "none");
restoreItemButton.removeAttribute("style");

inputLabel.classList.add("invisible");
inputLabel.removeAttribute("style");

input.removeAttribute("style");
input.classList.add("border");

returnInputButton.style = "display:none";

if (lastInputValue) {
  xButton.style = "display:block";
  inputLabel.classList.replace("invisible", "visible");
  input.value = lastInputValue;
  input.scrollTop = input.scrollHeight;
} else {
  xButton.style = "display:none";
}

const scrollToLast = () => {
  preview.scrollIntoView(false);
  input.focus();
};

const editUI = (label) => {
  input.classList.replace("border", "border-edit");
  input.classList.add("bg");
  xButton.title = "Cancel edit";

  inputLabel.innerHTML = `<span>Edit: </span><span>${label}</span>`;
  inputLabel.classList.replace("invisible", "visible");

  scrollToLast();

  intervalFocus(form, "background-color: orange;", 300);
};

const xUI = () => {
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
  position.innerHTML = "";
};

const editItem = (e, element) => {
  editedItemElementDOM = element.parentElement.parentElement;
  itemIndexToEdit = indexedItemsArray.indexOf(editedItemElementDOM.id) * 1;
  const editing = itemsArray[itemIndexToEdit].text;
  if (e.ctrlKey) {
    intervalFocus(element, "background-color: #685a7f;", 300);
    input.value = input.value
      ? /^ *- /.test(editing)
        ? input.value + "\n" + editing
        : input.value + "\\\n" + editing
      : editing;
    scrollToLast();
  } else {
    intervalFocus(element, "background-color: orange;", 300);
    input.value = editing;
    editUI("#" + (itemIndexToEdit + 1));
  }
  xUI();
  mdToPreview(input.value);
};

const deleteOneItem = (e, item) => {
  e.stopPropagation();
  if ((twoClickToTrash && item.id === lastClickId) || e.ctrlKey) {
    const indexToDelete = indexedItemsArray.indexOf(item.id) * 1;

    if (itemIndexToEdit != null && itemIndexToEdit >= indexToDelete) {
      if (itemIndexToEdit == indexToDelete) {
        defaultMarkers();
        inputLabel.innerHTML = "<div>New</div>";
      } else {
        itemIndexToEdit = itemIndexToEdit - 1;
        inputLabel.innerHTML = `<span>Edit: </span><span>#${
          itemIndexToEdit + 1
        }</span>`;
      }
    }

    ol.removeChild(item);
    showItemSortingArrows(ol.childElementCount);

    if (!e.ctrlKey) {
      trashArray.push(itemsArray[indexToDelete]);
      deletedCounter.innerText = trashArray.length;
      restoreItemButton.classList.replace("invisible", "visible");
      clearTrashButton.classList.replace("invisible", "visible");
      localStorage.setItem("todomTrashArray", JSON.stringify(trashArray));
    }

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    showOrHideDeleteAllItems();

    if (itemsArray.length == 0) {
      localStorage.removeItem("todomItemsArray");
    } else {
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    }
    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.lastChild.classList.remove("filter-red");
    lastClickId = item.id;
    item.lastChild.lastChild.classList.add("filter-red");
    lastItem = item;
    twoClickToTrash = true;
  }
  if (lastItem && e.ctrlKey)
    lastItem.lastChild.lastChild.classList.remove("filter-red");
  if (twoClickTrashClear || e.ctrlKey) {
    clearTrashButton.classList.remove("filter-red");
    //clearTrashButton.classList.remove("border-red");
  }
  twoClickTrashClear = false;
};

const showItemSortingArrows = (count) => {
  const arrows = document.getElementById("list-order");
  if (count > 1) {
    //with only opacity rule the arrows are hidden but still clickable
    arrows.style = "visibility: visible; opacity: 1";
  } else {
    arrows.style = "visibility: hidden; opacity: 0";
  }
};

const mdToPreview = (markdownString) => {
  preview.innerHTML = markdown(markdownString);
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

html.addEventListener("click", function () {
  if (twoClickTrashClear) clearTrashButton.classList.remove("filter-red");
  twoClickTrashClear = false;
  if (twoClickToTrash)
    lastItem.lastChild.lastChild.classList.remove("filter-red");
  twoClickToTrash = false;
});

const intervalFocus = (element, cssRule, interval) => {
  element.style = cssRule;
  window.setTimeout(function () {
    element.removeAttribute("style");
  }, interval);
};

function scrollToTargetAdjusted(targetElement, offset) {
  const elementPosition = targetElement.getBoundingClientRect().top;
  const offsetPosition = elementPosition + offset;

  if (window.innerHeight < offsetPosition)
    window.scrollBy({
      top: offsetPosition,
    });

  intervalFocus(targetElement, "background-color: orange;", 300);
}

openDirButton.addEventListener("click", function (e) {
  fileElem.setAttribute("webkitdirectory", "true");
  fileElem.click();
});

openFileButton.addEventListener("click", function (e) {
  fileElem.removeAttribute("webkitdirectory");
  fileElem.click();
});

saveAsFileButton.addEventListener("click", function (e) {
  if (input.value) {
    var fileName =
      getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
    var myFile = new File([input.value], fileName, {
      type: "text/plain;charset=utf-8",
    });
    saveAs(myFile);
  }
});

const fileDownload = (fileName) => {
  var blob = new Blob([input.value], {
    type: "text/plain;charset=utf-8",
  });

  fileSizeGlobal = blob.size;

  if (typeof window.navigator.msSaveBlob !== "undefined") {
    window.navigator.msSaveBlob(blob, fileName);
  } else {
    var blobURL =
      window.URL && window.URL.createObjectURL
        ? window.URL.createObjectURL(blob)
        : window.webkitURL.createObjectURL(blob);
    var tempLink = document.createElement("a");
    tempLink.style.display = "none";
    tempLink.href = blobURL;
    tempLink.setAttribute("download", fileName);

    if (typeof tempLink.download === "undefined") {
      tempLink.setAttribute("target", "_blank");
    }
    tempLink.addEventListener("click", (e) => {
      e.stopPropagation();
      initialize();
    });

    document.body.appendChild(tempLink);
    tempLink.click();

    setTimeout(function () {
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobURL);
    }, 1000);
  }
};

function getCurrentDate() {
  var today = new Date();
  //var y = today.getFullYear();
  // JavaScript months are 0-based.
  //var m = ("0" + (today.getMonth() + 1)).slice(-2);
  var d = ("0" + today.getDate()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var hour = ("0" + today.getHours()).slice(-2);
  var t = hour + minutes + seconds;
  return d + "-" + t;
}

function getFirstCharsWithTrim(s) {
  s = s.replace(/[^\p{L}\p{N}]+/gu, " ");
  s = s.replace(/(^\s*)|(\s*$)/gi, "");
  s = s.replace(/[ ]{2,}/gi, " ");
  s = s.replace(/\n /, "\n");
  s = s.toLowerCase();
  s = s.replace(/\s+/g, "-");
  s = s.slice(0, 21);
  return s.replace(/-$/, "");
}

const saveFile = (offset) => {
  let fileName;

  if (input.value) {
    if (fileIndexToEdit != null) {
      const _fi = filesArray[fileIndexToEdit];
      fileName = _fi.name;
      _fi.text = input.value;
      offsetGlobal = offset;
      fileDownload(fileName);
    } else {
      fileName =
        getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
      const obj = { name: fileName, text: input.value };
      filesArray.push(obj);
      indexedFilesArray.push(counterFiles.toString());
      offsetGlobal = offset;
      fileDownload(fileName);
    }
  }
};

const markdown = (s) => {
  s = s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");
  s = s.replace(/\u200B/, "");
  return marked.parse(s);
};

const disableButton = (el) => {
  if (isItemState && el.firstChild.scrollHeight < 40) {
    el.firstChild.nextSibling.setAttribute("disable", true);
    el.firstChild.nextSibling.setAttribute("title", "fold/unfold one");
  } else {
    el.firstChild.nextSibling.removeAttribute("disable");
    el.firstChild.nextSibling.removeAttribute("title");
  }
};

const saveItem = (offset) => {
  if (itemIndexToEdit != null) {
    itemsArray[itemIndexToEdit].text = input.value;
    editedItemElementDOM.firstChild.innerHTML = markdown(input.value);
    disableButton(editedItemElementDOM);
    scrollToTargetAdjusted(editedItemElementDOM, offset);
  } else {
    const obj = {
      text: input.value,
    };
    itemsArray.push(obj);
    indexedItemsArray.push(counterItems.toString());
    const newItem = indexedItemsArray.indexOf(counterItems.toString()) * 1;
    liMaker(newItem);

    counterItems++;
  }
  defaultMarkers();
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const previewOffset = preview.scrollTop;
  if (isItemState) {
    saveItem(previewOffset);
    clearInputAndPreviewAreas();
    localStorage.removeItem("todomLastInputValue");
    hideAndNewInputLabel();
    ifReturnAndNoneX();
    showOrHideDeleteAllItems();
  } else {
    saveFile(previewOffset);
  }
});

const defaultFileStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedFilesArray = [];
  filesArray = [];
  counterFiles = 0;
  fileElem.value = null;
  showItemSortingArrows(0);
  ol.innerHTML = "";
};

const defaultItemStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedItemsArray = [];
  itemsArray = [];
  counterItems = 0;
  showItemSortingArrows(0);
  ol.innerHTML = "";
};

document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "Control":
      if (isItemState && itemsArray.length != 0)
        deleteAllItemsButton.innerText = "Merge All Items";
      foldedClass.classList.add("ctrl");
      break;
  }
});

document.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "Control":
      if (isItemState && itemsArray.length != 0)
        deleteAllItemsButton.innerText = "Delete All Items";
      foldedClass.classList.remove("ctrl");
      break;
  }
});

const mergeAllItems = () => {
  //const _inv = input.value;
  itemsArray.forEach((item) => {
    const _itt = item.text;
    if (_itt) {
      input.value = input.value
        ? /^ *- /.test(_itt)
          ? input.value + "\n" + _itt
          : input.value + "\\\n" + _itt
        : _itt;
    }
  });
  xUI();
  mdToPreview(input.value);
  scrollToLast();
};

deleteAllItemsButton.addEventListener("click", function (e) {
  if (isItemState) {
    if (e.ctrlKey) {
      mergeAllItems();
    } else {
      if (confirm("Are you sure?")) {
        defaultItemStateVars();
        localStorage.removeItem("todomItemsArray");
      } else {
        e.preventDefault();
      }
    }
  } else {
    if (confirm("Are you sure?")) {
      defaultFileStateVars();
    } else {
      e.preventDefault();
    }
  }
});

const defaultMarkers = () => {
  itemIndexToEdit = null;
  fileIndexToEdit = null;
  input.classList.replace("border-edit", "border");
  input.classList.remove("bg");
  xButton.title = "Clear input";
};

const hideAndNewInputLabel = () => {
  inputLabel.classList.replace("visible", "invisible");
  window.setTimeout(function () {
    inputLabel.innerHTML = "<div>New</div>";
  }, 300);
};

const ifReturnAndNoneX = () => {
  if (lastInputValue) {
    returnInputButton.style = "display:block";
  }
  xButton.style = "display:none";
};

const clearInputAndPreviewAreas = () => {
  input.value = "";
  preview.innerHTML = "";
  position.innerHTML = "";
};

xButton.addEventListener("click", function (e) {
  if (itemIndexToEdit != null || fileIndexToEdit != null) {
    defaultMarkers();
  } else {
    localStorage.removeItem("todomLastInputValue");
  }

  hideAndNewInputLabel();
  ifReturnAndNoneX();
  clearInputAndPreviewAreas();
  input.focus();
});

returnInputButton.addEventListener("click", function () {
  input.value = lastInputValue;
  mdToPreview(input.value);
  localStorage.setItem("todomLastInputValue", lastInputValue);
  inputLabel.classList.replace("invisible", "visible");
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
  input.focus();
});

restoreItemButton.addEventListener("click", function () {
  let len = trashArray.length;
  if (len !== 0) {
    itemsArray.push(trashArray.pop());
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    localStorage.setItem("todomTrashArray", JSON.stringify(trashArray));

    //const le = itemsArray.length - 1;
    indexedItemsArray.push(counterItems.toString());
    const newItem = indexedItemsArray.indexOf(counterItems.toString()) * 1;
    liMaker(newItem);

    counterItems++;
    len = len - 1;
    deletedCounter.innerText = len;
  }
  if (len === 0) {
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
    localStorage.removeItem("todomTrashArray");
  }
  deleteAllItemsButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("invisible", "visible");
});

clearTrashButton.addEventListener("click", function (e) {
  e.stopPropagation();
  if (twoClickTrashClear) {
    trashArray = [];
    localStorage.removeItem("todomTrashArray");
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.remove("filter-red");
    window.setTimeout(function () {
      deletedCounter.innerText = "";
    }, 300);
    twoClickTrashClear = false;
  } else {
    clearTrashButton.classList.add("filter-red");
    twoClickTrashClear = true;
  }
  if (twoClickToTrash)
    lastItem.lastChild.lastChild.classList.remove("filter-red");
  twoClickToTrash = false;
});

mdToPreview(input.value);
//preview.scrollTop = preview.scrollHeight;

const lastNewLine = function (str) {
  let caret = str.length - 1;
  const currentSymbolWidth = caret;
  let sym = str[caret];

  while (sym != "\n" && currentSymbolWidth - caret < 80 && caret > 0) {
    caret--;
    sym = str[caret];
  }
  return caret;
};

const lastSeven = () => {
  const l7 = preview.lastElementChild.innerHTML.slice(-7);
  if (l7 != ">&nbsp;") preview.lastElementChild.innerHTML += "<br/>&nbsp;";
};

const lastSevenPosition = () => {
  const l7 = position.lastElementChild.innerHTML.slice(-7);
  if (l7 != ">&nbsp;") position.lastElementChild.innerHTML += "<br/>&nbsp;";
};

const update = function () {
  const head = input.selectionStart
    ? input.value.substr(0, input.selectionStart)
    : input.value.substr(0, 1);

  output.value = head;
  output.scrollTop = output.scrollHeight;

  const headLastNewLine = lastNewLine(head);
  const endHead = headLastNewLine != -1 ? headLastNewLine : head.length;
  const tail = input.value.substr(endHead, input.value.length);
  const tailLastNewLine = lastNewLine(tail);
  console.log("head:", headLastNewLine);
  console.log("tail:", tailLastNewLine);

  console.log("last head:", head.slice(-1).charCodeAt());
  console.log("first tail:", tail.charCodeAt());
  //console.log("last head:", head.slice(-1));
  //console.log("first tail:", tail[0]);

  console.log("head=", head + ";;;");
  console.log("tail=", tail + ";;;");

  let variant = true;
  let stringToPreview = "";
  if (head.length) {
    //if (tailLastNewLine == 0) {
    //  stringToPreview = input.value;
    //} else {
    if (head.slice(-2) == "\n\n") {
      stringToPreview = head;
      if (tailLastNewLine == 0) {
        console.log("1");
        lastSeven();
      } else {
        if (tail[1] == "\n") {
          console.log("2");
        } else {
          console.log("2.1");
          stringToPreview = head + tail[1];
          position.innerHTML = markdown(stringToPreview);
          variant = false;
        }
      }
    } else {
      if (tailLastNewLine == 0 && tail[0] == "\n") {
        console.log("3");
        stringToPreview = head + "\n";
        lastSeven();
      } else {
        console.log("4");
        stringToPreview = headLastNewLine == 0 ? head : head + "\n";
      }
    }
    stringToPreview = stringToPreview.replace(/\n{2,}$/, "\n\x001\n");
    //}
  }

  if (variant) position.innerHTML = markdown(stringToPreview);
  //if (tailLastNewLine == 0) preview.innerHTML = position.innerHTML;

  const scrollTop = position.scrollHeight;
  position.scrollTop = scrollTop;
  preview.scrollTop = position.scrollTop;
};

input.addEventListener(
  "input",
  debounce(
    function (e) {
      lastInputValue = e.target.value;
      if (lastInputValue) {
        inputLabel.classList.replace("invisible", "visible");
        xButton.style = "display:block";
      } else {
        inputLabel.classList.replace("visible", "invisible");
        xButton.style = "display:none";
      }
      returnInputButton.style = "display:none";

      localStorage.setItem("todomLastInputValue", lastInputValue);
      mdToPreview(e.target.value);
    },
    200,
    false
  ),
  false
);

input.addEventListener("keyup", debounce(update, 150, false));
input.addEventListener("mouseup", debounce(update, 150, false));
//position.addEventListener("scroll", debounce(update, 150, false));

if (input.value) xUI();
initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();
