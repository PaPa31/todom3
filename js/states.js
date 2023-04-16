const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

//const fileSelect = document.getElementById("fileSelect");
let fileElem = document.getElementById("fileElem");
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
//let indexedFilesArray = [];

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
  fileIndexToEdit = element.id;
  const fileName = fileElem.files[fileIndexToEdit].name;
  console.log("editedFileElementDOM:", editedFileElementDOM);
  //const reader = new FileReader();
  //reader.readAsText(fileElem.files[element.id]);
  //reader.onload = (e) => {
  //  input.value = e.target.result;
  //};
  //input.value = reader.result;
  input.value = filesArray[fileIndexToEdit];
  editUI(fileName);
};

const deleteOneFile = (element) => {
  console.log("Removal begins");
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

function handleFiles() {
  //console.log(fileElem.files);
  if (!fileElem.files.length) {
    ol.innerHTML = "<p>No files selected!</p>";
  } else {
    ol.innerHTML = "";
    for (let i = 0; i < fileElem.files.length; i++) {
      const file = fileElem.files[i];

      //console.log(file.type);

      if (!file.type.startsWith("text/markdown")) {
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        filesArray[i] = e.target.result;
        liMaker(e.target.result, i);
        counterFiles++;
      };
      reader.readAsText(file);
    }
  }
}

function initialize() {
  document.body.onfocus = checkIt;
  console.log("initializing");
}

function checkIt() {
  filesArray[fileIndexToEdit] = inputGlobal;
  editedFileElementDOM.firstChild.innerHTML = marked.parse(inputGlobal);
  defaultMarkers();
  scrollToTargetAdjusted(editedFileElementDOM, offsetGlobal);

  document.body.onfocus = null;
  console.log("checked");
}

fileElem.addEventListener("click", function (e) {
  //initialize();
  e.stopPropagation();
});

fileElem.addEventListener("change", handleFiles, false);

const initializeFileState = () => {
  ol.innerHTML = "";
  counterFiles = 0;

  //console.log(window.location.protocol);

  if (window.location.protocol === "file:") {
    //ol.innerHTML = ``;

    if (!fileElem.files.length) {
      fileElem.click();
    } else {
      handleFiles();
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
  ol.innerHTML = "";
  counterItems = 0;
  indexedItemsArray = [];
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
  if (isItemState) {
    //firstHeaderButton.innerText = "Items";
    secondHeaderButton.innerText = "Items";
    initializeItemState();
    //itemState();
  } else {
    //firstHeaderButton.innerText = "Files";
    secondHeaderButton.innerText = "Files";
    initializeFileState();
    //fileState();
  }
  e.stopPropagation();
});
