const foldAllToggleButton = document.getElementById("fold-global-toggle");
const itemsFilesToggleButton = document.getElementById("items-files-toggle");

let foldedClass = document.getElementById("list-items");

const listFiles = document.getElementById("list-files");

// starting in Item state & Unfolded view
let isItemState = true;
let isFoldItems = localStorage.getItem("todomFoldItems")
  ? JSON.parse(localStorage.getItem("todomFoldItems"))
  : false;
let isFoldFiles = localStorage.getItem("todomFoldFiles")
  ? JSON.parse(localStorage.getItem("todomFoldFiles"))
  : false;

let itemsArray = localStorage.getItem("todomItemsArray")
  ? JSON.parse(localStorage.getItem("todomItemsArray"))
  : [];
let itemsSpecArray = localStorage.getItem("todomItemsSpecArray")
  ? JSON.parse(localStorage.getItem("todomItemsSpecArray"))
  : [];
let trashArray = localStorage.getItem("todomTrashArray")
  ? JSON.parse(localStorage.getItem("todomTrashArray"))
  : [];
let deletedArray = [];

let filesArray = [];

let idCounterItems = 0;
let idCounterFiles = 0;

// lightweight array to avoid redundant logic and waste of resources
let indexedItems = [];
let indexedFiles = [];

let twoClickToTrash = false;
let twoClickTrashClear = false;

let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("todomLastInputValue")
  ? localStorage.getItem("todomLastInputValue")
  : "";

let itemIndexToEdit;
let editedItemLiDOM;

let fileIndexToEdit;
let editedFileLiDOM;

const fileSizeTerm = (numberOfBytes) => {
  // Approximate to the closest prefixed unit
  const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  const exponent = Math.min(
    Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
    units.length - 1
  );
  const approx = numberOfBytes / 1024 ** exponent;
  const output =
    exponent === 0
      ? `${numberOfBytes} bytes`
      : `${approx.toFixed(3)} ${units[exponent]} (${numberOfBytes} bytes)`;
  return output;
};

let papaRecur;
const findParentTagOrClassRecursive = (el, tag = "li", classOfEl) => {
  const papa = el.parentElement;
  const isClass = classOfEl
    ? papa.classList.contains(classOfEl)
    : papa.tagName.toLowerCase() === tag;
  if (papa && isClass) {
    papaRecur = papa;
    return papaRecur;
  } else {
    findParentTagOrClassRecursive(papa, tag, classOfEl);
    return papaRecur;
  }
};

const setDefaultSpec = (spec, current, itemIndex) => {
  itemsSpecArray[itemIndex] = Object.assign({}, itemsSpecArray[itemIndex], {
    [spec]: current,
  });
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
};

const getCurrentSpec = (spec, itemIndex) => {
  const _cur = itemsSpecArray[itemIndex] && itemsSpecArray[itemIndex][spec];
  let current;

  switch (spec) {
    case "fold": {
      if (_cur != undefined) {
        current = _cur;
      } else {
        current = false;
        setDefaultSpec(spec, current, itemIndex);
      }
      break;
    }
    case "save": {
      const textArr = itemsArray[itemIndex].text;
      if (_cur != undefined && textArr[_cur] != undefined) {
        current = _cur;
      } else {
        current = textArr.length - 1;
        setDefaultSpec(spec, current, itemIndex);
      }
      break;
    }
    default: {
    }
  }
  return current;
};

const initialInBefore = (ancestorEl) => {
  ancestorEl.style.setProperty("--todom-before-display", "none");
};

const changeCurrentInBefore = (ancestorEl, currentSave) => {
  ancestorEl.style.removeProperty("--todom-before-display");
  if (/^\d+$/.test(currentSave)) {
    // Regex to check if currentSave is a positive integer
    ancestorEl.style.setProperty(
      "--todom-before-current-save",
      "'" + currentSave + "'"
    );
  } else {
    console.error("Invalid currentSave format. Must be a number.");
  }
};

