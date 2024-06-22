const whatClass = (el) => {
  const papa = el.parentElement;
  papa.classList.add("parent-last-child");
  const tagName = el.tagName.toLowerCase();
  if (variant) {
    switch (tagName) {
      // list of ignored inline tags
      case "code": {
        if (el.parentElement.tagName.toLowerCase() === "pre") {
          el.classList.add("last-child-rb");
        }
        break;
      }
      case "i":
      case "b":
      case "em":
      case "br":
      case "del":
      case "cite":
      case "details":
      case "summary": {
        el.classList.add("last-child-rb");
        break;
      }
      default: {
        el.classList.add("last-child");
      }
    }
  } else {
    el.classList.add("last-child-lb");
    variant = true;
  }
};

const whatElement = (child) => {
  if (child.nextSibling && child.nextSibling.textContent != "\n") {
    //Array.from(document.querySelector("#title").childNodes).find(
    //  (n) => n.nodeType == Node.TEXT_NODE
    //).textContent;

    if (child.nextSibling.classList) {
      whatClass(child.nextSibling);
    } else {
      whatClass(child.parentElement);
    }
  } else {
    switch (child.tagName.toLowerCase()) {
      case "a":
      case "code":
        if (child.parentElement.tagName.toLowerCase() !== "pre") {
          whatClass(child.parentElement);
          break;
        }
      default: {
        whatClass(child);
      }
    }
  }
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
    stri = "";
  } else {
  }

  const isOutsideCodeBlock = outsideCodeBlock(head);

  const matches1 = stri.match(regex);

  const isNotDigit = matches1 && !matches1[2] ? true : false;
  // test will start if digit only
  const isDotAfterDigit =
    matches1 && matches1[2] && /\d+\./.test(_string) ? true : false;

  if (isDotAfterDigit) {
  } else {
  }

  if (isOutsideCodeBlock && (isNotDigit || isDotAfterDigit)) {
    stringToPreview = pigBody + "\n" + _string;
    variant = false;
  } else {
    const regex3 = /(^ *```)/;
    const isBigCodeBlockStart = regex3.test(_string);

    if (isBigCodeBlockStart) {
      stringToPreview = pigBody + "\n\n" + _string;
    } else {
      if (head.slice(-1) === "\n" && isOutsideCodeBlock) {
        stringToPreview = head + _string;
        if (head.slice(-2) === "\n\n") {
          stringToPreview = head + _string;
        }
        stringToPreview = stringToPreview.replace(
          /\\\n.*$/,
          "\\\n<span>\x001</span>"
        );
        variant = false;
      } else {
        if (head === "") {
          stringToPreview = stri;
          variant = false;
        } else {
          stringToPreview = head;
        }
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
  const h7 = head.slice(-7);
  const head1 = head;
  const t7 = tail.slice(0, 7);
  let _string = tail && firstStr(tail);

  let stringToPreview = "";
  const currentIndex = head === "" ? 0 : head.length;
  const pigTail = head.substr(
    headLastNewLine === 0 ? headLastNewLine : headLastNewLine + 1,
    currentIndex
  );
  const pigBody = head.substr(0, endHead);
  //logg("pigBody:", JSON.stringify(pigBody));

  if (preview.innerHTML !== "")
    stringToPreview = checkStartLine(head, tail, pigTail, pigBody, _string);

  //logg("head1:", JSON.stringify(head1));
  //logg("head_:", JSON.stringify(head));
  if (stringToPreview !== "") {
    position.innerHTML = markdown(stringToPreview);
    lastChildRecursive(position);
  }
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

  position.style = "";
  preview.style = "";
  const scrollTop = position.scrollHeight;
  let oldPositionHeight = position.clientHeight;
  let oldPositionHeight2 = position.scrollHeight;
  let oldPositionHeight3 = position.scrollTop;
  previewHeightHandler(scrollTop);
  position.scrollTop = scrollTop;
  preview.scrollTop = position.scrollTop;

  //console.log({ position });
  //preview.scrollTop = position.scrollTop - offsetHeight;
};

var upHandler = function () {
  debounce(syncPreview(), 150, false);
};

input.addEventListener("keyup", upHandler);
input.addEventListener("mouseup", upHandler);
//position.addEventListener("scroll", debounce(syncPreview, 150, false));
