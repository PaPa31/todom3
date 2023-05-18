const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");
//const foldedClass = document.querySelector(".markdown-body > ol");
const foldedClass = document.getElementById("list-items");

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
let isFoldedItemsView = localStorage.getItem("todomFoldedItemsView")
  ? JSON.parse(localStorage.getItem("todomFoldedItemsView"))
  : false;
let isFoldedFilesView = localStorage.getItem("todomFoldedFilesView")
  ? JSON.parse(localStorage.getItem("todomFoldedFilesView"))
  : false;

let itemsArray = localStorage.getItem("todomItemsArray")
  ? JSON.parse(localStorage.getItem("todomItemsArray"))
  : [];
let filesArray = [];
let trashArray = localStorage.getItem("todomTrashArray")
  ? JSON.parse(localStorage.getItem("todomTrashArray"))
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
let lastInputValue = localStorage.getItem("todomLastInputValue")
  ? localStorage.getItem("todomLastInputValue")
  : "";

let itemIndexToEdit;
let editedItemElementDOM;

let fileIndexToEdit;
let editedFileElementDOM;

let offsetGlobal;

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

const liMaker = (count) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  if (isItemState) {
    const text = itemsArray[count].text;

    div.setAttribute("class", "md-item");
    if (itemsArray[count].fold) li.setAttribute("class", "unfolded");

    div.innerHTML = markdown(text);
  } else {
    const obj = filesArray[count];

    const div2 = document.createElement("div");
    const div3 = document.createElement("div");
    const div4 = document.createElement("div");
    div.setAttribute("class", "md-file");
    if (filesArray[count].fold) li.setAttribute("class", "unfolded");
    div2.setAttribute("class", "file-name");
    div2.innerHTML = obj.dir ? obj.dir : obj.name;
    div.appendChild(div2);
    div3.setAttribute("class", "file-text");
    div3.innerHTML = markdown(obj.text);
    div.appendChild(div3);
    div4.setAttribute("class", "file-size");
    div4.innerHTML = obj.size ? fileSizeTerm(obj.size) : "";
    div.appendChild(div4);
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
    buttonTag.setAttribute("onclick", `editItem(event, this)`);
  } else {
    buttonTag.setAttribute("onclick", `editFile(event, this)`);
  }
  buttonTag.setAttribute("ctrl", "true");
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
    buttonTag.setAttribute("ctrl", "true");
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
  element.classList.toggle("unfolded");
  if (isItemState) {
    const itemIndexToFold = indexedItemsArray.indexOf(element.id) * 1;
    itemsArray[itemIndexToFold].fold = !itemsArray[itemIndexToFold].fold;
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  } else {
    const fileIndexToFold = indexedFilesArray.indexOf(element.id) * 1;
    filesArray[fileIndexToFold].fold = !filesArray[fileIndexToFold].fold;
  }
};

const editFile = (e, element) => {
  editedFileElementDOM = element.parentElement.parentElement;
  fileIndexToEdit = indexedFilesArray.indexOf(editedFileElementDOM.id) * 1;
  const fi = filesArray[fileIndexToEdit];
  const fileName = fi.dir ? fi.dir : fi.name;

  if (e.ctrlKey) {
    intervalFocus(element, "background-color: orange;", 300);
    input.value = input.value ? input.value + "\n" + fi.text : fi.text;
    scrollToLast();
  } else {
    input.value = fi.text;
    editUI(fileName);
  }

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

const initialCheckFold = (stateVar) => {
  if (stateVar) {
    // Folded view
    firstHeaderButton.classList.add("fold");
    foldedClass.classList.add("folded");
  } else {
    // Unfolded view
    firstHeaderButton.classList.remove("fold");
    foldedClass.classList.remove("folded");
  }
};

const changeStateFold = () => {
  firstHeaderButton.classList.toggle("fold");
  foldedClass.classList.toggle("folded");
};

firstHeaderButton.addEventListener("click", function (e) {
  const allPressed = [...foldedClass.querySelectorAll(".unfolded")];
  if (allPressed.length) {
    allPressed.map((i) => {
      i.removeAttribute("class");
      if (isItemState) {
        const itemIndexToFold = indexedItemsArray.indexOf(i.id) * 1;
        itemsArray[itemIndexToFold].fold = false;
      } else {
        const fileIndexToFold = indexedFilesArray.indexOf(i.id) * 1;
        filesArray[fileIndexToFold].fold = false;
      }
    });
    if (isItemState)
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  }
  changeStateFold();
  if (isItemState) {
    isFoldedItemsView = !isFoldedItemsView;
    localStorage.setItem(
      "todomFoldedItemsView",
      JSON.stringify(isFoldedItemsView)
    );
  } else {
    isFoldedFilesView = !isFoldedFilesView;
    localStorage.setItem(
      "todomFoldedFilesView",
      JSON.stringify(isFoldedFilesView)
    );
  }
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
            size: file.size,
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
          const obj = {
            text: item,
          };
          itemsArray.push(obj);
          liMaker(counterItems);
          indexedItemsArray.push(counterItems.toString());
          counterItems++;
        }
      });
      localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
      filesArray.splice(counterFiles, 1);
      if (counterFiles == 0) fileElem.value = null;
    } else {
      // Files
      texts.map((text) => {
        filesArray[counterFiles].text = text;
        liMaker(counterFiles);
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
    liMaker(i);
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
    editedFileElementDOM.firstChild.firstChild.nextSibling.innerHTML = markdown(
      filesArray[fileIndexToEdit].text
    );
    disableButton(editedFileElementDOM);
    scrollToTargetAdjusted(editedFileElementDOM, offsetGlobal);
  } else {
    liMaker(counterFiles);
    counterFiles++;
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
  initialCheckFold(isFoldedFilesView);

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
  initialCheckFold(isFoldedItemsView);

  nullGotIntoStorage = false;
  itemsArray?.forEach((item, key) => {
    if (item) {
      liMaker(key);
      indexedItemsArray.push(counterItems.toString());
      counterItems++;
    } else {
      itemsArray.splice(key, 1);
      nullGotIntoStorage = true;
      console.log(`items: ${key} item is null and ignored!`);
    }
  });

  if (nullGotIntoStorage) {
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
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
