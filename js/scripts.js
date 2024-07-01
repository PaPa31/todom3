"use strict";
const html = document.documentElement;
const form = document.querySelector("form");

const input = document.getElementById("input");
const preview = document.getElementById("preview");

const xButton = document.getElementById("x-button");
const returnInputButton = document.getElementById("return-last-input");

const deleteAllItemsButton = document.getElementById("delete-all-items");
const restoreItemButton = document.getElementById("restore-deleted-item");
const clearTrashButton = document.getElementById("clear-trash");
const undoLastDeleteButton = document.getElementById("undo-delete");
const saveAsOldButton = document.getElementById("save-as-old");
const saveAsNewButton = document.getElementById("save-as-new");
const saveAsFileButton = document.getElementById("save-as-file");
const openFileButton = document.getElementById("open-file");
const openDirButton = document.getElementById("open-dir");

const trashedCounter = document.getElementById("trashed-counter");
const deletedCounter = document.getElementById("deleted-counter");

const output = document.getElementById("output");
const position = document.getElementById("position");

const inputLabel = document.getElementById("input-label");

clearTrashButton.classList.add("invisible", "none");
clearTrashButton.removeAttribute("style");

deleteAllItemsButton.classList.add("invisible");
deleteAllItemsButton.removeAttribute("style");

saveAsFileButton.classList.add("inline-block");

saveAsOldButton.classList.add("none");
saveAsOldButton.removeAttribute("style");

openDirButton.classList.add("none");
openDirButton.removeAttribute("style");

restoreItemButton.classList.add("invisible", "none");
restoreItemButton.removeAttribute("style");

undoLastDeleteButton.classList.add("invisible", "none");
undoLastDeleteButton.removeAttribute("style");

inputLabel.classList.add("invisible");
inputLabel.removeAttribute("style");

input.removeAttribute("style");
input.classList.add("border");

returnInputButton.style = "display:none";

let variant = true;

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
  xButton.title = "Cancel edit";

  inputLabel.innerHTML = `<span>Edit: </span><span>${label}</span>`;
  inputLabel.classList.replace("invisible", "visible");
  input.setAttribute("placeholder", "Edit");

  scrollToLast();

  intervalFocus(
    form,
    "background-color: var(--todom-textEdit-background);",
    300
  );
};

const xUI = () => {
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
  position.innerHTML = "";
};

const splitSaveItemButton = () => {
  saveAsOldButton.classList.replace("none", "inline-block");
  saveAsNewButton.classList.add("button-edit");
  saveAsNewButton.innerText = "Save as new";
};

const joinSaveItemButton = () => {
  saveAsOldButton.classList.replace("inline-block", "none");
  //saveAsNewButton.removeAttribute("style");
  saveAsNewButton.classList.remove("button-edit");
  saveAsNewButton.innerText = "Save item";
};

const editItem = (e, element, parentLi) => {
  const itemIndexToEdit2 = indexedItems.indexOf(parentLi.id) * 1;

  let current = getCurrentSpec("save", itemIndexToEdit2);
  const textArr = itemsArray[itemIndexToEdit2].text;

  const editing = textArr[current];
  if (e.ctrlKey) {
    intervalFocus(
      element,
      "background-color: var(--todom-main-action-icon-foreground);",
      300
    );
    input.value = input.value
      ? /^ *- /.test(editing)
        ? input.value + "\n" + editing
        : input.value + "\\\n" + editing
      : editing;
    scrollToLast();
  } else {
    itemIndexToEdit = itemIndexToEdit2;
    editedItemLiDOM = parentLi;
    intervalFocus(
      element,
      "background-color: var(--todom-textEdit-background);",
      300
    );
    input.value = editing;
    splitSaveItemButton();
    editUI("#" + (itemIndexToEdit + 1));
  }
  xUI();
  mdToPreview(input.value);
};

const inputLabelNewOrEdit = (indexToDelete) => {
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
};

const putItemToTrash = (indexToTrash) => {
  trashArray.push(itemsArray[indexToTrash]);
  trashedCounter.innerText = trashArray.length;
  restoreItemButton.classList.replace("invisible", "visible");
  clearTrashButton.classList.replace("invisible", "visible");
  localStorage.setItem("todomTrashArray", JSON.stringify(trashArray));
};

const putItemToDeletedArray = (deletedText) => {
  const deletedObj = {
    text: [deletedText],
    save: 0,
  };
  deletedArray.push(deletedObj);
  deletedCounter.innerText = deletedArray.length;
  undoLastDeleteButton.classList.replace("invisible", "visible");
};

