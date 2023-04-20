const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

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

let itemsArray = [];
let filesArray = [];

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
let lastInputValue = "";

let itemIndexToEdit;
let editedItemElementDOM;

let fileIndexToEdit;
let editedFileElementDOM;

let inputGlobal;
let offsetGlobal;

const liMaker = (text, count) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = count;
  li.appendChild(div);
  ol.appendChild(li);
  //console.log("URL =", url);
  spanMaker(li);
  showItemSortingArrows(ol.childElementCount);
};

const spanMaker = (liTag) => {
  const spanTag = document.createElement("div");
  spanTag.setAttribute("id", "item-control");
  liTag.appendChild(spanTag);

  editButtonMaker(spanTag);
  trashButtonMaker(spanTag);
};

const editButtonMaker = (spanTag) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "edit-item btn");
  if (isItemState) {
    buttonTag.setAttribute(
      "onclick",
      "editItem(this.parentElement.parentElement)"
    );
  } else {
    buttonTag.setAttribute(
      "onclick",
      `editFile(this.parentElement.parentElement)`
    );
  }
  buttonTag.setAttribute("title", "Edit");

  spanTag.appendChild(buttonTag);
};

const trashButtonMaker = (liTag) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-one-item btn");
  if (isItemState) {
    buttonTag.setAttribute(
      "onclick",
      "deleteOneItem(this.parentElement.parentElement)"
    );
  } else {
    buttonTag.setAttribute(
      "onclick",
      `deleteOneFile(this.parentElement.parentElement)`
    );
  }
  buttonTag.setAttribute("title", "Double-click to move to Trash");

  liTag.appendChild(buttonTag);
};

const editFile = (element) => {
  //window.event.stopPropagation();
  editedFileElementDOM = element;
  //fileIndexToEdit = element.id;
  fileIndexToEdit = indexedFilesArray.indexOf(element.id) * 1;
  const fileName = filesArray[fileIndexToEdit].name;

  //console.log("editedFileElementDOM:", editedFileElementDOM);
  //const reader = new FileReader();
  //reader.readAsText(fileElem.files[element.id]);
  //reader.onload = (e) => {
  //  input.value = e.target.result;
  //};
  //input.value = reader.result;
  input.value = filesArray[fileIndexToEdit].text;
  editUI(fileName);
};

const deleteOneFile = (element) => {
  console.log("Removal begins");
  window.event.stopPropagation();
  if (twoClickToTrash && element.id === lastClickId) {
    const indexToDelete = indexedFilesArray.indexOf(element.id) * 1;
    //const fileNameToEdit = filesArray[fileIndexToEdit].name;
    //const fileNameToDelete = filesArray[indexToDelete].name;

    if (fileIndexToEdit != null && fileIndexToEdit >= indexToDelete) {
      if (filesArray[fileIndexToEdit].name == filesArray[indexToDelete].name) {
        defaultMarkers();
        inputLabel.innerHTML = "<div>New</div>";
      } else {
        fileIndexToEdit--;
        //inputLabel.innerHTML = "";
      }
    }

    ol.removeChild(element);
    showItemSortingArrows(ol.childElementCount);

    //trashArray.push(itemsArray[indexToDelete]);
    //deletedCounter.innerText = trashArray.length;
    //restoreItemButton.classList.replace("invisible", "visible");
    //clearTrashButton.classList.replace("invisible", "visible");
    //localStorage.setItem("trash", JSON.stringify(trashArray));

    filesArray.splice(indexToDelete, 1);
    indexedFilesArray.splice(indexToDelete, 1);
    counterFiles--;

    //localStorage.removeItem("items");
    //localStorage.setItem("items", JSON.stringify(itemsArray));
    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem) lastItem.lastChild.lastChild.classList.remove("filter-red");
    lastClickId = element.id;
    element.lastChild.lastChild.classList.add("filter-red");
    lastItem = element;
    twoClickToTrash = true;
  }
  //if (twoClickTrashClear) clearTrashButton.classList.remove("border-red");
  //twoClickTrashClear = false;
};

