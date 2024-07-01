//let _textArea;
//let inPlacePreview;

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

    _textArea.addEventListener("input", () =>
      updatePreview(inPlacePreview, _textArea.value)
    );
  } else {
    const editor = parentLi.querySelector(".dual > .editor");
    if (editor) editor.remove();
  }

  itemsSpecArray[itemIndexToEdit2].edit =
    !itemsSpecArray[itemIndexToEdit2].edit;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
};

const mdPreview = (inPlace, markdownString) => {
  //console.log("hi", inPlace, markdownString);
  inPlace.innerHTML = markdown(markdownString);
};

const updatePreview = (inPl, str) => {
  debounce(mdPreview(inPl, str), 200, false);
};