const removeItemFromMemory = (item, indexToDelete) => {
  inputLabelNewOrEdit(indexToDelete);

  foldedClass.removeChild(item);
  showItemSortingArrows(foldedClass.childElementCount);

  itemsArray.splice(indexToDelete, 1);
  indexedItems.splice(indexToDelete, 1);
  itemsSpecArray.splice(indexToDelete, 1);

  showOrHideDeleteAllItems();

  if (itemsArray.length == 0) {
    defaultItemStateVars();
    localStorage.removeItem("todomItemsArray");
    localStorage.removeItem("todomItemsSpecArray");
  } else {
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  }
};

const deleteOneItem = (e, liDOM) => {
  e.stopPropagation();
  if ((twoClickToTrash && liDOM.id === lastClickId) || e.ctrlKey) {
    const indexToDelete = indexedItems.indexOf(liDOM.id) * 1;

    if (!e.ctrlKey) {
      putItemToTrash(indexToDelete);
    }

    removeItemFromMemory(liDOM, indexToDelete);

    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem)
      lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
    lastClickId = liDOM.id;
    liDOM.querySelector(".delete-one-item").classList.add("filter-red");
    lastItem = liDOM;
    twoClickToTrash = true;
  }
  if (lastItem && e.ctrlKey)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
  if (twoClickTrashClear || e.ctrlKey) {
    clearTrashButton.classList.remove("filter-red");
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
  //if (event.target === modalContainer) {
  //  modalContainer.style.display = "none";
  //}
  if (twoClickTrashClear) clearTrashButton.classList.remove("filter-red");
  twoClickTrashClear = false;
  if (twoClickToTrash)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
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

  intervalFocus(
    targetElement,
    "background-color: var(--todom-textEdit-background);",
    300
  );
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
    saveItem();

    clearInputAndPreviewAreas();
    defaultMarkers();
    hideAndNewInputLabel();
    ifReturnAndNoneX();
    showOrHideDeleteAllItems();
    localStorage.removeItem("todomLastInputValue");
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

const saveFile = () => {
  let fileName;

  if (input.value) {
    if (fileIndexToEdit != null) {
      const _fi = filesArray[fileIndexToEdit];
      fileName = _fi.name;
      _fi.text = input.value;
      fileDownload(fileName);
    } else {
      fileName =
        getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
      const file = { name: fileName, text: input.value };
      filesArray.push(file);
      indexedFiles.push(idCounterFiles.toString());
      fileDownload(fileName);
    }
  }
};

const mdToTagsWithoutShape = (el, text) => {
  el.innerHTML = markdown(text);
  addButtonsAndWrapperToGalleries(el);
  addClickListenersToImages(el);
  waitForIframe(el);
};

const markdown = (s) => {
  s = s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");
  s = s.replace(/\u200B/, "");
  return marked.parse(s);
};

const saveHistoryTracker = (liDOM, lengthSaveHistory) => {
  const saveEl = liDOM.querySelector(".save-history");
  if (lengthSaveHistory > 1) {
    saveEl.querySelector(".counter-save").innerText = lengthSaveHistory;
    const elForBefore = liDOM.querySelector(".resizable-div");
    changeCurrentInBefore(elForBefore, lengthSaveHistory - 1);
    saveEl.removeAttribute("disable");
    saveEl.querySelector(".previous-save").removeAttribute("disable");
  }
  saveEl.querySelector(".next-save").setAttribute("disable", true);
};

saveAsOldButton.addEventListener("click", function (e) {
  const save = itemsSpecArray[itemIndexToEdit].save;
  const textArr = itemsArray[itemIndexToEdit].text;
  textArr[save] = input.value;
  //textArr.push(input.value);
  //const len = textArr.length;
  //itemsSpecArray[itemIndexToEdit].save = len - 1;
  //saveHistoryTracker(editedItemLiDOM, len);
  const resizableDiv = editedItemLiDOM.querySelector(
    ".md-item > .resizable-div"
  );
  mdToTagsWithoutShape(resizableDiv, input.value);
  scrollToTargetAdjusted(editedItemLiDOM, preview.scrollTop);
  joinSaveItemButton();
  defaultMarkers();
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));

  clearInputAndPreviewAreas();
  localStorage.removeItem("todomLastInputValue");
  hideAndNewInputLabel();
  ifReturnAndNoneX();
});