const changeDateInAfter = (ancestorEl, currentDate) => {
  if (/^\d{4}-\d{2}-\d{2}-\d{6}$/.test(currentDate)) {
    // Regex to match YYYY-MM-DD-HHmmss format
    ancestorEl.style.setProperty(
      "--todom-after-current-date",
      "'" + currentDate + "'"
    );
  } else {
    console.error("Invalid date format. Must be in YYYY-MM-DD-HHmmss format.");
  }
};

function liDomMaker(arrIndex, newFromFile = null) {
  const li = document.createElement("li");
  const topDiv = document.createElement("div");
  topDiv.setAttribute("class", "top-in-li");
  const dual = document.createElement("div");
  dual.setAttribute("class", "dual");
  const div = document.createElement("div");
  let last, currentSave, currentFold;

  dual.addEventListener("dblclick", handleDblClick);
  foldButtonMaker(topDiv);
  mainActDivMaker(topDiv);

  if (isItemState) {
    const correctedItemsIndex = indexedItems.indexOf(arrIndex.toString()) * 1;
    const textArr = itemsArray[correctedItemsIndex].text;
    last = textArr.length - 1;
    currentSave = getCurrentSpec("save", correctedItemsIndex);
    currentFold = getCurrentSpec("fold", correctedItemsIndex);

    div.setAttribute("class", "md-item");
    if (currentFold) li.setAttribute("class", "folded");

    const resizableDiv = document.createElement("div");
    resizableDiv.setAttribute("class", "resizable-div");
    mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
    if (newFromFile && newFromFile === "new-from-file")
      li.setAttribute("class", "new-from-file");
    if (last > 0) {
      changeCurrentInBefore(resizableDiv, textArr.length);
    } else {
      initialInBefore(resizableDiv);
    }
    changeDateInAfter(resizableDiv, textArr[currentSave].date);

    saveHistoryDivMaker(topDiv, last, currentSave);

    div.appendChild(resizableDiv);
    li.id = idCounterItems;
  } else {
    const correctedFilesIndex = indexedFiles.indexOf(arrIndex.toString()) * 1;
    fileInfoDivMaker(topDiv, correctedFilesIndex);
    div.setAttribute("class", "md-file");
    li.setAttribute("class", "folded"); // initially all files are folded

    const attr = { class: "resizable-div" };
    const fileTextDiv = createEl("div", attr, topDiv);
    mdToTagsWithoutShape(fileTextDiv, filesArray[correctedFilesIndex].text);

    div.appendChild(fileTextDiv);
    li.id = idCounterFiles;
  }

  dual.appendChild(div);
  li.appendChild(topDiv);
  li.appendChild(dual);
  foldedClass.appendChild(li);

  if (isItemState && !currentFold) {
    addOrRemoveScrollObserverToLi(li);
  }
}

const addOrRemoveScrollObserverToLi = (liDOM) => {
  const liHeight = liDOM.clientHeight;
  const belowHeightLimit = liHeight < liHeightLimit;
  if (belowHeightLimit) {
    unobserveLiElements(liDOM);
  } else {
    observeLiElements(liDOM);
  }
};

const fileInfoDivMaker = (parentDiv, arrIndex) => {
  const file = filesArray[arrIndex];
  const fileInfoDiv = createEl("div", { class: "file-info" }, parentDiv);
  const fileNameDiv = createEl("div", { class: "file-name" }, fileInfoDiv);
  fileNameDiv.innerHTML = file.dir ? file.dir : file.name;
  const fileSizeDiv = createEl("div", { class: "file-size" }, fileInfoDiv);
  fileSizeDiv.innerHTML = file.size ? fileSizeTerm(file.size) : "";
};

const foldButtonMaker = (parentEl) => {
  const attr = {
    class: "btn-toggler fold-button btn",
    title: "fold/unfold one",
    onclick: `foldOneItem(event, findParentTagOrClassRecursive(this))`,
  };
  const buttonTag = createEl("button", attr, parentEl);
  createEl("span", null, buttonTag);
};

