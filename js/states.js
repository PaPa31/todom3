const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");
const foldedClass = document.querySelector(".markdown-body > ol");

//const fileSelect = document.getElementById("fileSelect");
let fileElem = document.getElementById("file-elem");
// emptying the FileList
fileElem.value = null;

//fileElem.files = FileList[];
//const fileList = document.getElementById("fileList");
//const fileSend = document.getElementById("sendFile");

//const file = document.querySelector("input[type=file]");

// starting in Item state & Unfolded view
let isItemState = true;
let isFoldedView = false;

let itemsArray = localStorage.getItem("items")
  ? JSON.parse(localStorage.getItem("items"))
  : [];
let filesArray = [];
let trashArray = localStorage.getItem("trash")
  ? JSON.parse(localStorage.getItem("trash"))
  : [];

let nullGotIntoStorage = false;

let counterItems = 0;
let counterFiles = 0;

// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];
let indexedFilesArray = [];

let twoClickToTrash = false;
let twoClickTrashClear = false;

let lastClickId;
let lastItem;
let lastInputValue = localStorage.getItem("last")
  ? localStorage.getItem("last")
  : "";

let itemIndexToEdit;
let editedItemElementDOM;

let fileIndexToEdit;
let editedFileElementDOM;

let offsetGlobal;

const liMaker = (text, count) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  if (isItemState) {
    div.setAttribute("class", "md-item");
    div.innerHTML = markdown(text);
  } else {
    const div2 = document.createElement("div");
    const div3 = document.createElement("div");
    div.setAttribute("class", "md-file");
    div2.setAttribute("class", "file-name");
    div2.innerHTML = text.dir ? text.dir : text.name;
    div.appendChild(div2);
    div3.setAttribute("class", "file-text");
    div3.innerHTML = markdown(text.text);
    div.appendChild(div3);
  }

  li.id = count;
  li.appendChild(div);
  ol.appendChild(li);
  //console.log("URL =", url);
  unfoldButtonMaker(li);
  controlDivMaker(li);
  showItemSortingArrows(ol.childElementCount);
};

const controlDivMaker = (parentDiv) => {
  const divTag = document.createElement("div");
  divTag.setAttribute("id", "unit-control");
  parentDiv.appendChild(divTag);

  editButtonMaker(divTag);
  trashButtonMaker(divTag);
};

const unfoldButtonMaker = (parentLi) => {
  const mdTag = isItemState
    ? parentLi.firstChild
    : parentLi.firstChild.lastChild;
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "muted-button unfold-button btn");
  buttonTag.setAttribute("onclick", `unfoldOneItem(this.parentElement)`);
  if (isItemState && mdTag.scrollHeight < 40) {
    buttonTag.setAttribute("disable", true);
  } else {
    buttonTag.setAttribute("title", "fold/unfold one");
  }
  parentLi.appendChild(buttonTag);
};

const editButtonMaker = (parentDiv) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "edit-item btn");
  if (isItemState) {
    buttonTag.setAttribute(
      "onclick",
      `editItem(event, this.parentElement.parentElement)`
    );
  } else {
    buttonTag.setAttribute(
      "onclick",
      `editFile(this.parentElement.parentElement)`
    );
  }
  buttonTag.setAttribute(
    "title",
    "Click to Edit, Ctrl+click merge with input area"
  );

  parentDiv.appendChild(buttonTag);
};

const trashButtonMaker = (parentDiv) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-one-item btn");
  if (isItemState) {
    buttonTag.setAttribute(
      "onclick",
      `deleteOneItem(event, this.parentElement.parentElement)`
    );
  } else {
    buttonTag.setAttribute(
      "onclick",
      `deleteOneFile(event, this.parentElement.parentElement)`
    );
  }
  buttonTag.setAttribute(
    "title",
    "Double-click to Trash, Ctrl+click to Delete"
  );

  parentDiv.appendChild(buttonTag);
};

const unfoldOneItem = (element) => {
  element.firstChild.classList.toggle("unfolded");
};

const editFile = (element) => {
  editedFileElementDOM = element;
  fileIndexToEdit = indexedFilesArray.indexOf(element.id) * 1;
  const fi = filesArray[fileIndexToEdit];
  const fileName = fi.dir ? fi.dir : fi.name;
  input.value = fi.text;
  editUI(fileName);
  xUI();
  mdToPreview(input.value);
};

const deleteOneFile = (e, element) => {
  e.stopPropagation();
  if (twoClickToTrash && element.id === lastClickId) {
    const indexToDelete = indexedFilesArray.indexOf(element.id) * 1;

    if (fileIndexToEdit != null && fileIndexToEdit >= indexToDelete) {
      if (filesArray[fileIndexToEdit].name == filesArray[indexToDelete].name) {
        defaultMarkers();
        inputLabel.innerHTML = "<div>New</div>";
      } else {
        fileIndexToEdit--;
      }
    }

    ol.removeChild(element);
    showItemSortingArrows(ol.childElementCount);

    filesArray.splice(indexToDelete, 1);
    indexedFilesArray.splice(indexToDelete, 1);
    counterFiles--;
    showOrHideDeleteAllItems();
    if (counterFiles == 0) fileElem.value = null;

    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.lastChild.classList.remove("filter-red");
    lastClickId = element.id;
    element.lastChild.lastChild.classList.add("filter-red");
    lastItem = element;
    twoClickToTrash = true;
  }
};

