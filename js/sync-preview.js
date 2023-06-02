const addLastChildClass = (el) => {
  el.classList.remove("last-child");
  el.classList.remove("last-child-rb");
  el.classList.remove("last-child-lb");
  //el.classList.add("last-child");
  const tagName = el.tagName.toLowerCase();
  if (variant) {
    console.log("c1");
    switch (tagName) {
      case "code": {
        el.classList.add("last-child-rb");
        break;
      }
      default: {
        el.classList.add("last-child");
      }
    }
  } else {
    console.log("c2");
    el.classList.add("last-child-lb");
    variant = true;
  }
  //if (
  //  el.tagName.toLowerCase() === "p" &&
  //  el.parentElement.tagName.toLowerCase() === "li"
  //) {
  //  el.parentElement.classList.add("last-child");
  //} else {
  //  el.classList.add("last-child");
  //}
};

const findLastChild = (child) => {
  console.log("r2 child.nextElementSibling=", child.nextElementSibling);
  if (child.nextSibling && child.nextSibling.textContent != "\n") {
    console.log(
      "r2.1 child.nextSibling.textContent=",
      child.nextSibling.textContent
    );
    console.log(Array.from(child.parentElement.childNodes));

    //Array.from(document.querySelector("#title").childNodes).find(
    //  (n) => n.nodeType == Node.TEXT_NODE
    //).textContent;

    if (child.nextSibling.classList) {
      console.log("r2.1.1");
      addLastChildClass(child.nextSibling);
    } else {
      console.log("r2.1.2");
      addLastChildClass(child.parentElement);
    }
  } else {
    console.log("r2.2");
    addLastChildClass(child);
  }
};

const lastChildRecursive = (child) => {
  if (child.lastElementChild) {
    console.log("r1");
    lastChildRecursive(child.lastElementChild);
    return;
  } else {
    findLastChild(child);
  }
};

const lastSeven = (el) => {
  let elHTML;
  if (preview.lastElementChild.tagName.toLowerCase() === "pre") {
    elHTML = preview;
  } else {
    elHTML = preview.lastElementChild;
  }
  if (elHTML.innerHTML.slice(-7) !== ">&nbsp;") {
    //elHTML.innerHTML += "<br/>&nbsp;";
  }
};

const lastNewLine = function (str) {
  logIn("1 lastNewLine", str);
  let caret = str.length - 1;
  const currentSymbolWidth = caret;
  let sym = str[caret];

  while (sym != "\n" && currentSymbolWidth - caret < 80 && caret > 0) {
    caret--;
    sym = str[caret];
  }
  logOut("caret=", caret);
  return caret;
};

const strToPreview = (head) => {
  const headLastNewLine = lastNewLine(head);
  const endHead = headLastNewLine != -1 ? headLastNewLine : head.length;
  const tail = input.value.substr(endHead, input.value.length);
  const tailLastNewLine = lastNewLine(tail);
  //console.log("head:", headLastNewLine);
  //console.log("tail:", tailLastNewLine);
  //console.log("last head:", head.slice(-1).charCodeAt());
  //console.log("first tail:", tail.charCodeAt());

  //console.log("last head:", head.slice(-1) + ";;;");
  logg("first 2 tail:", tail.slice(0, 2) + ";;;");

  //console.log("tail=", tail + ";;;");
  //console.log("tail[1]=", tail[1] + ";;;");

  logg("headLastNewLine:", headLastNewLine);
  logg("tailLastNewLine:", tailLastNewLine);

  let stringToPreview = "";
  if (head.length) {
    console.log("s");
    //if (tailLastNewLine == 0) {
    //  stringToPreview = input.value;
    //} else {
    if (head.slice(-2) == "\n\n") {
      console.log("s1");
      stringToPreview = head;
      if (tailLastNewLine == 0) {
        console.log("s1.1");
        lastSeven(preview);
      } else {
        console.log("s1.2");
        if (tail[1] == "\n") {
          console.log("s1.2.1");
          lastSeven(preview);
        } else {
          console.log("s1.2.2");
          const splitTail = tail.split("\n");
          const notEmpty = splitTail[0] !== "" ? splitTail[0] : splitTail[1];
          stringToPreview = head + notEmpty;
          position.innerHTML = markdown(stringToPreview);
          variant = false;
        }
      }
    } else {
      console.log("s2");
      if (tail == "\n") {
        console.log("s2.1");
        if (tailLastNewLine == 0) {
          console.log("s2.1.1");
          stringToPreview = head + "\n";
          lastSeven(preview);
        } else {
          console.log("s2.1.2");
        }
      } else {
        console.log("s2.2");
        if (tail[0] == "\n") {
          console.log("s2.2.1");
          stringToPreview = head + "\n";
          lastSeven(preview);
        } else {
          console.log("s2.2.2");
          stringToPreview = headLastNewLine == 0 ? head : head + "\n";
          lastSeven(preview);
        }
        //if (tail.slice(-2) == "\n\n") {
        //  console.log("s2.2.1");
        //  stringToPreview = head + "\n";
        //  lastSeven(preview);
        //} else {
        //  console.log("s2.2.2");
        //  stringToPreview = headLastNewLine == 0 ? head : head + "\n";
        //  lastSeven(preview);
        //}
      }
    }
    stringToPreview = stringToPreview.replace(/\n{2,}$/, "\n\x001\n");
    //}
  } else {
    console.log("s0");
    const splitTail = tail.split("\n");
    console.log(splitTail);
    stringToPreview = splitTail[0];
    console.log(stringToPreview);
    position.innerHTML = markdown(stringToPreview);
    variant = false;
  }

  if (variant) position.innerHTML = markdown(stringToPreview);
  lastChildRecursive(position);
  //if (tailLastNewLine == 0) preview.innerHTML = position.innerHTML;
};

const syncPreview = function () {
  logIn("0 update");
  let head = input.value.substr(0, input.selectionStart);

  head = head.replace(/(\n*) *#+ *$/, "$1");

  logg("head.length =", head.length);
  logg("last 2 head:", head.slice(-2) + ";;;");
  //console.log("head=", head + ";;;");

  output.value = head;
  output.scrollTop = output.scrollHeight;

  strToPreview(head);

  const scrollTop = position.scrollHeight;
  position.scrollTop = scrollTop;
  preview.scrollTop = position.scrollTop;
};

input.addEventListener("keyup", debounce(syncPreview, 150, false));
input.addEventListener("mouseup", debounce(syncPreview, 150, false));
//position.addEventListener("scroll", debounce(update, 150, false));

// loggs system
if (true) {
  // Assistant for debugging errors.
  // ~~View active elements DOM,~~
  // ~~when navigation by TOC menu items.~~

  // For production - delete this block and loggs.
  // To delete all loggs use regex:^ *log.*$\n*

  // managing vars
  // change to show/hide output loggs
  var showLogg = true; // logg - 'sync-preview'
  var showLogg1 = false; // logg1 -
  var showLogg2 = false; // logg2 -
  var showLogg3 = false; // logg3 -
  var showLogg4 = false; // logg4 -
  var showLogg5 = false; // logg5 -
  var showLogg6 = false; // logg6 -

  // loggs subsystem 0
  // 'sync-preview'
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
  // ''
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
  // ''
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
  // ''
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
  // ''
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
