const whatClass = (el) => {
  logIn1("whatClass", el);
  preview.firstChild &&
    preview.firstChild.classList.contains("first-child-lb") &&
    preview.removeChild(preview.firstElementChild);
  //preview.firstChild.classList.remove("first-child-lb");
  position.classList.remove("last-child", "last-child-lb");
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
      case "cite": {
        logg1("rb");
        el.classList.add("last-child-rb");
        break;
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

const whatElement = (child) => {
  logIn6("whatElement", child);
  if (child.nextSibling && child.nextSibling.textContent != "\n") {
    logg6(
      "f1.1",
      "child.nextSibling.textContent=",
      JSON.stringify(child.nextSibling.textContent)
    );
    logg6(Array.from(child.parentElement.childNodes));

    //Array.from(document.querySelector("#title").childNodes).find(
    //  (n) => n.nodeType == Node.TEXT_NODE
    //).textContent;

    if (child.nextSibling.classList) {
      logg6("f1.1.1", "next sibling is block");
      logg6("nextSibling = ", child.nextSibling);
      whatClass(child.nextSibling);
    } else {
      logg6("f1.1.2", "next sibling is text");
      logg6("parent = ", child.parentElement);
      whatClass(child.parentElement);
    }
  } else {
    switch (child.tagName.toLowerCase()) {
      case "a":
      case "code":
        if (child.parentElement.tagName.toLowerCase() !== "pre") {
          logg6("f1.2.a parent =", child.parentElement);
          whatClass(child.parentElement);
          break;
        }
      default: {
        logg6("f1.2.b child =", child);
        whatClass(child);
      }
    }
  }
  logOut6();
};

const lastChildRecursive = (child) => {
  if (child.lastElementChild) {
    lastChildRecursive(child.lastElementChild);
    return;
  } else {
    whatElement(child);
  }
};

const firstStr = (tail) => {
  const splitTail = tail.split("\n");
  const firstString = splitTail.find((s) => s !== "");
  return firstString;
};

const outsideCodeBlock = (head) => {
  const re = /\s*```.*/g;
  const match = head.match(re);
  const isOutsideCodeBlock = match ? match.length % 2 === 0 : true;
  return isOutsideCodeBlock;
};

const checkStartLine = (head, tail, pigTail, pigBody, _string) => {
  let stringToPreview = "";
  //look for specSymbols [#,\d.,-,>, ]
  //at the begining of the stri
  const regex =
    /(^ *#{1,6} *(?!.))|(^ *\d+\.* *(?!.))|(^ *\- *(?!.))|(^ *\>+ *(?!.))|(^ +(?!.))/;

  let stri = pigTail !== "" ? pigTail : _string ? _string[0] : "";
  if (tail.slice(0, 2) === "\n\n") {
    logg("\\n\\n:", "true");
    stri = "";
  } else {
    logg("\\n\\n:", "false");
  }
  logg("stri:", JSON.stringify(stri));

  const isOutsideCodeBlock = outsideCodeBlock(head);

  logg("-> spec at start <-");
  const matches1 = stri.match(regex);
  logg("matches1 =", JSON.stringify(matches1));

  const isNotDigit = matches1 && !matches1[2] ? true : false;
  // test will start if digit only
  const isDotAfterDigit =
    matches1 && matches1[2] && /\d+\./.test(_string) ? true : false;

  if (isDotAfterDigit) {
    logg(">- dot after digit -<");
  } else {
    logg(">- not dot after digit  -<");
  }

  if (isOutsideCodeBlock && (isNotDigit || isDotAfterDigit)) {
    stringToPreview = pigBody + "\n" + _string;
    variant = false;
  } else {
    logg("-> not spec at start <-");
    const regex3 = /(^ *```)/;
    const isBigCodeBlockStart = regex3.test(_string);

    if (isBigCodeBlockStart) {
      logg(">> Big code block <<");
      stringToPreview = pigBody + "\n\n" + _string;
    } else {
      logg(">> simply char <<");
      if (head.slice(-1) === "\n" && isOutsideCodeBlock) {
        logg(">>> \\n <<<");
        stringToPreview = head + _string;
        if (head.slice(-2) === "\n\n") {
          logg(">>>>>> \\n\\n <<<<<<");
          stringToPreview = head + _string;
        }
        stringToPreview = stringToPreview.replace(
          /\\\n.*$/,
          "\\\n<span>\x001</span>"
        );
        variant = false;
      } else {
        logg("<<< not \\n >>>");
        stringToPreview = head;
      }
    }
  }
  const rege = /^ +$/;
  const isTrailingSpace = rege.test(_string);
  if ((stri === "" || isTrailingSpace) && isOutsideCodeBlock) {
    stringToPreview = head + "\n<div style='margin-top:-1rem'>\x001</div>";
    variant = false;
  }
  return stringToPreview;
};

