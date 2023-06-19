const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");
//const content = document.getElementById("content");
//const vh = Math.max(
//  document.documentElement.clientHeight || 0,
//  window.innerHeight || 0
//);
//content.style.marginBottom = vh + "px";
//const foldedClass = document.querySelector(".markdown-body > ol");
let foldedClass = document.getElementById("list-items");

const listItems = document.getElementById("list-items");
const listFiles = document.getElementById("list-files");

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

const liMaker = (count) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  if (isItemState) {
    const text = itemsArray[count].text;

    div.setAttribute("class", "md-item");
    if (itemsArray[count].fold) li.setAttribute("class", "unfolded");

    div.innerHTML = markdown(text);
    li.id = counterItems;
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
    li.id = counterFiles;
  }

  //li.id = count;
  li.appendChild(div);
  foldedClass.appendChild(li);
  //console.log("URL =", url);
  unfoldButtonMaker(li);
  controlDivMaker(li);
  scrollToTargetAdjusted(li, preview.scrollTop);
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
    mdTag.classList.add("single-line");
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
    buttonTag.setAttribute(
      "title",
      "Double-click to Trash, Ctrl+click to Delete"
    );
  } else {
    buttonTag.setAttribute(
      "onclick",
      `deleteOneFile(event, this.parentElement.parentElement)`
    );
    buttonTag.setAttribute("title", "Double-click to Delete from this list");
  }
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
  const editedFileElementDOM2 = element.parentElement.parentElement;
  const fileIndexToEdit2 =
    indexedFilesArray.indexOf(editedFileElementDOM2.id) * 1;
  const fi = filesArray[fileIndexToEdit2];

  if (e.ctrlKey) {
    intervalFocus(element, "background-color: #685a7f;", 300);
    input.value = input.value ? input.value + "\n" + fi.text : fi.text;
    scrollToLast();
  } else {
    fileIndexToEdit = fileIndexToEdit2;
    editedFileElementDOM = editedFileElementDOM2;
    intervalFocus(element, "background-color: orange;", 300);
    input.value = fi.text;
    const fileName = fi.dir ? fi.dir : fi.name;
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

    foldedClass.removeChild(element);
    showItemSortingArrows(foldedClass.childElementCount);

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
  foldedClass.innerHTML = text;
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
  if (!files.length) {
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
  const previewOffset = preview.scrollTop;
  if (fileIndexToEdit != null) {
    editedFileElementDOM.firstChild.firstChild.nextSibling.innerHTML = markdown(
      filesArray[fileIndexToEdit].text
    );
    disableButton(editedFileElementDOM);
    scrollToTargetAdjusted(editedFileElementDOM, previewOffset);
  } else {
    filesArray[counterFiles].size = fileSizeGlobal;
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
  logIn3("Files");
  saveButton.innerText = "Save file";
  secondHeaderButton.innerText = "Files";
  openFileButton.innerText = "Open file";
  deleteAllItemsButton.innerText = "Close All Files";
  saveAsFileButton.classList.replace("inline-block", "none");
  openDirButton.classList.replace("none", "inline-block");
  deleteAllItemsButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("inline-block", "none");
  clearTrashButton.classList.replace("inline-block", "none");

  listItems.style.display = "none";
  listFiles.style.display = "flex";
  foldedClass = document.getElementById("list-files");
  initialCheckFold(isFoldedFilesView);

  if (indexedFilesArray.length === 0) {
    logg3("indexedFilesArray 1:", indexedFilesArray);
    counterFiles = 0;
    indexedFilesArray = [];

    if (window.location.protocol === "file:") {
      if (!fileElem.files.length && !filesArray.length) {
        fileElem.click();
      } else {
        handleFilesArray();
      }
    } else {
      logFileText(phrase);
    }
  } else {
    logg3("indexedFilesArray 2:", indexedFilesArray);
  }
  showItemSortingArrows(foldedClass.childElementCount);
  logOut3();
};

const initializeItemState = () => {
  logIn3("Items");
  saveButton.innerText = "Save item";
  secondHeaderButton.innerText = "Items";
  openFileButton.innerText = "Split file";
  deleteAllItemsButton.innerText = "Delete All Items";
  saveAsFileButton.classList.replace("none", "inline-block");
  openDirButton.classList.replace("inline-block", "none");
  restoreItemButton.classList.replace("none", "inline-block");
  clearTrashButton.classList.replace("none", "inline-block");

  listFiles.style.display = "none";
  listItems.style.display = "flex";
  foldedClass = document.getElementById("list-items");
  initialCheckFold(isFoldedItemsView);

  if (indexedItemsArray.length === 0) {
    logg3("indexedItemsArray 1:", indexedItemsArray);
    counterItems = 0;
    indexedItemsArray = [];

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
  } else {
    logg3("indexedItemsArray 2:", indexedItemsArray);
  }
  showItemSortingArrows(foldedClass.childElementCount);
  logOut3();
};

secondHeaderButton.addEventListener("click", function (e) {
  isItemState = !isItemState;
  showItemSortingArrows(0);
  twoClickToTrash = false;
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

// loggs system
if (true) {
  // Assistant for debugging errors.
  // ~~View active elements DOM,~~
  // ~~when navigation by TOC menu items.~~

  // For production - delete this block and loggs.
  // To delete all loggs use regex:^ *log.*$\n*

  // managing vars
  // change to show/hide output loggs
  var showLogg = false; // logg - 'headAndTail'
  var showLogg1 = false; // logg1 - 'whatClass'
  var showLogg2 = false; // logg2 - 'unfoldOneItem'
  var showLogg3 = false; // logg3 - 'ol-2'
  var showLogg4 = false; // logg4 -
  var showLogg5 = false; // logg5 -
  var showLogg6 = false; // logg6 - 'whatElement'

  // loggs subsystem 0
  // 'headAndTail'
  var logg = (...m) => {
    if (showLogg) console.log(...m);
  };

  // remove '...' to show
  // only first element: logIn("funcName", ~~var~~)
  var logIn = (...mes) => {
    if (showLogg) console.group(...mes);
  };
  var logOut = () => {
    if (showLogg) console.groupEnd();
  };

  // loggs subsystem 1
  // 'whatClass'
  var logg1 = (...m) => {
    if (showLogg1) console.log(...m);
  };

  var logIn1 = (...mes) => {
    if (showLogg1) console.group(...mes);
  };
  var logOut1 = () => {
    if (showLogg1) console.groupEnd();
  };

  // loggs subsystem 2
  // 'unfoldOneItem'
  var logg2 = (...m) => {
    if (showLogg2) console.log(...m);
  };

  var logIn2 = (...mes) => {
    if (showLogg2) console.group(...mes);
  };
  var logOut2 = () => {
    if (showLogg2) console.groupEnd();
  };

  // loggs subsystem 3
  // 'ol-2'
  var logg3 = (...m) => {
    if (showLogg3) console.log(...m);
  };

  var logIn3 = (...mes) => {
    if (showLogg3) console.group(...mes);
  };
  var logOut3 = () => {
    if (showLogg3) console.groupEnd();
  };

  // loggs subsystem 4
  // ''
  var logg4 = (...m) => {
    if (showLogg4) console.log(...m);
  };

  var logIn4 = (...mes) => {
    if (showLogg4) console.group(...mes);
  };
  var logOut4 = () => {
    if (showLogg4) console.groupEnd();
  };

  // loggs subsystem 5
  // ''
  var logg5 = (...m) => {
    if (showLogg5) console.log(...m);
  };

  var logIn5 = (...mes) => {
    if (showLogg5) console.group(...mes);
  };
  var logOut5 = () => {
    if (showLogg5) console.groupEnd();
  };

  // loggs subsystem 6
  // 'whatElement'
  var logg6 = (...m) => {
    if (showLogg6) console.log(...m);
  };

  var logIn6 = (...mes) => {
    if (showLogg6) console.group(...mes);
  };
  var logOut6 = () => {
    if (showLogg6) console.groupEnd();
  };
}
