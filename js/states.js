const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

//const fileSelect = document.getElementById("fileSelect");
const fileElem = document.getElementById("fileElem");
//const fileList = document.getElementById("fileList");
//fileSend = document.getElementById("sendFile");

// starting in Item state & Unfolded view
let isFileState = false;
let isFoldedView = false;

let itemsArray = [];

let nullInItemsStorage = false;

let counterItems = 0;
// lightweight array to avoid redundant logic and waste of resources
let indexedItemsArray = [];

let twoClickToTrash = false;
let twoClickTrashClear = false;

let lastClickId;
let lastItem;
let lastInputValue = "";

let indexToEdit;
let editedItem;

const liMaker = (text) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counterItems;
  li.appendChild(div);
  ol.appendChild(li);
  spanMaker(li);
  indexedItemsArray.push(counterItems.toString());
  showItemSortingArrows(ol.childElementCount);
  counterItems++;
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
  buttonTag.setAttribute(
    "onclick",
    "editItem(this.parentElement.parentElement)"
  );
  buttonTag.setAttribute("title", "Edit item");

  spanTag.appendChild(buttonTag);
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
const hideItemState = () => {
  defaultItemStateVars();
};

var phrase = "README.md";

const logFileText = async (file) => {
  const response = await fetch(file);
  const text = await response.text();
  ol.innerHTML = text;
};

function handleFiles() {
  const [file] = document.querySelector("input[type=file]").files;

  if (!this.files.length) {
    ol.innerHTML = "<p>No files selected!</p>";
  } else {
    ol.innerHTML = "";
    //const list = document.createElement("ul");
    //ol.appendChild(list);
    for (let i = 0; i < this.files.length; i++) {
      const reader = new FileReader();

      reader.addEventListener(
        "load",
        () => {
          // this will then display a text file
          //const li = document.createElement("li");
          //li.innerText = reader.result;
          //ol.appendChild(li);
          liMaker(reader.result);
        },
        false
      );

      if (this.files[i]) {
        reader.readAsText(this.files[i]);
      }

      //const img = document.createElement("img");
      //img.src = URL.createObjectURL(this.files[i]);
      //img.height = 60;
      //img.onload = () => {
      //  URL.revokeObjectURL(img.src);
      //};
      //li.appendChild(img);
      //const info = document.createElement("span");
      //info.innerHTML = `${this.files[i].name}: ${this.files[i].size} bytes`;
      //li.appendChild(info);
    }
  }
}

fileElem.addEventListener("change", handleFiles, false);

const initializeFileState = () => {
  ol.innerHTML = "";

  console.log(window.location.protocol);

  if (window.location.protocol === "file:") {
    ol.innerHTML = ``;

    if (fileElem) {
      fileElem.click();
    }
    //e.preventDefault(); // prevent navigation to "#"
  } else {
    logFileText(phrase);
  }
};

const fileState = () => {
  hideItemState();
  hideTrash();
  initializeFileState();
};

//-----Item state-----
const hideFileState = () => {
  ol.innerHTML = "";
};

const initializeItemState = () => {
  itemsArray =
    localStorage.getItem("items") && JSON.parse(localStorage.getItem("items"));

  lastInputValue = localStorage.getItem("last") && localStorage.getItem("last");

  nullInItemsStorage = false;

  itemsArray?.forEach((item, key) => {
    if (item) {
      liMaker(item);
    } else {
      itemsArray.splice(key, 1);
      nullInItemsStorage = true;
      console.log(`items: ${key} item is null and ignored!`);
    }
  });

  if (nullInItemsStorage) {
    localStorage.setItem("items", JSON.stringify(itemsArray));
  }

  if (lastInputValue) {
    xButton.style = "display:block";
    inputLabel.classList.replace("invisible", "visible");
  } else {
    xButton.style = "display:none";
  }

  input.value = lastInputValue;
  input.scrollTop = input.scrollHeight;
};

const itemState = () => {
  hideFileState();
  hideTrash();
  initializeItemState();
};

secondHeaderButton.addEventListener("click", function (e) {
  if (isFileState) {
    firstHeaderButton.innerText = "Items";
    secondHeaderButton.innerText = "Files";
    itemState();
  } else {
    firstHeaderButton.innerText = "Files";
    secondHeaderButton.innerText = "Items";
    fileState();
  }
  isFileState = !isFileState;
});