const saveItem = () => {
  if (itemIndexToEdit != null) {
    //save as new
    const textArr = itemsArray[itemIndexToEdit].text;
    textArr.push(input.value);
    const len = textArr.length;
    itemsSpecArray[itemIndexToEdit].save = len - 1;
    saveHistoryTracker(editedItemLiDOM, len);
    const resizableDiv = editedItemLiDOM.querySelector(
      ".md-item > .resizable-div"
    );
    mdToTagsWithoutShape(resizableDiv, input.value);
    scrollToTargetAdjusted(editedItemLiDOM, preview.scrollTop);
    joinSaveItemButton();
  } else {
    const itemObj = {
      text: [input.value],
    };
    itemsArray.push(itemObj);
    const specObj = {
      save: 0,
    };
    itemsSpecArray.push(specObj);
    indexedItems.push(idCounterItems.toString());
    liDomMaker(idCounterItems);
    idCounterItems++;
  }
  defaultMarkers();
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (isItemState) {
    saveItem();
    clearInputAndPreviewAreas();
    localStorage.removeItem("todomLastInputValue");
    hideAndNewInputLabel();
    ifReturnAndNoneX();
    showOrHideDeleteAllItems();
    showItemSortingArrows(foldedClass.childElementCount);
  } else {
    saveFile();
  }
});

const defaultFileStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedFiles = [];
  filesArray = [];
  idCounterFiles = 0;
  fileElem.value = null;
  showItemSortingArrows(0);
  foldedClass.innerHTML = "";
};

const defaultItemStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedItems = [];
  itemsArray = [];
  itemsSpecArray = [];
  idCounterItems = 0;
  showItemSortingArrows(0);
  foldedClass.innerHTML = "";
};

document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "Control":
      deleteAllItemsButton.innerText = "Merge All Items";
      foldedClass.classList.add("ctrl");
      break;
  }
});

document.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "Control":
      deleteAllItemsButton.innerText = "Delete All Items";
      foldedClass.classList.remove("ctrl");
      break;
  }
});

const mergeAllItems = () => {
  itemsArray.forEach((item, index) => {
    const textArr = item.text;
    const current = getCurrentSpec("save", index);
    const text = textArr[current].replace(/\\$/, "");
    const regex = /(^ *#{1,6} *)|(^ *\d+\.* *)|(^ *\- *)|(^ *\>+ *)|(^ +)/;
    if (text) {
      input.value = input.value
        ? regex.test(text)
          ? input.value + "\n" + text
          : input.value + "\\\n" + text
        : text;
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
        localStorage.removeItem("todomItemsSpecArray");
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
  input.setAttribute("placeholder", "New");
  xButton.title = "Clear input";
};

const hideAndNewInputLabel = () => {
  inputLabel.classList.replace("visible", "invisible");
  inputLabel.innerHTML = "<div>New</div>";
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
  joinSaveItemButton();
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

const restoreHandler = (arr, btns, counterEl, todomArrVar) => {
  let len = arr.length;
  if (len !== 0) {
    const returningObj = arr.pop();
    itemsArray.push({ text: returningObj.text });
    itemsSpecArray.push({ save: returningObj.save });
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
    if (todomArrVar) localStorage.setItem(todomArrVar, JSON.stringify(arr));

    indexedItems.push(idCounterItems.toString());
    liDomMaker(idCounterItems);
    idCounterItems++;

    len = len - 1;
    counterEl.innerText = len;
  }
  if (len === 0) {
    btns.map((i) => i.classList.replace("visible", "invisible"));
    if (todomArrVar) localStorage.removeItem(todomArrVar);
  }
  deleteAllItemsButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("invisible", "visible");
  showItemSortingArrows(foldedClass.childElementCount);
};

restoreItemButton.addEventListener("click", function () {
  restoreHandler(
    trashArray,
    [restoreItemButton, clearTrashButton],
    trashedCounter,
    "todomTrashArray"
  );
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
      trashedCounter.innerText = "";
    }, 300);
    twoClickTrashClear = false;
  } else {
    clearTrashButton.classList.add("filter-red");
    twoClickTrashClear = true;
  }
  if (twoClickToTrash)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
  twoClickToTrash = false;
});

undoLastDeleteButton.addEventListener("click", function (e) {
  restoreHandler(deletedArray, [undoLastDeleteButton], deletedCounter);
});

function handleDblClick(event) {
  event.target.style = "";
}

const inputChange = function (e) {
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
  if (preview.innerHTML === "") position.innerHTML = "";
};

var inputHandler = function (e) {
  debounce(inputChange(e), 200, false);
};

input.addEventListener("input", inputHandler);

if (input.value) {
  xUI();
  mdToPreview(input.value);
  //preview.scrollTop = preview.scrollHeight;
}
initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();
