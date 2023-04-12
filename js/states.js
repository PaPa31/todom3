const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

//const fileSelect = document.getElementById("fileSelect");
const fileElem = document.getElementById("fileElem");
//const fileList = document.getElementById("fileList");
//const fileSend = document.getElementById("sendFile");

const file = document.querySelector("input[type=file]");

// starting in Item state & Unfolded view
let isFileState = false;
let isFoldedView = false;

let itemsArray = [];
//let filesArray = [];

let nullGotIntoStorage = false;

let counterItems = 0;
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

const liMaker = (text, obj) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
  div.innerHTML = marked.parse(text);
  li.id = counterItems;
  li.appendChild(div);
  ol.appendChild(li);
  //console.log("URL =", url);
  spanMaker(li, obj);
  indexedItemsArray.push(counterItems.toString());
  showItemSortingArrows(ol.childElementCount);
  counterItems++;
};

const spanMaker = (liTag, obj) => {
  const spanTag = document.createElement("div");
  spanTag.setAttribute("id", "item-control");
  liTag.appendChild(spanTag);

  editButtonMaker(spanTag, obj);
  trashButtonMaker(spanTag);
};

const editFile = (obj) => {
  const reader = new FileReader();
  reader.readAsText(file.files[obj]);
  reader.onload = (e) => {
    input.value = e.target.result;
  };
  //input.value = reader.result;
};

const editButtonMaker = (spanTag, obj) => {
  const buttonTag = document.createElement("button");
  buttonTag.setAttribute("class", "edit-item btn");
  if (!isFileState) {
    buttonTag.setAttribute(
      "onclick",
      "editItem(this.parentElement.parentElement)"
    );
  } else {
    //const ur = URL.revokeObjectURL(url);
    //console.log(url);
    buttonTag.setAttribute("onclick", `editFile(${obj})`);
    //buttonTag.setAttribute("onclick", "editFile(obj)");
    //buttonTag.onclick = editItem(text);
  }
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
  //file = file.files;
  console.log(file.files);
  //console.log([file].files);
  if (!this.files.length) {
    ol.innerHTML = "<p>No files selected!</p>";
  } else {
    ol.innerHTML = "";
    //const list = document.createElement("ul");
    //ol.appendChild(list);
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];

      //if (!file.type.startsWith("text/")) {
      //  continue;
      //}

      const reader = new FileReader();
      //const urll = URL.createObjectURL(this.files[i]);
      //console.log(urll);
      //reader.sr;

      //const a = document.createElement("a");
      //a.href = URL.createObjectURL(this.files[i]);
      //const ur = URL.createObjectURL(this.files[i]);

      //reader.addEventListener(
      //  "load",
      //  () => {
      //    liMaker(reader.result, );
      //  },
      //  false
      //);

      reader.onload = (e) => {
        //const urr = URL.revokeObjectURL(ur);
        //console.log(urr);
        //console.log(URL.createObjectURL(this.files[i]));
        //console.log(URL.createObjectURL(e.target.result));
        //console.log(URL.createObjectURL(reader.result));
        liMaker(e.target.result, i);
        //URL.revokeObjectURL(reader.result);
        //URL.revokeObjectURL(this.files[i]);
      };

      //if (this.files[i]) {
      //  reader.readAsText(this.files[i]);
      //}

      reader.readAsText(file);

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

  nullGotIntoStorage = false;

  itemsArray?.forEach((item, key) => {
    if (item) {
      liMaker(item);
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
