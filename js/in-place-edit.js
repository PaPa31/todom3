const selectEditor = (e, element) => {
  const parentLi = findParentTagOrClassRecursive(element);
  if (parentLi.classList.contains("folded")) {
    editItem(e, element, parentLi);
  } else {
    editInPlaceItem(element, parentLi);
  }
};

var editor = false;

const editInPlaceItem = (element, parentLi) => {
  const itemIndexToEdit2 = indexedItems.indexOf(parentLi.id) * 1;

  let current = getCurrentSpec("save", itemIndexToEdit2);
  const textArr = itemsArray[itemIndexToEdit2].text;
  const editing = textArr[current];

  intervalFocus(
    element,
    "background-color: var(--todom-textEdit-background);",
    300
  );

  if (!editor) {
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

    editor = !editor; //1
  } else removeEditor(parentLi);

  const mdUpdate = (inPlace, markdownString) => {
    mdToTagsWithoutShape(inPlace, markdownString);
    textArr[current] = markdownString;
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  };
};

function removeEditor(parentLi) {
  const _editor = parentLi.querySelector(".dual > .editor");
  if (_editor) {
    const _textArea = _editor.querySelector("textarea");
    if (_textArea) {
      __removeListener("input", _textArea);
    }
    _editor.remove();
  }
  editor = !editor; //2
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
