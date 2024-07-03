const selectEditor = (e, element) => {
  const parentLi = findParentTagOrClassRecursive(element);
  if (parentLi.classList.contains("folded")) {
    editItem(e, element, parentLi);
  } else {
    editInPlaceItem(element, parentLi);
  }
};

const editInPlaceItem = (element, parentLi) => {
  const editIndex = indexedItems.indexOf(parentLi.id) * 1;

  let current = getCurrentSpec("save", editIndex);
  const textArr = itemsArray[editIndex].text;
  const editing = textArr[current];

  intervalFocus(
    element,
    "background-color: var(--todom-textEdit-background);",
    300
  );

  if (!itemsSpecArray[editIndex].edit) {
    const dual = parentLi.querySelector(".dual");
    const _editor = document.createElement("div");
    _editor.setAttribute("class", "editor");
    dual.insertAdjacentElement("afterbegin", _editor);

    const textAttr = { id: `li${parentLi.id}` };
    const _textArea = createEl("textarea", textAttr, _editor);
    _textArea.value = editing;

    const resizableDiv = dual.querySelector(".md-item > .resizable-div");

    const inputListener = () => mdUpdate(resizableDiv, _textArea.value);
    __addListener("input", _textArea, inputListener);

    itemsSpecArray[editIndex].edit = !itemsSpecArray[editIndex].edit; //1
  } else removeEditor(parentLi, editIndex);

  const mdUpdate = (inPlace, markdownString) => {
    mdToTagsWithoutShape(inPlace, markdownString);
    textArr[current] = markdownString;
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  };
};

function removeEditor(parentLi, editIndex) {
  const _editor = parentLi.querySelector(".dual > .editor");
  if (_editor) {
    const _textArea = _editor.querySelector("textarea");
    if (_textArea) {
      __removeListener("input", _textArea);
    }
    _editor.remove();
  }
  itemsSpecArray[editIndex].edit = !itemsSpecArray[editIndex].edit; //2
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
