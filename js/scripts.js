"use strict";
const form = document.querySelector("form");

const input = document.getElementById("input");
const preview = document.getElementById("preview");

const xButton = document.getElementById("x-but1");
const returnInputButton = document.getElementById("rtn-last1");

const deleteAllItemsButton = document.getElementById("delete-all-items");
const restoreTrashedItemButton = document.getElementById(
  "restore-trashed-item"
);
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

restoreTrashedItemButton.classList.add("invisible", "none");
restoreTrashedItemButton.removeAttribute("style");

undoLastDeleteButton.classList.add("invisible", "none");
undoLastDeleteButton.removeAttribute("style");

inputLabel.classList.add("invisible");
inputLabel.removeAttribute("style");

input.removeAttribute("style");
input.classList.add("border");

returnInputButton.style = "display:none";

let variant = true;

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

const editItem = (e, editButtonElem, parentLi) => {
  const itemIndexToEdit2 = indexedItems.indexOf(parentLi.id) * 1;

  let currentSave = getCurrentSpec("save", itemIndexToEdit2);
  const textArr = itemsArray[itemIndexToEdit2].text;

  const editing = textArr[currentSave].variant;
  if (e.ctrlKey) {
    intervalFocus(
      editButtonElem,
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
      editButtonElem,
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
  restoreTrashedItemButton.classList.replace("invisible", "visible");
  clearTrashButton.classList.replace("invisible", "visible");
  localStorage.setItem("todomTrashArray", JSON.stringify(trashArray));
};

const putItemToDeletedArray = (indexToDelete) => {
  deletedArray.push(itemsArray[indexToDelete]);
  deletedCounter.innerText = deletedArray.length;
  undoLastDeleteButton.classList.replace("invisible", "visible");
};

const putSaveAndDateToDeletedArray = (deletedText, deletedDate) => {
  const deletedObj = {
    text: [{ variant: deletedText, date: deletedDate }],
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
    } else {
      putItemToDeletedArray(indexToDelete);
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
    arrows.style = "";
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

function getSavedDate() {
  let savedDate;

  if (itemIndexToEdit != null) {
    const currentSave = itemsSpecArray[itemIndexToEdit].save;
    const textArr = itemsArray[itemIndexToEdit].text;
    const date = textArr[currentSave].date;
    savedDate =
      textArr && date !== "0000-00-00-000000" ? date : getFullCurrentDate();
  } else {
    savedDate = getFullCurrentDate();
  }
  return savedDate;
}

const saveItemFromFile = (fileName) => {
  foldedClass = document.getElementById("list-items");
  isItemState = !isItemState;

  const itemIndex = itemsArray.findIndex((s) => s.name && s.name === fileName);
  if (itemIndex !== -1) {
    const itemId = indexedItems[itemIndex];
    const liDOM = document.getElementById(itemId);
    liDOM.classList.add("new-from-file");

    newSave(liDOM, itemIndex);
  } else {
    const itemObj = {
      text: [{ variant: input.value, date: getFullCurrentDate() }],
      name: fileName,
    };
    const specObj = { save: 0 };

    pushItemArrays(itemObj, specObj);
    indexedItems.push(idCounterItems.toString());
    liDomMaker(idCounterItems, "new-from-file");
    idCounterItems++;
  }
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));

  foldedClass = document.getElementById("list-files");
  isItemState = !isItemState;
};

function drawFile(fileSize) {
  const previewOffset = preview.scrollTop;
  let fileName;
  if (fileIndexToEdit != null) {
    fileName = filesArray[fileIndexToEdit].name;
    const resizableDiv = editedFileLiDOM.querySelector(".resizable-div");
    mdToTagsWithoutShape(resizableDiv, filesArray[fileIndexToEdit].text);
    addOrRemoveScrollObserverToLi(editedFileLiDOM);
    scrollToTargetAdjusted(editedFileLiDOM, previewOffset);
  } else {
    fileName = filesArray[idCounterFiles].name;
    filesArray[idCounterFiles].size = fileSize;
    liDomMaker(idCounterFiles);
    idCounterFiles++;
  }

  if (!isItemState) saveItemFromFile(fileName);

  updateUI6();
}

function ensureFinalNewline(text) {
  return text.endsWith('\n') ? text : text + '\n';
}

const fileDownload = async (drawItemOnly = false) => {
  console.log("📂 Starting file download...");
  const savedDate = getSavedDate();
  console.log("📂 Split date result:", savedDate);

  var blob = new Blob([ensureFinalNewline(input.value)], {
    type: "text/plain;charset=utf-8",
  });

  const fileSize = blob.size;
  console.log("💾 Blob created with size:", fileSize);

  if (window.protocol === "file:") {
    console.log("📂 Saving locally...");
    const meaningPartFileName = processFilename(input.value);
    const datePartFileName = savedDate.substring(8);
    const fileName =  datePartFileName + "-" + meaningPartFileName + ".md";
    await saveFileFile(fileName, blob, fileSize, drawItemOnly);
  } else {
    const dateFolderName = savedDate.substring(0, 7);
    console.log("🌐 Attempting to pass folder to server:", dateFolderName);
    let newFileName = await passFolderHttp(dateFolderName);
    console.log("📂 Received filename from passFolderHttp:", newFileName);

    if (!newFileName) {
      console.log("❌ Save operation canceled or no file name provided.");
      return;
    }

    if (drawItemOnly) saveItem();
    else {
      pushFilesArray(newFileName);
      drawFile(fileSize);
    }
  }
};

function formatDate(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

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

function getFullCurrentDate() {
  var today = new Date();
  var y = today.getFullYear();
  // JavaScript months are 0-based.
  var m = ("0" + (today.getMonth() + 1)).slice(-2);
  var d = ("0" + today.getDate()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var hour = ("0" + today.getHours()).slice(-2);
  var t = hour + minutes + seconds;
  return y + "-" + m + "-" + d + "-" + t;
}

//<-----------------Start--------------------->

// Function to dynamically load a script
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback; // Execute callback once script is loaded
  script.onerror = () => console.error("Failed to load script:", url);
  document.head.appendChild(script);
}

// Flag to track if the transliteration library is already loaded
let transliterationLoaded = false;

// Transliteration character maps (fallback for Cyrillic)
const transliterationMaps = {
  cyrillic: {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  },
};

// Detect script type of a given string
function detectScript(text) {
  if (/[\u0400-\u04FF]/.test(text)) return "cyrillic"; // Cyrillic
  if (/^[\u0000-\u007F\u0100-\u017F\s-]+$/.test(text)) return "latin"; // Latin
  return "unknown"; // Other scripts
}

// Transliterate using character maps
function transliterateWithCharMap(text) {
  const script = detectScript(text);
  const charMap = transliterationMaps[script];
  if (!charMap) return text; // No transliteration for unsupported scripts

  return text
    .split("")
    .map((char) => charMap[char] || char) // Map characters or keep original
    .join("");
}

// Process filenames with transliteration and slugification
function processFilename(originalFilename) {
  originalFilename = originalFilename.slice(0, 24);
  return new Promise((resolve, reject) => {
    // Ensure the library is loaded only once
    if (transliterationLoaded || (window.transliterate && window.slugify)) {
      // Transliterate and slugify the filename
      const latinized = transliterate(originalFilename);
      const slugified = slugify(latinized);
      resolve(slugified);
    } else if (!window.transliterationLoading) {
      // Mark the library as loading
      window.transliterationLoading = true;

      // Dynamically load transliteration library for future use
      loadScript("libs/transliteration-2.3.5/bundle.umd.min.js", () => {
        if (window.transliterate && window.slugify) {
          transliterationLoaded = true; // Mark as loaded
          window.transliterationLoading = false; // Reset loading flag
          const latinized = transliterate(originalFilename);
          const slugified = slugify(latinized);
          resolve(slugified);
        } else {
          // Use fallback transliteration only if library fails
          console.warn("Using fallback transliteration.");
          window.transliterationLoading = false; // Reset loading flag
          resolve(
            transliterateWithCharMap(originalFilename)
              .replace(/\s+/g, "-")
              .toLowerCase()
          );
        }
      });
    } else {
      // Wait for the library to load and then proceed
      const interval = setInterval(() => {
        if (transliterationLoaded || window.transliterationLoading === false) {
          clearInterval(interval);
          resolve(processFilename(originalFilename)); // Retry processing
        }
      }, 50);
    }
  });
}

//<-----------------End----------------------->

//function getFirstCharsWithTrim(s) {
//  s = s.replace(/[^\p{L}\p{N}]+/gu, " ");
//  s = s.replace(/(^\s*)|(\s*$)/gi, "");
//  s = s.replace(/[ ]{2,}/gi, " ");
//  s = s.replace(/\n /, "\n");
//  s = s.toLowerCase();
//  s = s.replace(/\s+/g, "-");
//  s = s.slice(0, 21);
//  return s.replace(/-$/, "");
//}

function pushFilesArray(fileName) {
  let _fileName;

  if (fileIndexToEdit != null) {
    const _fi = filesArray[fileIndexToEdit];
    _fileName = _fi.name || fileName;
    _fi.text = input.value;
  } else {
    _fileName = fileName;
    const file = { name: _fileName, text: input.value };
    filesArray.push(file);
    indexedFiles.push(idCounterFiles.toString());
  }
}

const mdToTagsWithoutShape = (el, text) => {
  const newEl = document.createElement("div");
  newEl.innerHTML = markdown(text);

  // Update only changed parts without wiping out the entire element
  updateDOM(el, newEl);

  addButtonsAndWrapperToGalleries(el);
  addClickListenersToImages(el);
  waitForIframe(el);
  waitForLoader(el);
};

// Function to update only necessary parts of the DOM
const updateDOM = (target, source) => {
  const targetChildren = Array.from(target.childNodes);
  const sourceChildren = Array.from(source.childNodes);

  let i = 0;
  for (; i < sourceChildren.length; i++) {
    if (!targetChildren[i]) {
//       console.log("Appending new element:", sourceChildren[i]);
      target.appendChild(sourceChildren[i]); // Append new elements
    } else if (
      targetChildren[i].tagName === "IMG" &&
      sourceChildren[i].tagName === "IMG"
    ) {
      const targetImg = targetChildren[i];
      const sourceImg = sourceChildren[i];

      // ✅ Keep existing image if `src` is the same
      if (targetImg.src !== sourceImg.src) {
//         console.log("Replacing image:", sourceImg.src);
        target.replaceChild(sourceImg, targetImg);
      } else {
//         console.log("Keeping existing image:", sourceImg.src);

        // Ensure no unnecessary reloads
        targetImg.src = sourceImg.src; // Redundant but forces browser consistency
        targetImg.alt = sourceImg.alt; // Only update if needed

        // Ensure dataset attributes (important for `data-type="avatar"`)
        Object.keys(sourceImg.dataset).forEach((key) => {
          targetImg.dataset[key] = sourceImg.dataset[key];
        });
      }
    } else if (
      targetChildren[i].tagName === sourceChildren[i].tagName &&
      targetChildren[i].id === sourceChildren[i].id
    ) {
      // ✅ Instead of replacing, only update `innerHTML` if it changed
      if (targetChildren[i].innerHTML !== sourceChildren[i].innerHTML) {
//         console.log("Updating content of:", targetChildren[i]);
        targetChildren[i].innerHTML = sourceChildren[i].innerHTML;
      }
    } else {
//       console.log("Replacing element:", targetChildren[i], "with", sourceChildren[i]);
      target.replaceChild(sourceChildren[i], targetChildren[i]);
    }
  }

  // Remove extra elements if new content is shorter
  while (i < targetChildren.length) {
//     console.log("Removing extra element:", targetChildren[i]);
    target.removeChild(targetChildren[i]);
    i++;
  }
};

const markdown = (s) => {
  s = s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");
  s = s.replace(/\u200B/, "");
  return marked.parse(s);
};

const saveHistoryTracker = (liDOM, resizableDiv, lengthSave) => {
  const saveEl = liDOM.querySelector(".save-history");
  if (lengthSave > 1) {
    saveEl.querySelector(".counter-save").innerText = lengthSave;
    changeCurrentInBefore(resizableDiv, lengthSave);
    saveEl.removeAttribute("disable");
    saveEl.querySelector(".previous-save").removeAttribute("disable");
  }
  saveEl.querySelector(".next-save").setAttribute("disable", true);
};

function updateUI5() {
  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  localStorage.removeItem("todomLastInputValue");
}

function newSave(liDOM, itemIndex) {
  const textArr = itemsArray[itemIndex].text;
  textArr.push({ variant: input.value, date: getFullCurrentDate() });
  const lengthSave = textArr.length;
  itemsSpecArray[itemIndex].save = lengthSave - 1;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));

  const resizableDiv = liDOM.querySelector(".resizable-div");
  saveHistoryTracker(liDOM, resizableDiv, lengthSave);
  changeDateInAfter(resizableDiv, textArr[lengthSave - 1].date);
  mdToTagsWithoutShape(resizableDiv, input.value);
}

const saveItem = () => {
  if (itemIndexToEdit != null) {
    //save as new
    newSave(editedItemLiDOM, itemIndexToEdit);
    addOrRemoveScrollObserverToLi(editedItemLiDOM);
    scrollToTargetAdjusted(editedItemLiDOM, preview.scrollTop);
    joinSaveItemButton();
  } else {
    const itemObj = {
      text: [{ variant: input.value, date: getFullCurrentDate() }],
    };
    const specObj = { save: 0 };
    pushItemArrays(itemObj, specObj);
    drawLi(idCounterItems);
    showItemSortingArrows(foldedClass.childElementCount);
  }
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  updateUI6();
};

function updateUI6() {
  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  showOrHideDeleteAllItems();
  localStorage.removeItem("todomLastInputValue");
}

const defaultFileStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedFiles = [];
  filesArray = [];
  idCounterFiles = 0;
  if (window.protocol === "file:") fileElem.value = null;
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

const mergeAllItems = () => {
  itemsArray.forEach((item, index) => {
    const textArr = item.text;
    const currentSave = getCurrentSpec("save", index);
    const text = textArr[currentSave].variant.replace(/\\$/, "");
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

function pushItemArrays(itemObj, specObj) {
  itemsArray.push(itemObj);
  itemsSpecArray.push(specObj);
}

const restoreHandler = (arr, btns, counterEl, todomArr) => {
  let len = arr.length;
  if (len !== 0) {
    const returningObj = arr.pop();
    const specObj = { save: 0 };
    pushItemArrays(returningObj, specObj);
    drawLi(idCounterItems);
    showItemSortingArrows(foldedClass.childElementCount);
    sho(deleteAllItemsButton);

    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));

    len = len - 1;
    counterEl.innerText = len;
  }
  if (len === 0) {
    btns.map((i) => i.classList.replace("visible", "invisible"));
    if (todomArr) localStorage.removeItem(todomArr);
  } else {
    if (todomArr) localStorage.setItem(todomArr, JSON.stringify(arr));
  }
};

function handleDblClick(event) {
  const initiator = event.target,
    targetEl = initiator.classList.contains("dual")
      ? initiator
      : findParentTagOrClassRecursive(initiator, undefined, "dual");
  targetEl.style = "";
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

html.addEventListener("click", function () {
  if (twoClickTrashClear) clearTrashButton.classList.remove("filter-red");
  twoClickTrashClear = false;
  if (twoClickToTrash)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
  twoClickToTrash = false;
});

openDirButton.addEventListener("click", function (e) {
  if (window.protocol === "file:") {
    fileElem.setAttribute("webkitdirectory", "true");
    fileElem.click();
  } else {
    httpProtocolOpenDirectoryClick();
  }
});

openFileButton.addEventListener("click", function (e) {
  if (window.protocol === "file:") {
    fileElem.removeAttribute("webkitdirectory");
    fileElem.click();
  } else {
    httpProtocolOpenDirectoryClick();
  }
});

saveAsFileButton.addEventListener("click", async function () {
  if (input.value) {
    const drawItemOnly = true;
    fileDownload(drawItemOnly);
  }
});

saveAsOldButton.addEventListener("click", function (e) {
  const currentSave = itemsSpecArray[itemIndexToEdit].save;
  const textArr = itemsArray[itemIndexToEdit].text;
  textArr[currentSave].variant = input.value;
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  const resizableDiv = editedItemLiDOM.querySelector(".resizable-div");
  mdToTagsWithoutShape(resizableDiv, input.value);
  addOrRemoveScrollObserverToLi(editedItemLiDOM);

  updateUI5();

  scrollToTargetAdjusted(editedItemLiDOM, preview.scrollTop);
  joinSaveItemButton();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    if (isItemState) {
      saveItem();
    } else {
      fileDownload();
    }
  }
});

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

restoreTrashedItemButton.addEventListener("click", function () {
  restoreHandler(
    trashArray,
    [restoreTrashedItemButton, clearTrashButton],
    trashedCounter,
    "todomTrashArray"
  );
});

clearTrashButton.addEventListener("click", function (e) {
  e.stopPropagation();
  if (twoClickTrashClear) {
    trashArray = [];
    localStorage.removeItem("todomTrashArray");
    restoreTrashedItemButton.classList.replace("visible", "invisible");
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

input.addEventListener("input", inputHandler);

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

if (lastInputValue) {
  xButton.style = "display:block";
  inputLabel.classList.replace("invisible", "visible");
  input.value = lastInputValue;
  input.scrollTop = input.scrollHeight;
} else {
  xButton.style = "display:none";
}

if (input.value) {
  xUI();
  mdToPreview(input.value);
  //preview.scrollTop = preview.scrollHeight;
}

//  Инициализация `marked` с уникальными id
const renderer = new marked.Renderer();
const slugger = new marked.Slugger();
const headingIdMap = new Map(); // Store stable IDs

renderer.heading = (text, level) => {
  // Добавляем префикс `note-` чтобы не конфликтовать с 'mocha'
  // Добавляем постфикс для уникальности
  let slug;

  // If the heading already exists, reuse the same ID
  if (headingIdMap.has(text)) {
    slug = headingIdMap.get(text);
  } else {
    slug = `note-${slugger.slug(text)}`;
    headingIdMap.set(text, slug);
  }

  return `<h${level} id="${slug}">${text}</h${level}>`;
};

marked.use({ renderer });

initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();
