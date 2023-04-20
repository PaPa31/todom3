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

clearTrashButton.classList.add("invisible");
clearTrashButton.style = null;

let trashArray = localStorage.getItem("trash")
  ? JSON.parse(localStorage.getItem("trash"))
  : [];

deleteAllItemsButton.classList.add("invisible");
deleteAllItemsButton.style = null;

saveAsFileButton.classList.add("inline-block");

openFileButton.classList.add("invisible");
openFileButton.style = null;

openDirButton.classList.add("invisible");
openDirButton.style = null;

restoreItemButton.classList.add("invisible");
restoreItemButton.style = null;

inputLabel.classList.add("invisible");
inputLabel.style = null;

input.style = null;
input.classList.add("border");

returnInputButton.style = "display:none";

const editUI = (label) => {
  input.classList.replace("border", "border-edit");
  input.classList.add("bg");
  xButton.title = "Cancel edit";

  inputLabel.innerHTML = `<span>Edit: </span><span>${label}</span>`;
  inputLabel.classList.replace("invisible", "visible");

  returnInputButton.style = "display:none";
  xButton.style = "display:block";

  preview.scrollIntoView(false);
  input.focus();

  intervalFocus(form, "background-color: orange;", 300);

  mdToPreview(input.value);
};

const editItem = (element) => {
  //window.event.stopPropagation();
  //if (isItemState) {
  editedItemElementDOM = element;
  itemIndexToEdit = indexedItemsArray.indexOf(element.id) * 1;
  input.value = itemsArray[itemIndexToEdit];
  //} else {
  //}

  editUI("#" + (itemIndexToEdit + 1));
};

const deleteOneItem = (item) => {
  window.event.stopPropagation();
  if (twoClickToTrash && item.id === lastClickId) {
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

    trashArray.push(itemsArray[indexToDelete]);
    deletedCounter.innerText = trashArray.length;
    restoreItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
    localStorage.setItem("trash", JSON.stringify(trashArray));

    itemsArray.splice(indexToDelete, 1);
    indexedItemsArray.splice(indexToDelete, 1);

    hideDeleteAllItems();

    localStorage.removeItem("items");
    localStorage.setItem("items", JSON.stringify(itemsArray));
    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.lastChild.classList.remove("filter-red");
    lastClickId = item.id;
    item.lastChild.lastChild.classList.add("filter-red");
    lastItem = item;
    twoClickToTrash = true;
  }
  if (twoClickTrashClear) clearTrashButton.classList.remove("border-red");
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
    element.style = null;
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
    var myFile = new File([input.value], "README.md", {
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
      fileName = "README.md";
      const myFile = new File([input.value], fileName, {
        type: "text/markdown;charset=utf-8",
      });
      saveAs(myFile);
      liMaker(input.value, counterFiles);
      counterFiles++;
    }

    if (fileName) {
    }
  }
};

const saveItem = (offset) => {
  if (itemIndexToEdit != null) {
    itemsArray[itemIndexToEdit] = input.value;
    editedItemElementDOM.firstChild.innerHTML = marked.parse(input.value);
    defaultMarkers();
    scrollToTargetAdjusted(editedItemElementDOM, offset);
  } else {
    itemsArray.push(input.value);
    liMaker(input.value, counterItems);
    counterItems++;
  }
  localStorage.setItem("items", JSON.stringify(itemsArray));
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const previewOffset = preview.scrollTop;
  preview.innerHTML = "";
  if (isItemState) {
    saveItem(previewOffset);
    clearInputAndPreviewAreas();
  } else {
    saveFile(previewOffset);
  }

  localStorage.removeItem("last");
  hideAndNewInputLabel();
  ifReturnAndNoneX();
});

const defaultItemStateVars = () => {
  //if (itemIndexToEdit != null) {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  //}
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedItemsArray = [];
  itemsArray = [];
  counterItems = 0;
  showItemSortingArrows(0);
  ol.innerHTML = "";
  //while (ol.firstChild) {
  //  ol.removeChild(ol.firstChild);
  //}
};

deleteAllItemsButton.addEventListener("click", function (e) {
  if (confirm("Are you sure?")) {
    defaultItemStateVars();
    localStorage.removeItem("items");
  } else {
    e.preventDefault();
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
  deleteAllItemsButton.classList.replace("invisible", "visible");
  let len = trashArray.length;
  if (len !== 0) {
    const deletedItem = trashArray.pop();
    itemsArray.push(deletedItem);
    localStorage.setItem("items", JSON.stringify(itemsArray));
    localStorage.setItem("trash", JSON.stringify(trashArray));

    liMaker(deletedItem, counterItems);
    counterItems++;
    len = len - 1;
    deletedCounter.innerText = len;
  }
  if (len === 0) {
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
    localStorage.removeItem("trash");
  }
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

initializeItemState();
