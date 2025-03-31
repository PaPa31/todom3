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

  // Track state in a Map
  const detailsState = new Map();

  const inputListener = () => {
    console.log(
      "🔵 Before updateDOM() - resizableDiv.innerHTML:",
      resizableDiv.innerHTML
    );

    // 1. Store state before updating
    resizableDiv.querySelectorAll("details").forEach((el, index) => {
      detailsState.set(index, el.open); // Store `open` state by index
    });

    // 2. Update preview with new markdown content
    mdUpdate(resizableDiv, _textArea.value, editIndex);

    console.log(
      "🟢 After updateDOM() - resizableDiv.innerHTML:",
      resizableDiv.innerHTML
    );

    // 3. Restore state after updating
    resizableDiv.querySelectorAll("details").forEach((el, index) => {
      if (detailsState.has(index)) {
        el.open = detailsState.get(index);
      }
    });
  };

  __addListener("input", _textArea, inputListener);

  editor[editIndex] = !editor[editIndex]; //1 Toggle editor state
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
