const selectEditor = (e, element) => {
  const parentLi = findParentTagOrClassRecursive(element);
  if (parentLi.classList.contains("folded")) {
    editItem(e, element, parentLi);
  } else {
    editInPlaceItem(element, parentLi);
  }
};

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

  if (!itemsSpecArray[itemIndexToEdit2].edit) {
    const dual = parentLi.querySelector(".dual");
    const editor = document.createElement("div");
    editor.setAttribute("class", "editor");
    dual.insertAdjacentElement("afterbegin", editor);

    const textAttr = { id: `li${parentLi.id}` };
    const _textArea = createEl("textarea", textAttr, editor);
    _textArea.value = editing;

    const inPlacePreview = dual.querySelector(".md-item > .resizable-div");

    const inputListener = () => updatePreview(inPlacePreview, _textArea.value);
    _textArea.addEventListener("input", inputListener);

    // Store the input listener reference in the element for future removal
    _textArea._inputListener = inputListener;
  } else {
    const editor = parentLi.querySelector(".dual > .editor");
    if (editor) {
      const _textArea = editor.querySelector("textarea");
      if (_textArea && _textArea._inputListener)
        editor.removeEventListener("input", _textArea._inputListener);
      editor.remove();
    }
  }

  itemsSpecArray[itemIndexToEdit2].edit =
    !itemsSpecArray[itemIndexToEdit2].edit;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));

  const mdUpdate = (inPlace, markdownString) => {
    mdToTagsWithoutShape(inPlace, markdownString);
    textArr[current] = markdownString;
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  };

  const updatePreview = (inPl, str) => {
    debounce(mdUpdate(inPl, str), 200, false);
  };
};
