const selectEditor = (e, element) => {
  const parentLi = findParentTagOrClassRecursive(element);
  if (parentLi.classList.contains("folded")) {
    editItem(e, element, parentLi);
  } else {
    editInPlaceItem(element, parentLi);
  }
};

let editor = [];

const editInPlaceItem = (element, parentLi) => {
  const editIndex = indexedItems.indexOf(parentLi.id) * 1;

  const current = getCurrentSpec("save", editIndex);
  const textArr = itemsArray[editIndex].text;
  const text = textArr[current];

  intervalFocus(
    element,
    "background-color: var(--todom-textEdit-background);",
    300
  );

  if (!editor[editIndex]) {
    createEditor(parentLi, editIndex, text);
  } else removeEditor(parentLi, editIndex);
};

const mdUpdate = (parentLi, inPlace, markdownString, itemIndex) => {
  mdToTagsWithoutShape(inPlace, markdownString);
  addOrRemoveScrollObserverToLi(parentLi);
  const current = getCurrentSpec("save", itemIndex);
  const textArr = itemsArray[itemIndex].text;
  textArr[current] = markdownString;
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

  const resizableDiv = dual.querySelector(".md-item > .resizable-div");

  const inputListener = () =>
    mdUpdate(parentLi, resizableDiv, _textArea.value, editIndex);
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
