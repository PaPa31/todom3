//let firstEmptyPosition = false;

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

const checkCurrent = (head, stringToPreview) => {
  if (outsideCodeBlock(head)) {
    logg("<--< outside of code block >-->");
    stringToPreview = head;
  } else {
    logg("<--< inside of code block >-->");
    head = head.replace(/(.*)$/, "\n$1");
    stringToPreview = head;
  }
  return stringToPreview;
};

const isNumeric = (value) => {
  return !isNaN(value - parseFloat(value));
};

const checkStartLine = (
  head,
  tail,
  pigTail,
  pigBody,
  stringToPreview,
  _string
) => {
  //head = head.replace(/(\n).*?$/, "$1");
  // remove first line whitespaces
  //pigTail = pigTail.replace(/^ {1,3}/, "");

  //look for specSymbols [#,\d.,-,>, ]
  //at the begining of the _string
  const regex =
    /(^ *#{1,6} *(?!.))|(^ *\d+\.* *(?!.))|(^ *\- *(?!.))|(^ *\>+ *(?!.))|(^ +(?!.))/;
  //const regex = /(^ *#{1,6} +)|(^ *\d+\. +.)|(^ *\- +)|(^ *\>+ +)|(^ +)/;

  let stri = pigTail !== "" ? pigTail : _string[0];
  if (tail.slice(0, 2) === "\n\n") stri = "";
  logg("stri:", JSON.stringify(stri));
  const isSpecSymbol = regex.test(stri);

  //const regex =
  //  /((?<=\n *)#{1,6} *$)|((?<=\n *)\d+\.* *$)|((?<=\n *)\- *$)|((?<=\n *)\>+ *$)|((?<=\n) +$)/;
  //const isSpecSymbol = regex.test(head);

  if (isSpecSymbol) {
    logg("-> spec at start <-");
    const matches1 = stri.match(regex);
    logg("matches1 =", JSON.stringify(matches1));
    const specString = matches1 ? matches1[0] : "";
    //const specChar = specString[0];
    logg("specString =", JSON.stringify(specString));

    //const rege = /\d/;
    //const isNumber = rege.test(specChar);

    stringToPreview = head;
    switch (outsideCodeBlock(head)) {
      //case specString === "#": {
      case /#+/.test(specString): {
        logg("1> # <1");
        head = head.replace(/\n\n(.*)$/, "\n\n\n$1");
        stringToPreview = head;
        break;
      }
      case isNumeric(specString): {
        logg("1> 0-9 <1");
        // this regex works as if:
        // work if 2 '\n' and not work if 1 '/n'
        head = head.replace(/\n\n(.*)$/, "\n\n\x001\x001\x001$1");
        stringToPreview = head;
        break;
      }
      default: {
        logg("1> default <1");
        head = head.replace(/\n\n(.*)$/, "\n\n\x001\x001\x001$1");
        stringToPreview = head;
        //stringToPreview = stringToPreview + "\\\n\x001";
      }
    }
    if (true) {
      variant = false;
    }
  } else {
    logg("-> not spec at start <-");
    const regex3 = /(^ *```)/;
    const isBigCodeBlockStart = regex3.test(pigTail);

    if (isBigCodeBlockStart) {
      logg(">> Big code block <<");
      head = head.replace(/(.*)$/, "\n$1");
      stringToPreview = head;
    } else {
      logg(">> simply char <<");
      //head = head.replace(/(\n).*?$/, "$1");
      // remove first line whitespaces
      //_string = _string.replace(/^ +/, "");
      //pigBody = pigBody.replace(/\n(.*)$/, "\n\x001\x001\x001$1");
      //stringToPreview = pigBody + "\n\x001\x001\x001" + pigTail;
      head = head.replace(/\n\n(.*)$/, "\n\n\x001\x001\x001$1");
      stringToPreview = head;
      //variant = false;
    }
  }
  if (!stri) {
    stringToPreview =
      stringToPreview + "\n<div style='margin-top:-1rem'>\x001</div>";
    variant = false;
  }
  return stringToPreview;
};

const whatString = ({
  head,
  tail,
  headLastNewLine,
  tailLastNewLine,
  endHead,
}) => {
  logIn("whatString");

  const h7 = head.slice(-7);
  const head1 = head;
  const t7 = tail.slice(0, 7);
  let _string = tail && firstStr(tail);

  logg("endHead =", endHead);
  logg("headLastNewLine:", headLastNewLine);
  logg("tailLastNewLine:", tailLastNewLine);
  logg("last head 7:", JSON.stringify(h7));
  logg("first tail 7:", JSON.stringify(t7));
  logg("firstString :", '"' + _string + '"');

  let stringToPreview = "";
  const currentIndex = head === "" ? 0 : head.length;
  logg("currentIndex:", currentIndex);
  const current = head.slice(-1);
  const startLine = tail[1];
  const pigTail = head.substr(
    headLastNewLine === 0 ? headLastNewLine : headLastNewLine + 1,
    currentIndex
  );
  logg("pigTail:", JSON.stringify(pigTail));
  const pigBody = head.substr(0, endHead);
  logg("pigBody:", JSON.stringify(pigBody));

  //if (currentIndex - 1 === headLastNewLine) {
  //  //check only current
  //  stringToPreview = checkCurrent(head, stringToPreview);
  //} else {
  //  //check current & startLine
  //  stringToPreview = checkStartLine(pigTail, stringToPreview, _string);
  //  checkCurrent(current, head);
  //}

  stringToPreview = checkStartLine(
    head,
    tail,
    pigTail,
    pigBody,
    stringToPreview,
    _string
  );

  if (false && false) {
    if (headLastNewLine < 0) {
      logg("<----------------- first line ----------------->");
      if (head === "") {
        logg("<------- 0 pos ------->");
        stringToPreview = _string;
        variant = false;
      } else {
        logg("<------- 0> pos ------->");
        stringToPreview = head;
      }
    } else {
      logg("<----------------- not first line ----------------->");
      const emptyHead = head.replace(/^\n+/, "");
      if (emptyHead === "") {
        logg("<- - -|    newline at the beginning   |- - ->");
        stringToPreview = _string;
        variant = false;
      } else {
        logg("<- - -|    chars at the beginning  |- - ->");
        if (current === "\n") {
          logg("<--< 1 pos >-->");
          if (startLine === "\n") {
            logg("<- empty 1 pos ->");
            //logg(JSON.stringify(head));
            head = head.replace(/\n+$/, "");
            //logg(JSON.stringify(head));
            //stringToPreview = head + "\n\n<span>1</span>";
            stringToPreview = head + "\n\n" + _string;
            variant = false;
          } else {
            logg("< not empty 1 pos >");
            //stringToPreview = head + _string;
            stringToPreview = head + "\n" + _string;
            variant = false;
          }
        } else {
          logg("<--< not 1 pos >-->");

          // check spec at the current
          const re1 = /\s*```.*/g;
          const match1 = head.match(re1);
          const isOutsideCodeBlock1 = match1 ? match1.length % 2 === 0 : true;

          // look for specSymbols [#,\d.,- ,>, ]
          // at the end of the head
          const regex1 =
            /((?<=\n *)#{1,6} *$)|((?<=\n *)\d+\.* *$)|((?<=\n *)\- *$)|((?<=\n *)\>+ *$)|((?<=\n) +$)/;
          const isSpecSymbol1 = regex1.test(head);

          if (isOutsideCodeBlock1 && isSpecSymbol1) {
            logg("<   spec-symbol at current   >");
            head = head.replace(/(\n).*?$/, "$1");
            // remove first line whitespaces
            _string = _string.replace(/^ +/, "");
            stringToPreview = head + _string;
            variant = false;
          } else {
            logg("<   not spec-symbol at current   >");
            //if (head[headLastNewLine - 1] === "\n") {
            //  logg("< extra newline 2 >");

            // check spec at the begining of the _string
            const re2 = /\s*```.*/g;
            const match2 = head.match(re2);
            const isOutsideCodeBlock2 = match2 ? match2.length % 2 === 0 : true;

            //look for specSymbols [#,\d.,-,>, ]
            //at the begining of the _string
            const regex2 = /(^ *#{1,6})|(^ *\d+\.*)|(^ *\-)|(^ *\>+)|(^ +)/;
            const isSpecSymbol2 = regex2.test(_string);

            if (isOutsideCodeBlock2 && isSpecSymbol2) {
              logg("-> spec at the start <-");

              const matches1 = _string.match(regex2);
              logg("matches1 =", JSON.stringify(matches1));
              const specString = matches1 ? matches1[0] : "";
              const specChar = specString[0];
              logg("specChar =", JSON.stringify(specChar));

              const rege = /\d/;
              const isNumber = rege.test(specChar);

              switch (true) {
                case specChar === "#": {
                  logg("1> # <1");
                  head = head.replace(/\n\n(.*)$/, "\n\n\n$1");
                  stringToPreview = head;
                  break;
                }
                case isNumber: {
                  logg("1> 0-9 <1", JSON.stringify(specChar));
                  // this regex works as if:
                  // work if 2 '\n' and not work if 1 '/n'
                  head = head.replace(/\n\n(.*)$/, "\n\n\x001\x001\x001$1");
                  stringToPreview = head;
                  break;
                }
                default: {
                  logg("1> default <1");
                  stringToPreview = head;
                  //stringToPreview = stringToPreview + "\\\n\x001";
                }
              }
            } else {
              logg("-> not spec at start <-");
              const regex3 = /(^ *```)/;
              const isBigCodeBlockStart = regex3.test(_string);

              if (isBigCodeBlockStart) {
                logg(">> Big code block <<");
                head = head.replace(/(.*)$/, "\n$1");
                stringToPreview = head;
              } else {
                logg(">> simply char <<");
                stringToPreview = head;
              }
            }

            //head = head.replace(/\n\n(.*)$/, "\n\n\\\x001\x001$1");
            //stringToPreview = head;
            //} else {
            //  stringToPreview = head;
            //}
          }
        }
      }
      if (head.slice(-2) === "\n\n") {
        logg("< extra newline 1 >");

        //look for specSymbols [#,\d.,-,>, ]
        //at the begining of the _string
        const regex3 = /(^#{1,6})|(^\d+\.*)|(^\-)|(^\>+)|(^ +)/;
        const isSpecSymbol = regex3.test(_string);

        if (isSpecSymbol) {
          logg("-> spec <-");
        } else {
          logg("-> not spec <-");
        }

        const matches2 = _string.match(regex3);
        logg("matches2 =", JSON.stringify(matches2));
        const specString = matches2 ? matches2[0] : "";
        const specChar = specString[0];

        logg("specChar=", JSON.stringify(specChar));

        switch (specChar) {
          case "#": {
            logg("2> # <2");
            stringToPreview = head + _string;
            break;
          }
          case "-": {
            logg("2> > <2");
            stringToPreview = head + _string;
            break;
          }
          default: {
            logg("2> default <2");
            stringToPreview = stringToPreview + "\\\n\x001";
          }
        }

        variant = false;
      }
    }
  }

  //stringToPreview = stringToPreview.replace(/\n{2,}$/, "\n\x001\n");

  //logg("head1:", JSON.stringify(head1));
  //logg("head_:", JSON.stringify(head));
  logg("stTPw:", JSON.stringify(stringToPreview));
  if (stringToPreview !== "") position.innerHTML = markdown(stringToPreview);
  lastChildRecursive(position);

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
  //head = head.replace(/(\n*) *#+ *$/, "$1");
  //head = head.replace(/^[\n ]+/, "");

  output.value = head;
  output.scrollTop = output.scrollHeight;

  const headLastNewLine = lastNewLine(head);
  const endHead = headLastNewLine !== -1 ? headLastNewLine : head.length;
  const tail = input.value.substr(endHead, input.value.length);
  const tailLastNewLine = lastNewLine(tail);

  return {
    head,
    tail,
    headLastNewLine,
    tailLastNewLine,
    endHead,
  };

  if (false) {
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

            // headers first # pos
            logg("s1.2.2");
            const splitTail = tail.split("\n");
            logg(splitTail);
            const firstString = splitTail.find((s) => {
              if (s !== "") return s;
            });
            logg("firstString=", firstString);
            stringToPreview = firstString.replace(/^(\#+)*.*/, "$1");
            logg("stringToPreview=", stringToPreview);
            stringToPreview = head + stringToPreview + " \x001";

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
                  //stringToPreview = head + tail[0];

                  const splitTail = tail.split("\n");
                  logg(splitTail);
                  const firstString = splitTail.find((s) => {
                    if (s !== "") return s;
                  });
                  logg("firstString=", firstString);
                  stringToPreview = firstString.replace(
                    /^([\#\d]+\.*)*.*/,
                    "$1"
                  );
                  logg("stringToPreview=", stringToPreview + ";;;");
                  stringToPreview = head + stringToPreview + " \x001";

                  position.innerHTML = markdown(stringToPreview);
                  variant = false;
                  //lastSeven(preview);
                }
              } else {
                // last position after code block
                // inside text block
                // header names
                logg("s2.2.1.2.b");
                let first7tail = tail.slice(0, 7);
                logg("first7tail =", first7tail);
                first7tail = first7tail.replace(/^\n*([\d]+\. )(.*)/, "$1");
                logg("first7tail after regex =", first7tail + ";;;");
                stringToPreview = head + first7tail;
                // TODO add check to split lb from uderline
                //position.innerHTML = markdown(stringToPreview);
                //variant = false;
                //lastSeven(preview);
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
  }
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
  var showLogg = true; // logg - 'headAndTail'
  var showLogg1 = true; // logg1 - 'whatClass'
  var showLogg2 = false; // logg2 -
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
