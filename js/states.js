const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

//const fileSelect = document.getElementById("fileSelect");
let fileElem = document.getElementById("fileElem");
console.log(fileElem);
//fileElem.files = FileList[];
//const fileList = document.getElementById("fileList");
//const fileSend = document.getElementById("sendFile");

//const file = document.querySelector("input[type=file]");

// starting in File state & Unfolded view
let isFileState = true;
let isFoldedView = false;

let itemsArray = [];
//let filesArray = [];

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

let indexToEdit;
let editedItem;

let editedFile;

const liMaker = (text, count, obj) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = count;
  li.appendChild(div);
  ol.appendChild(li);
  //console.log("URL =", url);
  spanMaker(li, obj);
  showItemSortingArrows(ol.childElementCount);
};

const spanMaker = (liTag, obj) => {
  const spanTag = document.createElement("div");
  spanTag.setAttribute("id", "item-control");
  liTag.appendChild(spanTag);

  editButtonMaker(spanTag, obj);
  trashButtonMaker(spanTag);
};

const editButtonMaker = (spanTag, obj) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "edit-item btn");
  if (isFileState) {
    buttonTag.setAttribute(
      "onclick",
      "editItem(this.parentElement.parentElement)"
    );
  } else {
    buttonTag.setAttribute("onclick", `editFile(${obj})`);
  }
  buttonTag.setAttribute("title", "Edit item");

  spanTag.appendChild(buttonTag);
};

const editFile = (obj) => {
  window.event.stopPropagation();
  const reader = new FileReader();
  reader.readAsText(fileElem.files[obj]);
  reader.onload = (e) => {
    input.value = e.target.result;
  };
  //input.value = reader.result;
  editUI(fileElem.files[obj].name);
};

const trashButtonMaker = (liTag) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "delete-one-item btn");
  buttonTag.setAttribute(
    "onclick",
    "deleteOneItem(this.parentElement.parentElement)"
  );
  buttonTag.setAttribute("title", "Double-click to move to Trash");

  liTag.appendChild(buttonTag);
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
  if (isFileState && trashArray.length) {
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
  console.log(fileElem.files);
  if (!fileElem.files.length) {
    ol.innerHTML = "<p>No files selected!</p>";
  } else {
    ol.innerHTML = "";
    for (let i = 0; i < fileElem.files.length; i++) {
      const file = fileElem.files[i];

      //if (!file.type.startsWith("text/")) {
      //  continue;
      //}

      const reader = new FileReader();
      reader.onload = (e) => {
        liMaker(e.target.result, i, i);
        counterFiles++;
      };
      reader.readAsText(file);
    }
  }
}

fileElem.addEventListener("click", function (e) {
  e.stopPropagation();
});

fileElem.addEventListener("change", handleFiles, false);

const initializeFileState = () => {
  ol.innerHTML = "";
  counterFiles = 0;

  console.log(window.location.protocol);

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
  isFileState = !isFileState;
  hideTrash();
  showItemSortingArrows(0);
  if (isFileState) {
    firstHeaderButton.innerText = "Items";
    secondHeaderButton.innerText = "Files";
    initializeItemState();
    //itemState();
  } else {
    firstHeaderButton.innerText = "Files";
    secondHeaderButton.innerText = "Items";
    initializeFileState();
    //fileState();
  }
  e.stopPropagation();
});
