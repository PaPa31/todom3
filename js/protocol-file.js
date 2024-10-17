//alert('file:')

let fileElem = document.getElementById("file-elem");
// emptying the FileList
fileElem.value = null;

// ------------------  from states.js  -------------------

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

  updateUI();

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

function fileProtocolOpenDirectoryClick() {
  fileElem.click();
}

function webKitDirToTrue() {
  fileElem.setAttribute("webkitdirectory", "true");
}

function webKitDirRemove() {
  fileElem.removeAttribute("webkitdirectory");
}

function nullFileElem() {
  fileElem.value = null;
}
