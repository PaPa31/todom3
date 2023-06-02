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

const update = function () {
  //const head = input.selectionStart
  //  ? input.value.substr(0, input.selectionStart)
  //  : input.value.substr(0, 1);

  let head = input.value.substr(0, input.selectionStart);

  head = head.replace(/(\n*) *#+ *$/, "$1");

  console.log("head.length =", head.length);
  console.log("head=", head + ";;;");

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

  console.log("last head:", head.slice(-1) + ";;;");
  console.log("first tail:", tail[0] + ";;;");

  //console.log("tail=", tail + ";;;");
  console.log("tail[1]=", tail[1] + ";;;");

  console.log("headLastNewLine:", headLastNewLine);
  console.log("tailLastNewLine:", tailLastNewLine);

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

  const scrollTop = position.scrollHeight;
  position.scrollTop = scrollTop;
  preview.scrollTop = position.scrollTop;
};

input.addEventListener("keyup", debounce(update, 150, false));
input.addEventListener("mouseup", debounce(update, 150, false));
//position.addEventListener("scroll", debounce(update, 150, false));
