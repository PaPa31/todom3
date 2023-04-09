const firstHeaderButton = document.getElementById("first-header");
const secondHeaderButton = document.getElementById("second-header");

// starting in Item state & Unfolded view
let isFileState = false;
let isFoldedView = false;

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

//-----File state-----
const hideItemState = () => {
  defaultItemStateVars();
};

function FileUpload(img, file) {
  const reader = new FileReader();
  this.ctrl = createThrobber(img);
  const xhr = new XMLHttpRequest();
  this.xhr = xhr;

  const self = this;
  this.xhr.upload.addEventListener(
    "progress",
    (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded * 100) / e.total);
        self.ctrl.update(percentage);
      }
    },
    false
  );

  xhr.upload.addEventListener(
    "load",
    (e) => {
      self.ctrl.update(100);
      const canvas = self.ctrl.ctx.canvas;
      canvas.parentNode.removeChild(canvas);
    },
    false
  );
  xhr.open(
    "POST",
    "http://demos.hacks.mozilla.org/paul/demos/resources/webservices/devnull.php"
  );
  xhr.overrideMimeType("text/plain; charset=x-user-defined-binary");
  reader.onload = (evt) => {
    xhr.send(evt.target.result);
  };
  reader.readAsBinaryString(file);
}

function createThrobber(img) {
  const throbberWidth = 64;
  const throbberHeight = 6;
  const throbber = document.createElement("canvas");
  throbber.classList.add("upload-progress");
  throbber.setAttribute("width", throbberWidth);
  throbber.setAttribute("height", throbberHeight);
  img.parentNode.appendChild(throbber);
  throbber.ctx = throbber.getContext("2d");
  throbber.ctx.fillStyle = "orange";
  throbber.update = (percent) => {
    throbber.ctx.fillRect(
      0,
      0,
      (throbberWidth * percent) / 100,
      throbberHeight
    );
    if (percent === 100) {
      throbber.ctx.fillStyle = "green";
    }
  };
  throbber.update(0);
  return throbber;
}

function previewFile() {
  //const content = document.querySelector(".content");
  //const [file] = document.querySelector("input[type=file]").files;
  const reader = new FileReader(phrase);

  console.log("hi");

  ol.innerHTML = reader.result;

  reader.addEventListener(
    "load",
    () => {
      // this will then display a text file
      ol.innerText = reader.result;
    },
    false
  );

  //if (file) {
  //  reader.readAsText(file);
  //}

  reader.readAsText(phrase);
}

function previewFile2(file) {
  console.log("hi2");
  var reader = new FileReader();

  reader.onloadend = function () {
    console.log(reader.result); //this is an ArrayBuffer
  };
  reader.readAsText(file);
}

function loadFile(url, callback) {
  //progressCallback,

  var xhr = null;
  if (window.XMLHttpRequest) {
    try {
      xhr = new XMLHttpRequest();
    } catch (e) {}
  } else if (window.ActiveXObject) {
    try {
      xhr = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {}
    }
  }

  if (xhr) {
    xhr.open("GET", url, true);
    if (url.split(".").pop() == "mp3" || url.split(".").pop() == "ogg") {
      xhr.responseType = "arraybuffer";
    }
    xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");

    xhr.onreadystatechange = function () {
      try {
        if (xhr.readyState === 4) {
          var status = xhr.status;
          if ((status >= 200 && status < 300) || status === 304) {
            callback(xhr.response);

            delete xhr;
            xhr = null;
          } else {
            //document.getElementById("progress").innerHTML = '';
            //alert(url+" не удалось получить данные:\n"+ xhr.status);
          }
        }
      } catch (e) {
        //alert(' ошибка: '+ e.description );
      }
    };

    //			  xhr.onprogress = function(e) {
    //
    //				  if(e.lengthComputable) {
    //					  var done = e.position || e.loaded, total = e.totalSize || e.total;
    //
    //					  progressCallback( done*100/total );
    //				  }
    //			  };

    xhr.send();
  }
  return xhr;
}

