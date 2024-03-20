const foldAllToggleButton = document.getElementById("fold-global-toggle");
const itemsFilesToggleButton = document.getElementById("items-files-toggle");

let foldedClass = document.getElementById("list-items");

const listItems = document.getElementById("list-items");
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

const changeCurrentInBefore = (ancestorEl, current) => {
  ancestorEl.style = "--todom-before-current-save: '" + ++current + "';";
};

const liMaker = (arrIndex) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  let last, currentSave, currentFold;

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
    mdToLi(resizableDiv, textArr[currentSave]);
    if (last > 0) {
      changeCurrentInBefore(resizableDiv, currentSave);
    } else {
      initialInBefore(resizableDiv);
    }
    div.appendChild(resizableDiv);
    li.id = idCounterItems;
  } else {
    const correctedFilesIndex = indexedFiles.indexOf(arrIndex.toString()) * 1;
    div.setAttribute("class", "md-file");

    fileInfoDivMaker(div, correctedFilesIndex);

    li.id = idCounterFiles;
  }

  div.addEventListener("dblclick", handleDblClick);

  foldButtonMaker(li);
  if (isItemState) saveHistoryDivMaker(li, last, currentSave);
  mainActDivMaker(li);
  li.appendChild(div);
  foldedClass.appendChild(li);

  addClickListenersToImages(li);

  scrollToTargetAdjusted(li, preview.scrollTop);
};

const fileInfoDivMaker = (parentDiv, arrIndex) => {
  const file = filesArray[arrIndex];
  const fileInfoDiv = createEl("div", { class: "file-info" }, parentDiv);
  const fileNameDiv = createEl("div", { class: "file-name" }, fileInfoDiv);
  fileNameDiv.innerHTML = file.dir ? file.dir : file.name;
  const fileSizeDiv = createEl("div", { class: "file-size" }, fileInfoDiv);
  fileSizeDiv.innerHTML = file.size ? fileSizeTerm(file.size) : "";
  const attr = { class: "file-text resizable-div" };
  const fileTextDiv = createEl("div", attr, parentDiv);
  mdToLi(fileTextDiv, file.text);
};

const foldButtonMaker = (parentLi) => {
  const attr = {
    class: "button-default fold-button btn",
    title: "fold/unfold one",
    onclick: `foldOneItem(findParentTagOrClassRecursive(this))`,
  };
  const buttonTag = createEl("button", attr, parentLi);
  createEl("span", null, buttonTag);
};

const saveHistoryDivMaker = (paDiv, last, current) => {
  const saveHistoryDiv = createEl("div", { class: "save-history" }, paDiv);
  previousSaveButtonMaker(saveHistoryDiv, current);
  counterSaveSpanMaker(saveHistoryDiv, current);
  nextSaveButtonMaker(saveHistoryDiv, current === last);
  deleteCurrentSaveButtonMaker(saveHistoryDiv);
};

const counterSaveSpanMaker = (paDiv, current) => {
  const counterSaveSpan = createEl("span", { class: "counter-save" }, paDiv);
  counterSaveSpan.innerText = current + 1;
};