const saveHistoryDivMaker = (paDiv, last, currentSave) => {
  const saveHistoryDiv = createEl("div", { class: "save-history" }, paDiv);
  previousSaveButtonMaker(saveHistoryDiv, currentSave);
  counterSaveSpanMaker(saveHistoryDiv, currentSave);
  nextSaveButtonMaker(saveHistoryDiv, currentSave === last);
  deleteCurrentSaveButtonMaker(saveHistoryDiv);
};

const counterSaveSpanMaker = (paDiv, currentSave) => {
  const counterSaveSpan = createEl("span", { class: "counter-save" }, paDiv);
  counterSaveSpan.innerText = currentSave + 1;
};

const previousSaveButtonMaker = (paDiv, currentSave) => {
  const attr = {
    class: "previous-save btn",
    title: "Show previous save",
    disable: currentSave === 0 ? true : false,
    onclick: `previousSave(this)`,
  };
  createEl("button", attr, paDiv);
};

const deleteCurrentSaveButtonMaker = (paDiv) => {
  const attr = {
    class: "delete-current-save btn",
    title: "Delete current save",
    onclick: `deleteCurrentSave(this)`,
  };
  createEl("button", attr, paDiv);
};

const nextSaveButtonMaker = (paDiv, check) => {
  const attr = {
    class: "next-save btn",
    title: "Show previous save",
    disable: check ? true : false,
    onclick: `nextSave(this)`,
  };
  createEl("button", attr, paDiv);
};

const mainActDivMaker = (paDiv) => {
  const mainActDiv = createEl("div", { class: "main-act" }, paDiv);
  editButtonMaker(mainActDiv);
  trashButtonMaker(mainActDiv);
};

const editButtonMaker = (paMainActDiv) => {
  const attr = {
    class: "edit-item btn",
    ctrl: true,
    title: "Click -> edit, Ctrl+click - merge with input area",
    onclick: isItemState
      ? `selectEditor(event, this)`
      : `editFile(event, this)`,
  };
  createEl("button", attr, paMainActDiv);
};

const trashButtonMaker = (paMainActDiv) => {
  const attr = {
    class: "delete-one-item btn",
    ctrl: true,
    title: isItemState
      ? "Double-click -> Trash, Ctrl+click -> delete"
      : "Double-click -> delete from this list",
    onclick: isItemState
      ? `deleteOneItem(event, findParentTagOrClassRecursive(this))`
      : `deleteOneFile(event, findParentTagOrClassRecursive(this))`,
  };
  createEl("button", attr, paMainActDiv);
};

const setCurrentSave = (currentSave, itemIndex) => {
  itemsSpecArray[itemIndex].save = currentSave;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
};

const deleteCurrentSave = (el) => {
  const liDOM = findParentTagOrClassRecursive(el);
  const itemIndex = indexedItems.indexOf(liDOM.id) * 1;

  let currentSave = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;

  putSaveAndDateToDeletedArray(
    textArr[currentSave].variant,
    textArr[currentSave].date
  );

  const lastBefore = textArr.length - 1;
  if (lastBefore === 0) {
    removeItemFromMemory(liDOM, itemIndex);
    return;
  }
  textArr.splice(currentSave, 1);

  const lastAfter = textArr.length - 1;
  if (currentSave < lastAfter) {
    // we do not change 'currentSave' due to splice,
    // 'currentSave' points to the next position
    //currentSave++;
  } else {
    el.previousSibling.setAttribute("disable", true);
    if (currentSave === lastBefore) {
      currentSave--;
      el.previousSibling.previousSibling.innerText = currentSave + 1;
    }
    if (lastAfter === 0) {
      el.previousSibling.previousSibling.previousSibling.setAttribute(
        "disable",
        true
      );
    }
  }
  if (editor[itemIndex]) {
    changeEditor(liDOM, itemIndex, textArr[currentSave].variant);
  }
  const resizableDiv = liDOM.querySelector(".resizable-div");
  mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
  addOrRemoveScrollObserverToLi(liDOM);

  if (lastAfter > 0) {
    changeCurrentInBefore(resizableDiv, textArr.length);
  } else {
    initialInBefore(resizableDiv);
  }
  setCurrentSave(currentSave, itemIndex);
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  changeDateInAfter(resizableDiv, textArr[currentSave].date);
};

