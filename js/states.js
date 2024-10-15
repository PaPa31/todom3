const foldAllToggleButton = document.getElementById("fold-global-toggle");
const itemsFilesToggleButton = document.getElementById("items-files-toggle");

let foldedClass = document.getElementById("list-items");

//var phrase = "static/demo.md";
//var phrase = "md/chron/2024-02/12-120508-best-pc-games.md";

const rootDirectory = "../public/md/chron/";
let initialFileName = null;
let selectedFiles = []; // Array to track multiple selected files

// Directory stack to keep track of the visited directories
const directoryStack = [];

let saveDirectory = rootDirectory;

const listFiles = document.getElementById("list-files");

let fileElem = document.getElementById("file-elem");
// emptying the FileList
fileElem.value = null;

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

let fileSizeGlobal;

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
      "'" + ++currentSave + "'"
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

function liDomMaker(arrIndex, str) {
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
    if (str && str === "new-from-file")
      li.setAttribute("class", "new-from-file");
    if (last > 0) {
      changeCurrentInBefore(resizableDiv, currentSave);
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

    const attr = { class: "file-text resizable-div" };
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
  //localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
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
  const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
  mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
  addOrRemoveScrollObserverToLi(liDOM);

  if (lastAfter > 0) {
    changeCurrentInBefore(resizableDiv, currentSave);
  } else {
    initialInBefore(resizableDiv);
  }
  setCurrentSave(currentSave, itemIndex);
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
  const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
  mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
  addOrRemoveScrollObserverToLi(liDOM);

  changeCurrentInBefore(resizableDiv, currentSave);
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
  const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
  mdToTagsWithoutShape(resizableDiv, textArr[currentSave].variant);
  addOrRemoveScrollObserverToLi(liDOM);

  changeCurrentInBefore(resizableDiv, currentSave);
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
    if (filesArray.length === 0) fileElem.value = null;

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
    const liHeight = liDOM.clientHeight;
    const belowHeightLimit = liHeight < liHeightLimit;
    if (belowHeightLimit) {
      unobserveLiElements(liDOM);
    } else {
      observeLiElements(liDOM);
    }
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
  observerToggle(liDOM);
  foldGreen(liDOM);
};

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
      const liHeight = i.clientHeight;
      const belowHeightLimit = liHeight < liHeightLimit;
      if (belowHeightLimit) {
        unobserveLiElements(i);
      } else {
        observeLiElements(i);
      }
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

//function onSaveButtonClick() {
//  const fileName =
//    getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
//  const fileContent = input.value;
//  saveFileHttp(fileName, fileContent); // Save the file using the selected directory
//}

async function openAllFiles(currentDirectory) {
  console.log("Start loading!!");

  const includeNestedFiles = document.getElementById(
    "nestedFilesCheckbox"
  ).checked;

  // Fetch files, including nested directories only if the checkbox is checked
  await getFileHttp(currentDirectory, includeNestedFiles);

  console.log("А теперь - дискотека!!!");
  afterHttpOpen();
}

async function openSelectedFiles(fileLinks) {
  console.log("Start loading!!");

  // Loop through each selected file and fetch the file content
  for (let fileLink of fileLinks) {
    const filePath = `${currentDirectory}/${fileLink.textContent.trim()}`; // Get file path from the link text

    try {
      await getFileHttp(filePath); // Fetch each selected file content
      console.log(`Loaded file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to load file: ${filePath}`, error);
    }
  }

  console.log("А теперь - дискотека!!!");
  afterHttpOpen();
}

function afterHttpOpen() {
  initialCheckFold(isFoldFiles);
  allLiFold(!isFoldFiles, "todomFoldFiles", indexedFiles, filesArray);
  showOrHideDeleteAllItems();
  showItemSortingArrows(foldedClass.childElementCount);
}

// Function to handle directory selection
//function onDirectorySelected(selectedDirectory) {
//  // Push the current directory onto the stack
//  directoryStack.push(currentDirectory);
//  // Concatenate the current directory and the selected one
//  const newPath = `${currentDirectory}/${selectedDirectory}`;

//  // Fetch and update data for the selected directory
//  openDirectory(newPath);
//}

// Function to handle the Back button click
//async function onBackButtonClick() {
//  try {
//    // Pop the last directory from the stack
//    const previousPath = directoryStack.pop();

//    // Update the current directory to the previous one
//    currentDirectory = previousPath;

//    // Fetch data for the previous directory
//    const response = await fetch(
//      `http://192.168.0.14:8000/open-directory?path=${previousPath}`,
//      {
//        method: "GET",
//        mode: "cors",
//      }
//    );

//    const fileTree = await response.json();

//    if (fileTree.success) {
//      // Update the UI with data for the previous directory
//      createDirectoryModal(
//        fileTree.tree.map((file) => file.name),
//        onDirectorySelected,
//        onBackButtonClick
//      );
//    } else {
//      console.error(fileTree.error);
//    }
//  } catch (error) {
//    console.error(error);
//  }
//}

// Function to open a directory
async function openDirectory(directoryPath, save = false) {
  return new Promise(async (resolve, reject) => {
    // Wrap in Promise
    try {
      // Remove trailing slashes
      directoryPath = directoryPath.replace(/\/+$/, "");

      // Update the current directory when navigating into a new directory
      currentDirectory = directoryPath;

      const response = await fetch(`open-directory?path=${directoryPath}`, {
        method: "GET",
        mode: "cors",
      });

      const fileTree = await response.json();

      if (fileTree.success) {
        // Show the directory modal with the correct behavior (open or save)
        createDirectoryModal(
          fileTree.tree.map((file) => file),
          //onDirectorySelected(currentDirectory),
          (selectedDirectory) => {
            // Push the current directory onto the stack
            directoryStack.push(currentDirectory);
            openDirectory(`${directoryPath}/${selectedDirectory}`, save).then(
              resolve
            );
          },
          () => {
            currentDirectory = directoryStack.pop();
            openDirectory(currentDirectory, save).then(resolve);
          },
          //onBackButtonClick,
          save,
          resolve // Pass resolve to resolve when modal is done
        );
      } else {
        reject(fileTree.error);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to create and show the directory modal
function createDirectoryModal(
  directories,
  onDirectorySelected,
  onBackButtonClick,
  save = false,
  resolve
) {
  // Check if the modal already exists
  const existingModal = document.getElementById("directoryModal");
  if (existingModal) {
    existingModal.remove(); // Remove the existing modal
  }

  // Create modal container
  const modalContainer = document.createElement("div");
  modalContainer.id = "directoryModal";
  modalContainer.classList.add("modal-container");
  modalContainer.style.display = "block"; // Make it visible

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content", "flex-row");

  const buttonLine = document.createElement("div");
  buttonLine.classList.add("button-line");

  const topSection = document.createElement("div");
  topSection.classList.add("top-section", "flex-small");

  const contentSection = document.createElement("div");
  contentSection.classList.add("content-section", "flex-small");

  // Add input for file name if in save mode
  let inputField;
  if (initialFileName === null) {
    initialFileName =
      getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
  }

  const soButton = document.createElement("button");

  const openAllButton = document.createElement("button");

  if (save) {
    // Create "Create Folder" button
    const createFolderButton = document.createElement("button");
    createFolderButton.textContent = "Create Folder";
    createFolderButton.onclick = function () {
      const folderName = prompt("Enter new folder name:");
      if (folderName && folderName.trim()) {
        createNewFolder(currentDirectory, folderName.trim()).then(() => {
          // Refresh the directory listing after creating the folder
          openDirectory(currentDirectory, save).then(resolve);
        });
      }
    };

    // Create file name input field
    inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = initialFileName;
    inputField.placeholder = "Enter file name"; // Placeholder text
    topSection.appendChild(inputField);

    // Add an event listener to update the global `initialFileName` when the user changes the input
    inputField.addEventListener("input", function () {
      initialFileName = inputField.value.trim(); // Update the global variable
    });

    // Create save button
    soButton.textContent = "Save Here";
    soButton.onclick = function () {
      const newFileName = inputField.value.trim();
      if (newFileName) {
        saveDirectory = currentDirectory; // Set the current directory as the save location
        modalContainer.style.display = "none";
        document.documentElement.style.overflow = "";

        // Reset `initialFileName` after saving
        initialFileName = null;

        resolve(newFileName); // Resolve with the new file name
      }
    };
    buttonLine.appendChild(createFolderButton);
  } else {
    // Add this checkbox near the "Open" button in the modal
    const nestedFilesCheckbox = document.createElement("input");
    nestedFilesCheckbox.type = "checkbox";
    nestedFilesCheckbox.id = "nestedFilesCheckbox";
    nestedFilesCheckbox.checked = false; // Default: do not include nested files

    const nestedFilesLabel = document.createElement("label");
    nestedFilesLabel.for = "nestedFilesCheckbox";
    nestedFilesLabel.textContent = "Include nested files";
    topSection.appendChild(nestedFilesCheckbox);
    topSection.appendChild(nestedFilesLabel);

    openAllButton.textContent = "Open All Files";
    openAllButton.onclick = function () {
      openAllFiles(currentDirectory);

      modalContainer.style.display = "none"; // Hide the modal after opening files
      // Remove the style to allow scrolling
      document.documentElement.style.overflow = "";
    };

    // Create open button
    soButton.textContent = "Open";
    soButton.onclick = function () {
      if (selectedFiles.length > 0) {
        openSelectedFiles(selectedFiles); // Pass all selected files to be opened
        modalContainer.style.display = "none";
        document.documentElement.style.overflow = "";
      } else {
        alert("Please select at least one file to open.");
      }
    };
  }

  // Create back button
  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.style.visibility = "hidden";
  backButton.onclick = function () {
    currentDirectory = directoryStack.pop();
    openDirectory(currentDirectory, save).then(resolve);
  };

  buttonLine.appendChild(backButton);
  buttonLine.appendChild(soButton);
  buttonLine.appendChild(openAllButton);

  // Create close button
  const closeButton = document.createElement("div");
  closeButton.classList.add("close");
  closeButton.innerHTML = "&times;"; // Times symbol for close
  closeButton.onclick = function () {
    modalContainer.style.display = "none"; // Hide the modal on close
    // Remove the style to allow scrolling
    document.documentElement.style.overflow = "";

    // Reset `initialFileName` if the modal is closed
    initialFileName = null;

    resolve(null); // Resolve with null when modal is closed
  };

  // Append close button to content
  buttonLine.appendChild(closeButton);
  topSection.appendChild(buttonLine);

  // Check if the directory stack is empty to decide whether to show the back button
  if (directoryStack.length > 0) {
    // Append back button to content
    backButton.style.visibility = "visible";
  }

  // Create directory list
  const directoryList = document.createElement("ul");

  // Populate directory list
  directories.forEach((directory) => {
    const listItem = document.createElement("li");
    const directoryLink = document.createElement("a");
    directoryLink.href = "javascript:void(0)";
    directoryLink.textContent = directory.name;

    // if it's a directory, open it
    if (directory.isDirectory) {
      directoryLink.classList.add("directory-link");
      directoryLink.onclick = function () {
        directoryStack.push(currentDirectory);
        openDirectory(`${currentDirectory}/${directory.name}`, save).then(
          resolve
        );
        selectedFiles = []; // Clear selected files when a directory is clicked
        clearFileSelection(); // Remove selection styling
      };
    } else {
      // If it's a file, style it and handle file opening on click
      directoryLink.classList.add("file-link"); // Apply file styling
      directoryLink.onclick = function () {
        if (save) {
          inputField.value = directory.name;
        } else {
          if (directoryLink.classList.contains("selected")) {
            // If the file is already selected, deselect it
            directoryLink.classList.remove("selected");
            selectedFiles = selectedFiles.filter(
              (file) => file !== directoryLink
            ); // Remove from the selected list
          } else {
            // Select this file (allow multiple selections)
            directoryLink.classList.add("selected");
            selectedFiles.push(directoryLink); // Add to the selected list
          }
        }
      };
    }

    listItem.appendChild(directoryLink);
    directoryList.appendChild(listItem);
  });

  // Append directory list to content
  contentSection.appendChild(directoryList);

  modalContent.appendChild(topSection);
  modalContent.appendChild(contentSection);

  // Append content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to the document body
  document.body.appendChild(modalContainer);

  // Add the style to hide scrollbar thumb
  document.documentElement.style.overflow = "hidden";

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === modalContainer) {
      modalContainer.style.display = "none";
      // Remove the style to allow scrolling
      document.documentElement.style.overflow = "";

      // Reset `initialFileName` if clicking outside the modal
      initialFileName = null;

      resolve(null);
    }
  });
}

function clearFileSelection() {
  const selectedElements = document.querySelectorAll(".file-link.selected");
  selectedElements.forEach((element) => element.classList.remove("selected"));
}

// Example: Attach this function to your "Open Directory" button
function handleOpenDirectoryClick() {
  openDirectory(rootDirectory);
}

const dir = "md/chron/2023-12/";

const fileHttpHandler = (name, dir, size, text) => {
  const fileObj = {
    name: name,
    //dir: res.webkitRelativePath,
    size: size,
    text: text,
  };
  filesArray.push(fileObj);
  //indexedFiles.push(idCounterFiles.toString());
  //liDomMaker(idCounterFiles);
  //idCounterFiles++;
  indexedFiles.push(idCounterFiles.toString());
  const correctedFilesIndex =
    indexedFiles.indexOf(idCounterFiles.toString()) * 1;
  filesArray[correctedFilesIndex].text = text;
  liDomMaker(idCounterFiles);
  idCounterFiles++;
};

// Recursive function for downloading files
const getFileHttp = async (fileName, includeNestedFiles = false) => {
  try {
    const response = await fetch(`open-directory?path=${fileName}`, {
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("Bad response from server");
    }

    let isJSON = false;
    let directoryListing;

    try {
      // Clone the response to avoid reading the body more than once
      const clonedResponse = response.clone();
      // Attempt to parse the response as JSON
      directoryListing = await clonedResponse.json();
      isJSON = true;
    } catch (jsonError) {
      // Parsing as JSON failed; treat it as a regular file
      isJSON = false;
    }

    if (isJSON && directoryListing && Array.isArray(directoryListing.tree)) {
      // It's a directory; create an array of promises for each file
      // or It's a directory; get files
      const filePromises = directoryListing.tree.map(async (file) => {
        const filePath = fileName + "/" + file.name;

        if (!file.isDirectory) {
          // If it's a file, process it
          await getFileHttp(filePath);
        } else if (includeNestedFiles && file.isDirectory) {
          // If nested files are allowed, process the directory
          await getFileHttp(filePath, includeNestedFiles);
        }
      });

      // Wait for all files and directories to be processed
      await Promise.all(filePromises);
    } else {
      // Handle the file content here
      const text = await response.text();
      fileHttpHandler(fileName, null, text.length, text);
    }
  } catch (error) {
    console.error(error);
  }
};

// Function to save the file content to the server
async function saveFileHttp(fileName, fileContent) {
  try {
    // Check if the file already exists by sending a HEAD request
    const fileExistsResponse = await fetch(
      `open-directory?path=${saveDirectory}/${fileName}`,
      {
        method: "HEAD",
        mode: "cors",
      }
    );

    // If the file exists, confirm if the user wants to overwrite
    if (fileExistsResponse.ok) {
      const overwrite = confirm(
        `File "${fileName}" already exists. Do you want to overwrite it?`
      );
      if (!overwrite) {
        console.log("File save canceled.");
        return;
      }
    }

    const response = await fetch(`save-file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: `${saveDirectory}/${fileName}`, // Use the dynamically selected directory
        fileContent: fileContent,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save file.");
    }

    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error("Error while saving the file: ", error);
  }
}

// Function to create a new folder
async function createNewFolder(currentDirectory, folderName) {
  try {
    const response = await fetch(`create-folder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        directory: currentDirectory,
        folderName: folderName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create folder.");
    }

    const result = await response.json();
    console.log("Folder created successfully:", result);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
}

function handleFiles(files) {
  Promise.all(
    (function* () {
      let arrFromFiles = [...files].sort((a, b) =>
        a.lastModified !== b.lastModified
          ? a.lastModified < b.lastModified
            ? -1
            : 1
          : 0
      );

      for (let file of arrFromFiles) {
        yield new Promise((resolve) => {
          const fileObj = {
            name: file.name,
            dir: file.webkitRelativePath,
            size: file.size,
          };
          filesArray.push(fileObj);
          let reader = new FileReader();
          reader.onload = (event) =>
            resolve({
              content: event.target.result,
              date: formatDate(
                file.lastModifiedDate || new Date(file.lastModified)
              ),
            });
          reader.readAsText(file);
        });
      }
    })()
  ).then((fileDataArray) => {
    if (fileDataArray.length === 0) {
      alert("No File/Directory selected!");
      fileElem.value = null;
      return;
    }
    if (isItemState) {
      const arrItems = fileDataArray[0].content.split("\n");
      arrItems.forEach((item) => {
        if (item) {
          const itemObj = {
            text: [
              { variant: item, date: fileDataArray[0].date.toLocaleString() },
            ],
          };
          itemsArray.push(itemObj);
          indexedItems.push(idCounterItems.toString());
          liDomMaker(idCounterItems);
          idCounterItems++;
        }
      });
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
      filesArray.splice(idCounterFiles, 1);
      if (filesArray.length === 0) fileElem.value = null;
      allLiFold(isFoldItems, "todomFoldItems", indexedItems, itemsSpecArray);
    } else {
      // Files
      fileDataArray.forEach((fileData) => {
        indexedFiles.push(idCounterFiles.toString());
        const correctedFilesIndex =
          indexedFiles.indexOf(idCounterFiles.toString()) * 1;
        filesArray[correctedFilesIndex].text = fileData.content;
        liDomMaker(idCounterFiles);
        idCounterFiles++;
      });
      initialCheckFold(isFoldFiles);
      allLiFold(!isFoldFiles, "todomFoldFiles", indexedFiles, filesArray);
    }

    showOrHideDeleteAllItems();
    showItemSortingArrows(foldedClass.childElementCount);
  });
}

function addFiles(e) {
  e.stopPropagation();
  e.preventDefault();

  // if directory support is available
  if (e.dataTransfer && e.dataTransfer.items) {
    var items = e.dataTransfer.items;
    for (var i = 0; i < items.length; i++) {
      var item = items[i].webkitGetAsEntry();

      if (item) {
        addDirectory(item);
      }
    }
    return;
  }

  // Fallback
  var files = e.target.files || e.dataTransfer.files;
  if (files.length === 0) {
    alert("File type not accepted");
    return;
  }
  console.log("1: normal");
  handleFiles(files);
}

function addDirectory(item) {
  var _this = this;
  if (item.isDirectory) {
    var directoryReader = item.createReader();
    directoryReader.readEntries(function (entries) {
      entries.forEach(function (entry) {
        _this.addDirectory(entry);
      });
    });
  } else {
    item.file(function (file) {
      console.log("2: what happend?");
      handleFiles([file], 0);
    });
  }
}

const handleFilesArray = () => {
  for (let i = 0; i < filesArray.length; i++) {
    // error?? instead 'i' need 'idCounterFiles'
    indexedFiles.push(idCounterFiles.toString());
    liDomMaker(i);
    idCounterFiles++;
  }
};

function initialize() {
  document.body.onfocus = checkIt;

  //console.log("initializing");
}

const saveItemFromFile = (fileName) => {
  const itemIndex = itemsArray.findIndex((s) => s.name && s.name === fileName);
  if (itemIndex !== -1) {
    const itemId = indexedItems[itemIndex];
    const currentSave = getCurrentSpec("save", itemIndex);
    itemsArray[itemIndex].text[currentSave].variant.push(input.value);
    // maybe need to add ++curentSave
    const liDOM = document.getElementById(itemId);
    const textArr = itemsArray[itemIndex].text;
    const len = textArr[currentSave].length;
    itemsSpecArray[itemIndex].save = len - 1;
    saveHistoryTracker(liDOM, len);
    const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
    mdToTagsWithoutShape(resizableDiv, input.value);
    liDOM.classList.add("new-from-file");
    scrollToTargetAdjusted(liDOM, preview.scrollTop);
  } else {
    const itemObj = {
      text: [{ variant: input.value, date: getFullCurrentDate() }],
      name: fileName,
    };
    itemsArray.push(itemObj);
    const specObj = {
      save: 0,
    };
    itemsSpecArray.push(specObj);
    indexedItems.push(idCounterItems.toString());
    liDomMaker(idCounterItems, "new-from-file");
    idCounterItems++;
  }
  defaultMarkers();
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
};

function checkIt() {
  //console.log("start checking");
  const previewOffset = preview.scrollTop;
  let fileName;
  if (fileIndexToEdit != null) {
    const resizableDiv = editedFileLiDOM.querySelector(
      ".file-text.resizable-div"
    );
    mdToTagsWithoutShape(resizableDiv, filesArray[fileIndexToEdit].text);
    addOrRemoveScrollObserverToLi(editedFileLiDOM);
    fileName = filesArray[fileIndexToEdit].name;
    scrollToTargetAdjusted(editedFileLiDOM, previewOffset);
  } else {
    filesArray[idCounterFiles].size = fileSizeGlobal;
    fileName = filesArray[idCounterFiles].name;
    liDomMaker(idCounterFiles);
    idCounterFiles++;
  }

  if (!isItemState) {
    foldedClass = document.getElementById("list-items");
    isItemState = !isItemState;
    saveItemFromFile(fileName);
    foldedClass = document.getElementById("list-files");
    isItemState = !isItemState;
  }

  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  showOrHideDeleteAllItems();

  localStorage.removeItem("todomLastInputValue");

  document.body.onfocus = null;

  //console.log("checked");
}

fileElem.addEventListener("click", function (e) {
  e.stopPropagation();
});

fileElem.addEventListener(
  "change",
  function (e) {
    addFiles(e);
  },
  false
);

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

    if (window.location.protocol === "file:") {
      fileElem.click();
    } else {
      //getFileHttp(phrase);
      //getFileHttp(dir);
      //openDirectory("");
      handleOpenDirectoryClick();
    }
  } else {
  }
  showItemSortingArrows(foldedClass.childElementCount);
};

const horizontalIteration = (oneOfArr) => {
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

const idleIterationPayload = (i) => {
  indexedItems.push(idCounterItems.toString());
  liDomMaker(i);
  idCounterItems++;
};

const arrCheckForNull = (arr) => {
  let len = arr.length,
    i;
  const len1 = len;
  for (i = 0; i < len; i++) {
    if (i in arr && arr[i] != undefined) {
      horizontalIteration(arr[i]);
      idleIterationPayload(i);
    } else {
      arr.splice(i, 1);
      itemsSpecArray.splice(i, 1); // sync
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
      arrCheckForNull(itemsArray);
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

itemsFilesToggleButton.addEventListener("click", function (e) {
  isItemState = !isItemState;
  showItemSortingArrows(0);
  twoClickToTrash = false;
  if (isItemState) {
    initializeItemState();
    showOrHideTrash();
    showOrHideUndoDeleteButton();
  } else {
    fileElem.setAttribute("webkitdirectory", "true");
    initializeFileState();
  }
  showOrHideDeleteAllItems();
  e.stopPropagation();
});