const previousSaveButtonMaker = (paDiv, current) => {
  const attr = {
    class: "previous-save btn",
    title: "Show previous save",
    disable: current === 0 ? true : false,
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
    onclick: isItemState ? `editItem(event, this)` : `editFile(event, this)`,
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

const setCurrentSave = (current, itemIndex) => {
  itemsSpecArray[itemIndex].save = current;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
};

const deleteCurrentSave = (el) => {
  const liDOM = findParentTagOrClassRecursive(el);
  const itemIndex = indexedItems.indexOf(liDOM.id) * 1;

  let current = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;

  const lastBefore = textArr.length - 1;
  putItemToDeletedArray(textArr[current]);
  if (lastBefore === 0) {
    removeItemFromMemory(liDOM, itemIndex);
    return;
  }
  textArr.splice(current, 1);
  const lastAfter = textArr.length - 1;
  if (current < lastAfter) {
    // we do not change 'current' due to splice,
    // 'current' points to the next position
    //current++;
  } else {
    el.previousSibling.setAttribute("disable", true);
    if (current === lastBefore) {
      current--;
      el.previousSibling.previousSibling.innerText = current + 1;
    }
    if (lastAfter === 0) {
      el.previousSibling.previousSibling.previousSibling.setAttribute(
        "disable",
        true
      );
    }
  }
  const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
  mdToLi(resizableDiv, textArr[current]);
  if (lastAfter > 0) {
    changeCurrentInBefore(resizableDiv, current);
  } else {
    initialInBefore(resizableDiv);
  }
  setCurrentSave(current, itemIndex);
};

const previousSave = (el) => {
  const liDOM = findParentTagOrClassRecursive(el);
  const itemIndex = indexedItems.indexOf(liDOM.id) * 1;

  let current = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;

  current--;
  el.nextSibling.nextSibling.removeAttribute("disable");
  el.nextSibling.innerText = current + 1;
  if (current < 1) {
    el.setAttribute("disable", true);
  }
  const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
  mdToLi(resizableDiv, textArr[current]);
  changeCurrentInBefore(resizableDiv, current);
  setCurrentSave(current, itemIndex);
};

const nextSave = (el) => {
  const liDOM = findParentTagOrClassRecursive(el);
  const itemIndex = indexedItems.indexOf(liDOM.id) * 1;

  let current = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;

  current++;
  el.previousSibling.innerText = current + 1;
  el.previousSibling.previousSibling.removeAttribute("disable");
  if (current >= textArr.length - 1) {
    el.setAttribute("disable", true);
  }
  const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
  mdToLi(resizableDiv, textArr[current]);
  changeCurrentInBefore(resizableDiv, current);
  setCurrentSave(current, itemIndex);
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

const foldAndOffsetHeight = (liDOM) => {
  const initialScrollTop = window.scrollY;
  liDOM.classList.toggle("folded");
  window.scrollTo(0, initialScrollTop);
};

const foldOneItem = (liDOM) => {
  foldAndOffsetHeight(liDOM);
  if (isItemState) {
    const itemIndexToFold = indexedItems.indexOf(liDOM.id) * 1;
    itemsSpecArray[itemIndexToFold].fold =
      !itemsSpecArray[itemIndexToFold].fold;
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  } else {
    const fileIndexToFold = indexedFiles.indexOf(liDOM.id) * 1;
    filesArray[fileIndexToFold].fold = !filesArray[fileIndexToFold].fold;
  }
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
      i.removeAttribute("class");
    } else {
      i.setAttribute("class", "folded");
    }
    const indexToFold = indexedArr.indexOf(i.id) * 1;
    mainArr[indexToFold].fold = !view;
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
    restoreItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
  } else {
    restoreItemButton.classList.replace("visible", "invisible");
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

//var phrase = "static/demo.md";
var phrase = "md/chron/2024-02/12-120508-best-pc-games.md";

const rootDirectory = "../";

// Directory stack to keep track of the visited directories
const directoryStack = [];

async function onOpenButtonClick() {
  console.log("Start loading!!");
  await getFileHttp(currentDirectory);

  console.log("А теперь - дискотека!!!");
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
async function openDirectory(directoryPath) {
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
      // Show the directory modal with nested structure
      createDirectoryModal(
        fileTree.tree.map((file) => file.name),
        //onDirectorySelected(currentDirectory),
        (selectedDirectory) => {
          // Push the current directory onto the stack
          directoryStack.push(currentDirectory);
          openDirectory(`${directoryPath}/${selectedDirectory}`);
        },
        () => {
          currentDirectory = directoryStack.pop();
          openDirectory(currentDirectory);
        }
        //onBackButtonClick
      );
    } else {
      console.error(fileTree.error);
    }
  } catch (error) {
    console.error(error);
  }
}

// Function to create and show the directory modal
function createDirectoryModal(
  directories,
  onDirectorySelected,
  onBackButtonClick
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

  const topSection = document.createElement("div");
  topSection.classList.add("top-section", "flex-small");

  const contentSection = document.createElement("div");
  contentSection.classList.add("content-section", "flex-small");

  // Create close button
  const closeButton = document.createElement("div");
  closeButton.classList.add("close");
  closeButton.innerHTML = "&times;"; // Times symbol for close
  closeButton.onclick = function () {
    modalContainer.style.display = "none"; // Hide the modal on close
    // Remove the style to allow scrolling
    document.documentElement.style.overflow = "";
  };

  // Append close button to content
  topSection.appendChild(closeButton);

  // Create back button
  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.style.visibility = "hidden";
  backButton.onclick = function () {
    currentDirectory = directoryStack.pop();
    openDirectory(currentDirectory);
  };

  topSection.appendChild(backButton);

  // Create open button
  const openButton = document.createElement("button");
  openButton.textContent = "Open";
  openButton.onclick = function () {
    onOpenButtonClick();
    modalContainer.style.display = "none";
    document.documentElement.style.overflow = "";
  };

  topSection.appendChild(openButton);

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
    directoryLink.textContent = directory;
    directoryLink.onclick = function () {
      directoryStack.push(currentDirectory);
      openDirectory(`${currentDirectory}/${directory}`);
    };

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
    }
  });
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
  //liMaker(idCounterFiles);
  //idCounterFiles++;
  indexedFiles.push(idCounterFiles.toString());
  const correctedFilesIndex =
    indexedFiles.indexOf(idCounterFiles.toString()) * 1;
  filesArray[correctedFilesIndex].text = text;
  liMaker(idCounterFiles);
  idCounterFiles++;
};