const previousSave = (el) => {
  const liDOM = findParentTagOrClassRecursive(el);
  const itemIndex = indexedItems.indexOf(liDOM.id) * 1;

  let currentSave = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;

  currentSave--;
  el.nextSibling.nextSibling.removeAttribute("disable");
  el.nextSibling.innerText = currentSave + 1;
  if (currentSave < 1) {
    el.setAttribute("disable", true);
  }
  if (editor[itemIndex]) {
    changeEditor(liDOM, itemIndex, textArr[currentSave].variant);
  }
  const resizableDiv = liDOM.querySelector(".resizable-div");
  mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
  addOrRemoveScrollObserverToLi(liDOM);

  changeCurrentInBefore(resizableDiv, textArr.length);
  setCurrentSave(currentSave, itemIndex);
  changeDateInAfter(resizableDiv, textArr[currentSave].date);
};

const nextSave = (el) => {
  const liDOM = findParentTagOrClassRecursive(el);
  const itemIndex = indexedItems.indexOf(liDOM.id) * 1;

  let currentSave = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;

  currentSave++;
  el.previousSibling.innerText = currentSave + 1;
  el.previousSibling.previousSibling.removeAttribute("disable");
  if (currentSave >= textArr.length - 1) {
    el.setAttribute("disable", true);
  }
  if (editor[itemIndex]) {
    changeEditor(liDOM, itemIndex, textArr[currentSave].variant);
  }
  const resizableDiv = liDOM.querySelector(".resizable-div");
  mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
  addOrRemoveScrollObserverToLi(liDOM);

  changeCurrentInBefore(resizableDiv, textArr.length);
  setCurrentSave(currentSave, itemIndex);
  changeDateInAfter(resizableDiv, textArr[currentSave].date);
};

const changeEditor = (parentLi, editIndex, text) => {
  removeEditor(parentLi, editIndex);
  createEditor(parentLi, editIndex, text);
};

const editFile = (e, element) => {
  const editedFileLiDOM2 = findParentTagOrClassRecursive(element);
  const fileIndexToEdit2 = indexedFiles.indexOf(editedFileLiDOM2.id) * 1;
  const fi = filesArray[fileIndexToEdit2];

  if (e.ctrlKey) {
    intervalFocus(
      element,
      "background-color: var(--todom-main-action-icon-foreground);",
      300
    );
    input.value = input.value ? input.value + "\n" + fi.text : fi.text;
    scrollToLast();
  } else {
    fileIndexToEdit = fileIndexToEdit2;
    editedFileLiDOM = editedFileLiDOM2;
    intervalFocus(
      element,
      "background-color: var(--todom-textEdit-background);",
      300
    );
    input.value = fi.text;
    const fileName = fi.dir ? fi.dir : fi.name;
    editUI(fileName);
  }

  xUI();
  mdToPreview(input.value);
};