function loadFile2(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "blob";
  request.onload = function () {
    var reader = new FileReader();
    reader.readAsDataURL(request.response);
    reader.onload = function (e) {
      console.log("DataURL:", e.target.result);
    };
  };
  request.send();
}

function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        var allText = rawFile.responseText;
        ol.innerHTML = allText;
      }
    }
  };
  rawFile.send(null);
}

var _getAllFilesFromFolder = function (dir) {
  var filesystem = fs;
  var results = [];

  filesystem.readdirSync(dir).forEach(function (file) {
    file = dir + "/" + file;
    var stat = filesystem.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(_getAllFilesFromFolder(file));
    } else results.push(file);
  });

  return results;
};

//_getAllFilesFromFolder("README.md");

var phrase = "README.md";

previewFile();

//loadFile2(phrase);
//readTextFile("demo.txt");

//var requestPhrase = readTextFile(phrase, function () {
//  ol.innerHTML = requestPhrase.responseText;
//});

//const logFileText = async (file) => {
//  const response = await fetch(file);
//  const text = await response.text();
//  console.log(text);
//};

//logFileText(phrase);

async function loadText(url) {
  text = await fetch(url);
  //awaits for text.text() prop
  //and then sends it to readText()
  readText(await text.text());
}

function readText(text) {
  //here you can continue with your JS normal logic
  console.log(text);
}

//loadText("/md/README.md");

//var requestPhrase = loadFile(phrase, function () {
//  ol.innerHTML = requestPhrase.responseText;
//});

//var requestPhrase = loadFile2(phrase);
//ol.innerHTML = requestPhrase;

//previewFile(phrase);

const initializeFileState = () => {
  ol.innerHTML = `
      <input
      type="file"
      id="fileElem"
      multiple
      accept="md/*"
      style="display:none" />
    <a href="#" id="fileSelect">Select some files</a>
    <div id="fileList">
      <p>No files selected!</p>
    </div>
    <p class="content"></p>
  `;
  //<button id="sendFile">Send</button>;
  //<iframe id="viewer"></iframe>;

  const fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem"),
    fileList = document.getElementById("fileList");
  //fileSend = document.getElementById("sendFile");

  fileSelect.addEventListener(
    "click",
    (e) => {
      if (fileElem) {
        fileElem.click();
      }
      e.preventDefault(); // prevent navigation to "#"
    },
    false
  );

  //fileElem.addEventListener("change", handleFiles, false);

  fileElem.addEventListener("change", previewFile, false);

  //fileElem.addEventListener("change", previewFile2(phrase), false);

  //fileSend.addEventListener("click", sendFiles, false);

  function handleFiles() {
    if (!this.files.length) {
      fileList.innerHTML = "<p>No files selected!</p>";
    } else {
      fileList.innerHTML = "";
      const list = document.createElement("ul");
      fileList.appendChild(list);
      for (let i = 0; i < this.files.length; i++) {
        const li = document.createElement("li");
        list.appendChild(li);

        const reader = new FileReader();

        const img = document.createElement("img");
        img.src = URL.createObjectURL(this.files[i]);
        img.height = 60;
        img.onload = () => {
          URL.revokeObjectURL(img.src);
        };
        li.appendChild(img);
        const info = document.createElement("span");
        info.innerHTML = `${this.files[i].name}: ${this.files[i].size} bytes`;
        li.appendChild(info);
      }
    }
  }

  function sendFiles() {
    console.log("hi");
    const imgs = document.querySelectorAll(".obj");

    for (let i = 0; i < imgs.length; i++) {
      new FileUpload(imgs[i], imgs[i].file);
    }
  }
};

const fileState = () => {
  hideItemState();
  initializeFileState();
};

//-----Item state-----
const hideFileState = () => {
  ol.innerHTML = "";
};

const initializeItemState = () => {};

const itemState = () => {
  hideFileState();
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