firstHeaderButton.addEventListener("click", function (e) {
  if (isFoldedView) {
    // Unfolded view
    firstHeaderButton.classList.replace("fold", "unfold");
  } else {
    // Folded view
    firstHeaderButton.classList.replace("unfold", "fold");
  }
  isFoldedView = !isFoldedView;
  e.stopPropagation();
});

const hideTrash = () => {
  if (isItemState && trashArray.length) {
    deletedCounter.innerText = trashArray.length;
    restoreItemButton.classList.replace("invisible", "visible");
    clearTrashButton.classList.replace("invisible", "visible");
  } else {
    restoreItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
  }
};

//-----File state-----
//const hideItemState = () => {
//  defaultItemStateVars();
//};

var phrase = "README.md";

const logFileText = async (file) => {
  const response = await fetch(file);
  const text = await response.text();
  ol.innerHTML = text;
};

function handleFiles(files) {
  Promise.all(
    (function* () {
      for (let file of files) {
        if (!file.type.startsWith("text/markdown")) {
          continue;
        }
        yield new Promise((resolve) => {
          const obj = { name: file.name };
          filesArray.push(obj);
          let reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsText(file);
        });
      }
    })()
  ).then((texts) => {
    texts.map((text) => {
      filesArray[counterFiles].text = text;
      liMaker(filesArray[counterFiles].text, counterFiles);
      indexedFilesArray.push(counterFiles.toString());
      counterFiles++;
    });
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
      handleFiles([file], 0);
    });
  }
}

const handleFilesArray = () => {
  for (let i = 0; i < filesArray.length; i++) {
    liMaker(filesArray[i].text, i);
    indexedFilesArray.push(counterFiles.toString());
    counterFiles++;
  }
};

function initialize() {
  document.body.onfocus = checkIt;

  //console.log("initializing");
}

function checkIt() {
  filesArray[fileIndexToEdit].text = inputGlobal;
  clearInputAndPreviewAreas();
  editedFileElementDOM.firstChild.innerHTML = marked.parse(inputGlobal);
  defaultMarkers();
  scrollToTargetAdjusted(editedFileElementDOM, offsetGlobal);

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

  //console.log(window.location.protocol);

  if (window.location.protocol === "file:") {
    //ol.innerHTML = ``;

    if (!fileElem.files.length) {
      fileElem.click();
    } else {
      handleFilesArray();
    }
    //handleFiles();
    //window.event.stopPropagation();
    //e.preventDefault(); // prevent navigation to "#"
  } else {
    logFileText(phrase);
  }
};

//const fileState = () => {
//  //hideItemState();

//  initializeFileState();
//};

//-----Item state-----
//const hideFileState = () => {
//  ol.innerHTML = "";
//};

const initializeItemState = () => {
  counterItems = 0;
  indexedItemsArray = [];
  saveButton.innerText = "Save item";
  itemsArray =
    localStorage.getItem("items") && JSON.parse(localStorage.getItem("items"));

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

  lastInputValue = localStorage.getItem("last") && localStorage.getItem("last");

  if (lastInputValue) {
    xButton.style = "display:block";
    inputLabel.classList.replace("invisible", "visible");
  } else {
    xButton.style = "display:none";
  }

  input.value = lastInputValue;
  input.scrollTop = input.scrollHeight;
};

//const itemState = () => {
//  //hideFileState();
//  //hideTrash();
//  initializeItemState();
//};

secondHeaderButton.addEventListener("click", function (e) {
  isItemState = !isItemState;
  hideTrash();
  showItemSortingArrows(0);
  twoClickToTrash = false;
  ol.innerHTML = "";
  clearInputAndPreviewAreas();
  if (isItemState) {
    //firstHeaderButton.innerText = "Items";
    secondHeaderButton.innerText = "Items";
    initializeItemState();
    //itemState();
  } else {
    //firstHeaderButton.innerText = "Files";
    secondHeaderButton.innerText = "Files";
    fileElem.setAttribute("webkitdirectory", "true");
    initializeFileState();
    //fileState();
  }
  e.stopPropagation();
});