const deleteOneFile = (e, liDOM) => {
  e.stopPropagation();
  if (twoClickToTrash && liDOM.id === lastClickId) {
    const indexToDelete = indexedFiles.indexOf(liDOM.id) * 1;

    if (fileIndexToEdit != null && fileIndexToEdit >= indexToDelete) {
      if (filesArray[fileIndexToEdit].name == filesArray[indexToDelete].name) {
        defaultMarkers();
        inputLabel.innerHTML = "<div>New</div>";
      } else {
        fileIndexToEdit--;
      }
    }

    foldedClass.removeChild(liDOM);
    showItemSortingArrows(foldedClass.childElementCount);

    filesArray.splice(indexToDelete, 1);
    indexedFiles.splice(indexToDelete, 1);

    showOrHideDeleteAllItems();
    if (window.protocol === "file:" && filesArray.length === 0)
      fileElem.value = null;

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
};

const foldGreen = (liDOM) => {
  if (liDOM.classList.contains("folded")) {
    intervalFocus(liDOM, "background-color: red;", 300);
  } else {
    intervalFocus(liDOM, "background-color: green;", 300);
  }
};

const observerToggle = (liDOM) => {
  if (liDOM.classList.contains("folded")) {
    unobserveLiElements(liDOM);
  } else {
    addOrRemoveScrollObserverToLi(liDOM);
  }
};

const foldOneItem = (e, liDOM) => {
  const currentIndex = indexedItems.indexOf(liDOM.id) * 1;
  const initialScrollTop = window.scrollY;
  liDOM.classList.toggle("folded");

  if (sticky && currentIndex === stickyNumber) {
    // RULE: when pressing Ctrl it folds higher and unfolds lower
    if (e.ctrlKey) {
      liDOM.scrollIntoView(false);
    } else {
      liDOM.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  } else {
    if (e.ctrlKey) {
      liDOM.scrollIntoView(false);
      // force show sticky
      handleLiScroll({ target: liDOM });
    } else {
      window.scrollTo(0, initialScrollTop);
    }
  }

  if (isItemState) {
    const itemIndexToFold = indexedItems.indexOf(liDOM.id) * 1;
    itemsSpecArray[itemIndexToFold].fold =
      !itemsSpecArray[itemIndexToFold].fold;
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));

    if (editor[itemIndexToFold]) removeEditor(liDOM, itemIndexToFold);
  } else {
    const fileIndexToFold = indexedFiles.indexOf(liDOM.id) * 1;
    filesArray[fileIndexToFold].fold = !filesArray[fileIndexToFold].fold;
  }
  clearInlineStyle(liDOM);
  observerToggle(liDOM);
  foldGreen(liDOM);
};

function clearInlineStyle(liDOM) {
  const dual = liDOM.querySelector(".dual");
  dual.style = "";
}

const initialCheckFold = (stateVar) => {
  if (stateVar) {
    // Folded view
    foldAllToggleButton.classList.add("fold");
  } else {
    // Unfolded view
    foldAllToggleButton.classList.remove("fold");
  }
};

const allLiFold = (view, todomStr, indexedArr, mainArr) => {
  [...foldedClass.children].forEach((i) => {
    if (view) {
      i.classList.remove("folded");
      addOrRemoveScrollObserverToLi(i);
    } else {
      i.classList.add("folded");
      unobserveLiElements(i);
    }

    if (indexedArr.length != 0) {
      const indexToFold = indexedArr.indexOf(i.id) * 1;
      mainArr[indexToFold].fold = !view;
    }
  });
  localStorage.setItem(todomStr, JSON.stringify(!view));
};

const showOrHideTrash = () => {
  if (trashArray.length) {
    trashedCounter.innerText = trashArray.length;
    restoreTrashedItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
  } else {
    restoreTrashedItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
  }
};

const sho = (el) => {
  el.classList.replace("none", "inline-block");
  el.classList.replace("invisible", "visible");
};

const hid = (el) => {
  if (isItemState) el.classList.replace("inline-block", "none");
  el.classList.replace("visible", "invisible");
};

const showOrHideDeleteAllItems = () => {
  if (
    (isItemState && itemsArray && itemsArray.length) ||
    (!isItemState && filesArray && filesArray.length)
  ) {
    sho(deleteAllItemsButton);
  } else {
    hid(deleteAllItemsButton);
  }
};

const showOrHideUndoDeleteButton = () => {
  if (deletedArray.length) {
    deletedCounter.innerText = deletedArray.length;
    undoLastDeleteButton.classList.replace("invisible", "visible");
  } else {
    undoLastDeleteButton.classList.replace("visible", "invisible");
  }
};

const initializeFileState = () => {
  saveAsNewButton.innerText = "Save file";
  itemsFilesToggleButton.innerText = "Files";
  openFileButton.innerText = "Open file";
  deleteAllItemsButton.innerText = "Clear the List";
  saveAsFileButton.classList.replace("inline-block", "none");
  openDirButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("inline-block", "none");
  restoreTrashedItemButton.classList.replace("inline-block", "none");
  clearTrashButton.classList.replace("inline-block", "none");
  undoLastDeleteButton.classList.replace("inline-block", "none");

  listItems.style.setProperty("display", "none");
  listFiles.style.setProperty("display", "flex");

  foldedClass = document.getElementById("list-files");

  if (indexedFiles.length === 0) {
    idCounterFiles = 0;
    indexedFiles = [];

    if (window.protocol === "file:") {
      fileElem.click();
    } else {
      //getFileHttp(phrase);
      //getFileHttp(dir);
      //openDirectory("");
      httpProtocolOpenDirectoryClick();
    }
  } else {
  }
  showItemSortingArrows(foldedClass.childElementCount);
};

