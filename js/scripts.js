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
};

const editItem = (e, element) => {
  editedItemElementDOM = element;
  itemIndexToEdit = indexedItemsArray.indexOf(element.id) * 1;
  const editing = itemsArray[itemIndexToEdit];
  if (e.ctrlKey) {
    input.value = input.value ? input.value + "\n" + editing : editing;
  } else {
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
      localStorage.setItem("trash", JSON.stringify(trashArray));
    }

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    showOrHideDeleteAllItems();

    if (itemsArray.length == 0) {
      localStorage.removeItem("items");
    } else {
      localStorage.setItem("items", JSON.stringify(itemsArray));
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
  if (twoClickTrashClear || e.ctrlKey)
    clearTrashButton.classList.remove("border-red");
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
  if (twoClickTrashClear) clearTrashButton.classList.remove("border-red");
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
  console.log(t);
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
      fileName = filesArray[fileIndexToEdit].name;
      inputGlobal = input.value;
      offsetGlobal = offset;
      //const myFile = new File([input.value], fileName, {
      //  type: "text/markdown;charset=utf-8",
      //});
      //saveAs(myFile);
      //initialize();
      fileDownload(fileName);
    } else {
      fileName =
        getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
      //const myFile = new File([input.value], fileName, {
      //  type: "text/markdown;charset=utf-8",
      //});
      //saveAs(myFile);
      const obj = { name: fileName, text: input.value };
      filesArray.push(obj);
      indexedFilesArray.push(counterFiles.toString());
      inputGlobal = input.value;
      offsetGlobal = offset;
      fileDownload(fileName);

      //clearInputAndPreviewAreas();
    }

    if (fileName) {
    }
  }
};

const markdown = (s) => {
  s = s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");
  s = s.replace(/\u200B/, "");
  return marked.parse(s);
};

const saveItem = (offset) => {
  if (itemIndexToEdit != null) {
    itemsArray[itemIndexToEdit] = input.value;
    editedItemElementDOM.firstChild.innerHTML = markdown(input.value);
    scrollToTargetAdjusted(editedItemElementDOM, offset);
  } else {
    itemsArray.push(input.value);
    liMaker(input.value, counterItems);
    indexedItemsArray.push(counterItems.toString());
    counterItems++;
  }
  defaultMarkers();
  localStorage.setItem("items", JSON.stringify(itemsArray));
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const previewOffset = preview.scrollTop;
  if (isItemState) {
    saveItem(previewOffset);
    clearInputAndPreviewAreas();
    localStorage.removeItem("last");
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
      break;
  }
});

document.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "Control":
      if (isItemState && itemsArray.length != 0)
        deleteAllItemsButton.innerText = "Delete All Items";
      break;
  }
});

const mergeAllItems = () => {
  itemsArray.forEach((item) => {
    if (item) {
      input.value = input.value ? input.value + "\n" + item : item;
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
        localStorage.removeItem("items");
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
};

xButton.addEventListener("click", function (e) {
  if (itemIndexToEdit != null || fileIndexToEdit != null) {
    defaultMarkers();
  } else {
    localStorage.removeItem("last");
  }

  hideAndNewInputLabel();
  ifReturnAndNoneX();
  clearInputAndPreviewAreas();
  input.focus();
});

returnInputButton.addEventListener("click", function () {
  input.value = lastInputValue;
  mdToPreview(input.value);
  localStorage.setItem("last", lastInputValue);
  inputLabel.classList.replace("invisible", "visible");
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
  input.focus();
});

restoreItemButton.addEventListener("click", function () {
  let len = trashArray.length;
  if (len !== 0) {
    const deletedItem = trashArray.pop();
    itemsArray.push(deletedItem);
    localStorage.setItem("items", JSON.stringify(itemsArray));
    localStorage.setItem("trash", JSON.stringify(trashArray));

    liMaker(deletedItem, counterItems);
    indexedItemsArray.push(counterItems.toString());
    counterItems++;
    len = len - 1;
    deletedCounter.innerText = len;
  }
  if (len === 0) {
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
    localStorage.removeItem("trash");
  }
  deleteAllItemsButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("invisible", "visible");
});

clearTrashButton.addEventListener("click", function (e) {
  e.stopPropagation();
  if (twoClickTrashClear) {
    trashArray = [];
    deletedCounter.innerText = "";
    localStorage.removeItem("trash");
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.remove("border-red");
    twoClickTrashClear = false;
  } else {
    clearTrashButton.classList.add("border-red");
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
  let sym = str[caret];
  while (sym != "\n" && caret > 0) {
    caret--;
    sym = str[caret];
  }
  return caret;
};

const update = function () {
  const head = input.value.substr(0, input.selectionStart);

  output.value = head;
  output.scrollTop = output.scrollHeight;

  const headLastNewLine = lastNewLine(head);
  const endHead = headLastNewLine != -1 ? headLastNewLine : head.length;
  const tail = input.value.substr(endHead, input.value.length);
  const tailLastNewLine = lastNewLine(tail);

  let stringToPreview = "";
  if (head.length)
    if (tailLastNewLine == 0) {
      stringToPreview = input.value;
    } else {
      if (head.slice(-2) == "\n\n") {
        stringToPreview = head;
      } else {
        stringToPreview = head.substr(0, endHead + 1);
      }
      stringToPreview = stringToPreview.replace(/\n\n$/, "\n\x001\n");
    }

  position.innerHTML = markdown(stringToPreview);

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

      localStorage.setItem("last", lastInputValue);
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

initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();