const whatString = ({ head, tail, headLastNewLine, endHead }) => {
  logIn("whatString");

  const h7 = head.slice(-7);
  const head1 = head;
  const t7 = tail.slice(0, 7);
  let _string = tail && firstStr(tail);

  logg("endHead =", endHead);
  logg("headLastNewLine:", headLastNewLine);
  logg("last head 7:", JSON.stringify(h7));
  logg("first tail 7:", JSON.stringify(t7));
  logg("firstString :", '"' + _string + '"');

  let stringToPreview = "";
  const currentIndex = head === "" ? 0 : head.length;
  logg("currentIndex:", currentIndex);
  const pigTail = head.substr(
    headLastNewLine === 0 ? headLastNewLine : headLastNewLine + 1,
    currentIndex
  );
  logg("pigTail:", JSON.stringify(pigTail));
  const pigBody = head.substr(0, endHead);
  //logg("pigBody:", JSON.stringify(pigBody));

  if (preview.innerHTML !== "")
    stringToPreview = checkStartLine(head, tail, pigTail, pigBody, _string);

  //logg("head1:", JSON.stringify(head1));
  //logg("head_:", JSON.stringify(head));
  logg("stTPw:", JSON.stringify(stringToPreview));
  if (stringToPreview !== "") {
    position.innerHTML = markdown(stringToPreview);
    lastChildRecursive(position);
  }

  logOut();
};

const lastNewLine = function (str) {
  let caret = str.length - 1;
  let sym = str[caret];

  while (sym != "\n" && caret > 0) {
    caret--;
    sym = str[caret];
  }
  return caret;
};

const headAndTail = () => {
  let head = input.value.substr(0, input.selectionStart);

  output.value = head;
  output.scrollTop = output.scrollHeight;

  const headLastNewLine = lastNewLine(head);
  const endHead = headLastNewLine !== -1 ? headLastNewLine : head.length;
  const tail = input.value.substr(endHead, input.value.length);
  //const tailLastNewLine = lastNewLine(tail);

  return {
    head,
    tail,
    headLastNewLine,
    endHead,
  };
};

const syncPreview = function () {
  const f = headAndTail();
  whatString(f);

  const scrollTop = position.scrollHeight;
  position.scrollTop = scrollTop;
  preview.scrollTop = position.scrollTop;
};

input.addEventListener("keyup", debounce(syncPreview, 150, false));
input.addEventListener("mouseup", debounce(syncPreview, 150, false));
//position.addEventListener("scroll", debounce(syncPreview, 150, false));

// loggs system
if (true) {
  // Assistant for debugging errors.
  // ~~View active elements DOM,~~
  // ~~when navigation by TOC menu items.~~

  // For production - delete this block and loggs.
  // To delete all loggs use regex:^ *log.*$\n*

  // managing vars
  // change to show/hide output loggs
  var showLogg = false; // logg - 'headAndTail'
  var showLogg1 = false; // logg1 - 'whatClass'
  var showLogg2 = true; // logg2 -
  var showLogg3 = false; // logg3 -
  var showLogg4 = false; // logg4 -
  var showLogg5 = false; // logg5 -
  var showLogg6 = false; // logg6 - 'whatElement'

  // loggs subsystem 0
  // 'headAndTail'
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
  // 'whatClass'
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
  // 'whatElement'
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