// Recursive function for downloading files
const getFileHttp = async (fileName) => {
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
      const filePromises = directoryListing.tree.map(async (file) => {
        const filePath = fileName + "/" + file.name;
        await getFileHttp(filePath);
      });

      // Wait for all promises to resolve
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
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsText(file);
        });
      }
    })()
  ).then((texts) => {
    if (texts[0] === undefined) {
      alert("No File/Directory selected!");
      fileElem.value = null;
      return;
    }
    if (isItemState) {
      const arrItems = texts[0].split("\n");
      arrItems.forEach((item) => {
        if (item) {
          const itemObj = {
            text: [item],
          };
          itemsArray.push(itemObj);
          indexedItems.push(idCounterItems.toString());
          liMaker(idCounterItems);
          idCounterItems++;
        }
      });
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
      filesArray.splice(idCounterFiles, 1);
      if (filesArray.length === 0) fileElem.value = null;
    } else {
      // Files
      texts.forEach((text) => {
        indexedFiles.push(idCounterFiles.toString());
        const correctedFilesIndex =
          indexedFiles.indexOf(idCounterFiles.toString()) * 1;
        filesArray[correctedFilesIndex].text = text;
        liMaker(idCounterFiles);
        idCounterFiles++;
      });
    }
    initialCheckFold(isFoldFiles);
    allLiFold(!isFoldFiles, "todomFoldFiles", indexedFiles, filesArray);
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
    liMaker(i);
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
    itemsArray[itemIndex].text.push(input.value);
    const liDOM = document.getElementById(itemId);
    const textArr = itemsArray[itemIndex].text;
    itemsSpecArray[itemIndex].save = textArr.length - 1;
    saveHistoryTracker(liDOM, textArr.length);
    const resizableDiv = liDOM.querySelector(".md-item > .resizable-div");
    mdToLi(resizableDiv, input.value);
    scrollToTargetAdjusted(liDOM, preview.scrollTop);
  } else {
    const itemObj = {
      text: [input.value],
      name: fileName,
    };
    itemsArray.push(itemObj);
    const specObj = {
      save: 0,
    };
    itemsSpecArray.push(specObj);
    indexedItems.push(idCounterItems.toString());
    liMaker(idCounterItems);
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
    mdToLi(resizableDiv, filesArray[fileIndexToEdit].text);
    fileName = filesArray[fileIndexToEdit].name;
    scrollToTargetAdjusted(editedFileLiDOM, previewOffset);
  } else {
    filesArray[idCounterFiles].size = fileSizeGlobal;
    fileName = filesArray[idCounterFiles].name;
    liMaker(idCounterFiles);
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
  restoreItemButton.classList.replace("inline-block", "none");
  clearTrashButton.classList.replace("inline-block", "none");
  undoLastDeleteButton.classList.replace("inline-block", "none");

  listItems.style.display = "none";
  listFiles.style.display = "flex";
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

const idleIterationPayload = (i) => {
  indexedItems.push(idCounterItems.toString());
  liMaker(i);
  idCounterItems++;
};

const arrCheckForNull = (arr) => {
  let len = arr.length,
    i;
  const len1 = len;
  for (i = 0; i < len; i++) {
    if (i in arr && arr[i] != undefined) {
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

const initializeItemState = () => {
  saveAsNewButton.innerText = "Save item";
  itemsFilesToggleButton.innerText = "Items";
  openFileButton.innerText = "Split file";
  deleteAllItemsButton.innerText = "Delete All Items";
  saveAsFileButton.classList.replace("none", "inline-block");
  openDirButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("none", "inline-block");
  clearTrashButton.classList.replace("none", "inline-block");
  undoLastDeleteButton.classList.replace("none", "inline-block");

  listFiles.style.display = "none";
  listItems.style.display = "flex";
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