firstHeaderButton.addEventListener("click", function (e) {
  const allPressed = [...document.querySelectorAll(".unfolded")];
  if (allPressed.length) allPressed.map((i) => i.classList.remove("unfolded"));
  if (isFoldedView) {
    // Unfolded view
    firstHeaderButton.classList.replace("fold", "unfold");
    foldedClass.classList.remove("folded");
  } else {
    // Folded view
    firstHeaderButton.classList.replace("unfold", "fold");
    foldedClass.classList.add("folded");
  }
  isFoldedView = !isFoldedView;
  e.stopPropagation();
});

const showOrHideTrash = () => {
  if (trashArray.length) {
    deletedCounter.innerText = trashArray.length;
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

var phrase = "README.md";

const logFileText = async (file) => {
  const response = await fetch(file);
  const text = await response.text();
  ol.innerHTML = text;
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
        if (!file.type.startsWith("text/markdown")) {
          continue;
        }
        yield new Promise((resolve) => {
          const obj = {
            name: file.name,
            dir: file.webkitRelativePath,
          };
          filesArray.push(obj);
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
          itemsArray.push(item);
          liMaker(item, counterItems);
          indexedItemsArray.push(counterItems.toString());
          counterItems++;
        }
      });
      localStorage.setItem("items", JSON.stringify(itemsArray));
      filesArray.splice(counterFiles, 1);
      if (counterFiles == 0) fileElem.value = null;
    } else {
      // Files
      texts.map((text) => {
        filesArray[counterFiles].text = text;
        liMaker(filesArray[counterFiles], counterFiles);
        indexedFilesArray.push(counterFiles.toString());
        counterFiles++;
      });
    }
    showOrHideDeleteAllItems();
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
  if (!files.length) {
    alert("File type not accepted");
    return;
  }
  console.log("1");
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
      console.log("2");
      handleFiles([file], 0);
    });
  }
}

const handleFilesArray = () => {
  for (let i = 0; i < filesArray.length; i++) {
    liMaker(filesArray[i], i);
    indexedFilesArray.push(counterFiles.toString());
    counterFiles++;
  }
};

function initialize() {
  document.body.onfocus = checkIt;

  //console.log("initializing");
}

function checkIt() {
  //console.log("start checking");

  if (fileIndexToEdit != null) {
    editedFileElementDOM.firstChild.lastChild.innerHTML = markdown(
      filesArray[fileIndexToEdit].text
    );
    disableButton(editedFileElementDOM);
    scrollToTargetAdjusted(editedFileElementDOM, offsetGlobal);
  } else {
    liMaker(filesArray[counterFiles], counterFiles);
    counterFiles++;
  }

  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  showOrHideDeleteAllItems();

  localStorage.removeItem("last");

  document.body.onfocus = null;
  //console.log("checked");
}

fileElem.addEventListener("click", function (e) {
  //initialize();
  e.stopPropagation();
});

//fileElem.addEventListener("change", handleFiles, false);
fileElem.addEventListener(
  "change",
  function (e) {
    addFiles(e);
  },
  false
);

const initializeFileState = () => {
  counterFiles = 0;
  indexedFilesArray = [];
  saveButton.innerText = "Save file";
  secondHeaderButton.innerText = "Files";
  openFileButton.innerText = "Open file";
  deleteAllItemsButton.innerText = "Close All Files";
  saveAsFileButton.classList.replace("inline-block", "none");
  openDirButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("inline-block", "none");
  clearTrashButton.classList.replace("inline-block", "none");

  if (window.location.protocol === "file:") {
    if (!fileElem.files.length && !filesArray.length) {
      fileElem.click();
    } else {
      handleFilesArray();
    }
  } else {
    logFileText(phrase);
  }
};

const initializeItemState = () => {
  counterItems = 0;
  indexedItemsArray = [];
  saveButton.innerText = "Save item";
  secondHeaderButton.innerText = "Items";
  openFileButton.innerText = "Split file";
  deleteAllItemsButton.innerText = "Delete All Items";
  saveAsFileButton.classList.replace("none", "inline-block");
  openDirButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("none", "inline-block");
  clearTrashButton.classList.replace("none", "inline-block");

  nullGotIntoStorage = false;

  itemsArray?.forEach((item, key) => {
    if (item) {
      liMaker(item, key);
      indexedItemsArray.push(counterItems.toString());
      counterItems++;
    } else {
      itemsArray.splice(key, 1);
      nullGotIntoStorage = true;
      console.log(`items: ${key} item is null and ignored!`);
    }
  });

  if (nullGotIntoStorage) {
    localStorage.setItem("items", JSON.stringify(itemsArray));
  }
};

secondHeaderButton.addEventListener("click", function (e) {
  isItemState = !isItemState;
  showItemSortingArrows(0);
  twoClickToTrash = false;
  ol.innerHTML = "";
  if (isItemState) {
    initializeItemState();
    showOrHideTrash();
  } else {
    fileElem.setAttribute("webkitdirectory", "true");
    initializeFileState();
  }
  showOrHideDeleteAllItems();
  e.stopPropagation();
});
