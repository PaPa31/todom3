//let firstEmptyPosition = false;

const addLastChildClass = (el) => {
  logIn1("1 addLastChildClass", el);
  preview.firstChild.classList.contains("first-child-lb") &&
    preview.removeChild(preview.firstElementChild);
  //preview.firstChild.classList.remove("first-child-lb");
  position.classList.remove("last-child-lb");
  el.classList.remove("last-child");
  el.classList.remove("last-child-rb");
  el.classList.remove("last-child-lb");
  //el.classList.add("last-child");
  const tagName = el.tagName.toLowerCase();
  if (variant) {
    switch (tagName) {
      case "code": {
        if (el.parentElement.tagName.toLowerCase() === "pre") {
          logg1("rb");
          el.classList.add("last-child-rb");
          break;
        }
      }
      default: {
        logg1("underline");
        el.classList.add("last-child");
      }
    }
  } else {
    logg1("lb");
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
  logOut1();
};

const findLastChild = (child) => {
  logIn6("1 findLastChild", child);
  if (child.nextSibling && child.nextSibling.textContent != "\n") {
    logg6(
      "f1.1",
      "child.nextSibling.textContent=",
      child.nextSibling.textContent
    );
    logg6(Array.from(child.parentElement.childNodes));

    //Array.from(document.querySelector("#title").childNodes).find(
    //  (n) => n.nodeType == Node.TEXT_NODE
    //).textContent;

    if (child.nextSibling.classList) {
      logg6("f1.1.1", "next sibling is block");
      logg6("nextSibling = ", child.nextSibling);
      addLastChildClass(child.nextSibling);
    } else {
      logg6("f1.1.2", "next sibling is text");
      logg6("parent = ", child.parentElement);
      addLastChildClass(child.parentElement);
    }
  } else {
    if (
      child.tagName.toLowerCase() === "code" &&
      child.parentElement.tagName.toLowerCase() !== "pre"
    ) {
      logg6("f1.2.a parent =", child.parentElement);
      addLastChildClass(child.parentElement);
    } else {
      logg6("f1.2.b child =", child);
      addLastChildClass(child);
    }
  }
  logOut6();
};

const lastChildRecursive = (child) => {
  if (child.lastElementChild) {
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
    elHTML.innerHTML += "<br/>&nbsp;";
  }
};

const strToPreview = () => {
  let head = input.value.substr(0, input.selectionStart);
  //let head2 = head;
  head = head.replace(/(\n*) *#+ *$/, "$1");
  head = head.replace(/^[\n ]+/, "");

  logIn("1 strToPreview", "last 2 head:", head.slice(-2) + ";;;");

  //logg("head.length =", head.length);
  //logg("last 2 head:", head.slice(-2) + ";;;");
  //console.log("head=", head + ";;;");

  output.value = head;
  output.scrollTop = output.scrollHeight;

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

  //logg("headLastNewLine:", headLastNewLine);
  //logg("tailLastNewLine:", tailLastNewLine);

  let stringToPreview = "";
  if (head.length) {
    firstEmptyPosition = false;
    //if (tailLastNewLine == 0) {
    //  stringToPreview = input.value;
    //} else {
    if (head.slice(-2) == "\n\n") {
      stringToPreview = head;
      if (tailLastNewLine == 0) {
        logg("s1.2.0");
        // add second and more new line
        head = head.replace(/\n+$/, "");
        stringToPreview = head + "\\\n`\x001`";
        position.innerHTML = markdown(stringToPreview);
        variant = false;
        lastSeven(preview);
      } else {
        if (tail[1] == "\n") {
          logg("s1.2.1");
          // two or more \n
          //head = head.replace(/\\*\n*$/, "");
          head = head.replace(/\n{2,}/, "\n");
          logg("headDD =", head + ";;;;;");
          stringToPreview = head + "\\\n`\x001`";
          position.innerHTML = markdown(stringToPreview);
          variant = false;
          //lastSeven(preview);
        } else {
          //const splitTail = tail.split("\n");
          //logg(splitTail);
          //stringToPreview = splitTail[0] !== "" ? splitTail[0] : splitTail[1];
          //stringToPreview = stringToPreview.replace(/^(\#+)*.*/, "$1");
          //logg("stringToPreview=", stringToPreview);
          //stringToPreview = head + stringToPreview + " \x001";
          if (head.slice(-2) === "\n\n") {
            // headers first # pos
            logg("s1.2.2_1");
            const splitTail = tail.split("\n");
            logg(splitTail);
            const firstString = splitTail.find((s) => {
              if (s !== "") return s;
            });
            logg("firstString=", firstString);
            stringToPreview = firstString.replace(/^(\#+)*.*/, "$1");
            logg("stringToPreview=", stringToPreview);
            stringToPreview = head + stringToPreview + " \x001";
          } else {
            logg("s1.2.2_2");
            stringToPreview = head + " \x001";
          }

          //logg("stringToPreview=", stringToPreview);
          //if (stringToPreview.length > 80) {
          //logg("s1.2.2.i");
          //head = head.replace(/\n*$/, "");
          //stringToPreview = head + tail.slice(0, 2) + " \x001";

          position.innerHTML = markdown(stringToPreview);
          variant = false;
          //lastSeven(preview);
          //} else {
          //  logg("s1.2.2.ii");
          //  position.innerHTML = markdown(stringToPreview);
          //  variant = false;
          //}
        }
      }
    } else {
      if (tail == "\n") {
        if (tailLastNewLine == 0) {
          logg("s2.1.1");
          // add new line
          stringToPreview = head + "\\\n`\x001`";
          position.innerHTML = markdown(stringToPreview);
          variant = false;
          lastSeven(preview);
        } else {
          logg("s2.1.2");
        }
      } else {
        if (tail[0] == "\n") {
          stringToPreview = head + "\n";
          //lastSeven(preview);
          if (tail.slice(0, 2) === "\n\n" && head.slice(-1) === "\n") {
            logg("s2.2.1.1");
            head = head.replace(/\\*\n*$/, "");
            stringToPreview = head + "\\\n`\x001`";
            position.innerHTML = markdown(stringToPreview);
            variant = false;
            //lastSeven(preview);
          } else {
            // without new line in the top
            if (head.slice(-1) === "\n") {
              if (head.slice(-2) === "\\\n") {
                logg("s2.2.1.2.a.1");
                head = head.replace(/\\\n$/, "");
                stringToPreview = head + "\\\n`\x001`";
                position.innerHTML = markdown(stringToPreview);
                variant = false;
                //lastSeven(preview);
              } else {
                // first pos in block after Header
                logg("s2.2.1.2.a.2");
                stringToPreview = head + tail[0];
                position.innerHTML = markdown(stringToPreview);
                variant = false;
                //lastSeven(preview);
              }
            } else {
              // last position after code block
              // inside text block
              // header names
              logg("s2.2.1.2.b");
            }
          }
        } else {
          // last position after text block

          if (head.slice(-1) === "\n") {
            // empty line after Header
            logg("s2.2.2.a");
            head = head.replace(/\\*\n*$/, "");
            logg("headDD after =", head + ";;;;;");
            stringToPreview = head + "\\\n`\x001`";
            position.innerHTML = markdown(stringToPreview);
            variant = false;
            //stringToPreview = headLastNewLine == 0 ? head : head + "\n";
            //lastSeven(preview);
          } else {
            // inside text block
            logg("s2.2.2.b");
            stringToPreview = head + "\n";
          }
        }
        //if (tail.slice(-2) == "\n\n") {
        //  logg("s2.2.1");
        //  stringToPreview = head + "\n";
        //  lastSeven(preview);
        //} else {
        //  logg("s2.2.2");
        //  stringToPreview = headLastNewLine == 0 ? head : head + "\n";
        //  lastSeven(preview);
        //}
      }
    }
    stringToPreview = stringToPreview.replace(/\n{2,}$/, "\n\x001\n");
    //}
  } else {
    // first position
    logg("s0");
    //if (tail[0] === "\n") {
    //  firstEmptyPosition = true;
    //} else {
    //  firstEmptyPosition = false;
    //}

    const splitTail = tail.split("\n");
    logg(splitTail);
    const firstString = splitTail.find((s) => {
      if (s !== "") return s;
    });
    logg("firstString=", firstString);
    //stringToPreview = splitTail[0] !== "" ? splitTail[0] : splitTail[1];
    stringToPreview = firstString.replace(/^(\#+)*.*/, "$1");
    //stringToPreview = head !== "" ? head : "\x001";
    stringToPreview = stringToPreview + " `\x001`";
    logg("stringToPreview=", stringToPreview);

    //stringToPreview = tail[0];
    position.innerHTML = markdown(stringToPreview);
    variant = false;
    //lastSeven(preview);
    //const el0 = document.createElement("div");
    //el0.classList.add("first-child-lb");
    //el0.innerText = " \n";
    //!preview.firstChild.classList.contains("first-child-lb") &&
    //  preview.insertBefore(el0, preview.firstChild);

    //if (!firstEmptyPosition) {
    //headAndTail = head + tail;
    //logg(headAndTail);
    //preview.innerHTML = markdown(headAndTail);
    //preview.innerHTML = markdown(input.value);
    //}
  }

  if (variant) position.innerHTML = markdown(stringToPreview);
  //if (!firstEmptyPosition)

  lastChildRecursive(position);
  //if (tailLastNewLine == 0) preview.innerHTML = position.innerHTML;
  logOut();
};

const lastNewLine = function (str) {
  let caret = str.length - 1;
  const currentSymbolWidth = caret;
  let sym = str[caret];

  while (sym != "\n" && currentSymbolWidth - caret < 80 && caret > 0) {
    caret--;
    sym = str[caret];
  }
  return caret;
};

const syncPreview = function () {
  strToPreview();
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
  var showLogg1 = true; // logg1 - 'lb, rb, or underline'
  var showLogg2 = false; // logg2 -
  var showLogg3 = false; // logg3 -
  var showLogg4 = false; // logg4 -
  var showLogg5 = false; // logg5 -
  var showLogg6 = true; // logg6 -

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
  // 'lb, rb, or underline'
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