const datePlaceholder = (oneOfArr) => {
  // for backward compatibility
  // maybe it should be removed this func,
  // when all your items will have dates
  oneOfArr.text = oneOfArr.text.map((variant) => {
    if (typeof variant === "string") {
      // For old notes where the text is a string, wrap it with an object and set date to null
      return { variant: variant, date: "0000-00-00-000000" };
    }
    return variant; // Keep existing objects with variant and date
  });
};

const drawLi = (i) => {
  indexedItems.push(idCounterItems.toString());
  liDomMaker(i);
  idCounterItems++;
};

const arrCheckForNull = (arr, arr2) => {
  let len = arr.length,
    i;
  const len1 = len;
  for (i = 0; i < len; i++) {
    if (i in arr && arr[i] != undefined) {
      datePlaceholder(arr[i]);
      drawLi(i);
    } else {
      arr.splice(i, 1);
      arr2.splice(i, 1); // sync
      i--;
      len--;
    }
  }

  // cut off extra if any
  if (itemsSpecArray.length > len) {
    itemsSpecArray.length = len;
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  }

  if (len1 > len) {
    console.log("null(s) was/were found and ignored!");
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  }
};

const newElementsFromOtherState = (stateDiv) => {
  const newLiAll = stateDiv.querySelectorAll(".new-from-file");
  newLiAll.forEach((newLi) => {
    addOrRemoveScrollObserverToLi(newLi);
    newLi.classList.remove("new-from-file");
  });
};

const initializeItemState = () => {
  saveAsNewButton.innerText = "Save item";
  itemsFilesToggleButton.innerText = "Items";
  openFileButton.innerText = "Split file";
  deleteAllItemsButton.innerText = "Delete All Items";
  saveAsFileButton.classList.replace("none", "inline-block");
  openDirButton.classList.replace("inline-block", "none");
  restoreTrashedItemButton.classList.replace("none", "inline-block");
  clearTrashButton.classList.replace("none", "inline-block");
  undoLastDeleteButton.classList.replace("none", "inline-block");

  listFiles.style.setProperty("display", "none");
  listItems.style.setProperty("display", "flex");
  foldedClass = document.getElementById("list-items");
  initialCheckFold(isFoldItems);

  if (indexedItems.length === 0) {
    idCounterItems = 0;
    indexedItems = [];

    if (itemsArray.length !== 0) {
      arrCheckForNull(itemsArray, itemsSpecArray);
    } else {
      // sync by reset
      itemsSpecArray.length = 0;
      localStorage.removeItem("todomItemsArray");
      localStorage.removeItem("todomItemsSpecArray");
    }
  }
  showItemSortingArrows(foldedClass.childElementCount);
  newElementsFromOtherState(foldedClass);
};

foldAllToggleButton.addEventListener("click", function (e) {
  if (isItemState) {
    allLiFold(isFoldItems, "todomFoldItems", indexedItems, itemsSpecArray);
    isFoldItems = !isFoldItems;
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  } else {
    allLiFold(isFoldFiles, "todomFoldFiles", indexedFiles, filesArray);
    isFoldFiles = !isFoldFiles;
  }
  foldAllToggleButton.classList.toggle("fold");
  e.stopPropagation();
});

itemsFilesToggleButton.addEventListener("click", function (e) {
  isItemState = !isItemState;
  showItemSortingArrows(0);
  twoClickToTrash = false;
  if (isItemState) {
    initializeItemState();
    showOrHideTrash();
    showOrHideUndoDeleteButton();
  } else {
    if (window.protocol === "file:")
      fileElem.setAttribute("webkitdirectory", "true");
    initializeFileState();
  }
  showOrHideDeleteAllItems();
  e.stopPropagation();
});
