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

function checkIt() {
  //console.log("start checking");
  drawFile();
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
