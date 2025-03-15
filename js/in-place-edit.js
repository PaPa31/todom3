const selectEditor = (e, editButtonElem) => {
  const parentLi = findParentTagOrClassRecursive(editButtonElem);
  if (parentLi.classList.contains("folded")) {
    editItem(e, editButtonElem, parentLi);
  } else {
    editInPlaceItem(editButtonElem, parentLi);
    addOrRemoveScrollObserverToLi(parentLi);
  }
};

let editor = [];

const editInPlaceItem = (editButtonElem, parentLi) => {
  const editIndex = indexedItems.indexOf(parentLi.id) * 1;

  const currentSave = getCurrentSpec("save", editIndex);
  const textArr = itemsArray[editIndex].text;
  const text = textArr[currentSave].variant;

  intervalFocus(
    editButtonElem,
    "background-color: var(--todom-textEdit-background);",
    300
  );

  if (!editor[editIndex]) {
    createEditor(parentLi, editIndex, text);
  } else removeEditor(parentLi, editIndex);
};

const mdUpdate = (inPlace, markdownString, itemIndex) => {
  mdToTagsWithoutShape(inPlace, markdownString);
  const currentSave = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;
  textArr[currentSave].variant = markdownString;
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
};

function createEditor(parentLi, editIndex, text) {
  const dual = parentLi.querySelector(".dual");
  const _editor = document.createElement("div");
  _editor.setAttribute("class", "editor");
  dual.insertAdjacentElement("afterbegin", _editor);

  const textAttr = { id: `li${parentLi.id}` };
  const _textArea = createEl("textarea", textAttr, _editor);
  _textArea.value = text;

  const resizableDiv = dual.querySelector(".resizable-div");

  // Track details state only when needed
  let detailsStates = {};

  const toggleListener = (event) => {
    if (event.target.tagName === "DETAILS") {
      const summaryText =
        event.target.querySelector("summary")?.textContent ||
        `index-${[...resizableDiv.querySelectorAll("details")].indexOf(
          event.target
        )}`;
      detailsStates[summaryText] = event.target.open;
    }
  };
  __addListener("toggle", resizableDiv, toggleListener);

  const inputListener = () => {
    if (resizableDiv.querySelector("details")) {
      // Save state only if <details> exists
      resizableDiv.querySelectorAll("details").forEach((details) => {
        const summaryText =
          details.querySelector("summary")?.textContent ||
          `index-${[...resizableDiv.querySelectorAll("details")].indexOf(
            details
          )}`;
        detailsStates[summaryText] = details.open;
      });
    }

    // Update preview
    mdUpdate(resizableDiv, _textArea.value, editIndex);

    // Restore state only if <details> exists
    resizableDiv.querySelectorAll("details").forEach((details) => {
      const summaryText =
        details.querySelector("summary")?.textContent ||
        `index-${[...resizableDiv.querySelectorAll("details")].indexOf(
          details
        )}`;
      if (detailsStates[summaryText]) {
        details.setAttribute("open", "");
      } else {
        details.removeAttribute("open");
      }
    });
  };

  __addListener("input", _textArea, inputListener);

  editor[editIndex] = !editor[editIndex]; //1
}

function removeEditor(parentLi, editIndex) {
  const _editor = parentLi.querySelector(".dual > .editor");
  if (_editor) {
    const _textArea = _editor.querySelector("textarea");
    if (_textArea) {
      __removeListener("input", _textArea);
    }
    _editor.remove();
  }
  editor[editIndex] = !editor[editIndex]; //2

  // Also clean resizableDiv listener
  const _resizableDiv = parentLi.querySelector(
    ".dual > .md-item > .resizable-div"
  );
  if (_resizableDiv) {
    __removeListener("toggle", _resizableDiv);
  }
}

function __addListener(eventName, listenerEl, callback) {
  const debouncedHandler = debounce(
    () => {
      callback(listenerEl);
    },
    100,
    false
  );
  const str = `_${eventName}Handler`;
  listenerEl[str] = debouncedHandler;
  listenerEl.addEventListener(eventName, debouncedHandler, false);
}

function __removeListener(eventName, listenerEl) {
  const str = `_${eventName}Handler`;
  if (listenerEl[str]) {
    listenerEl.removeEventListener(eventName, listenerEl[str]);
    delete listenerEl[str];
  }
}
