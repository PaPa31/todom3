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
    const textArea = createEl("textarea", textAttr, editor);
    textArea.value = editing;
  } else {
    const editor = parentLi.querySelector(".dual > .editor");
    if (editor) editor.remove();
  }

  itemsSpecArray[itemIndexToEdit2].edit =
    !itemsSpecArray[itemIndexToEdit2].edit;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));

  //splitSaveItemButton();
  //editUI("#" + (itemIndexToEdit + 1));

  //  xUI();
  //  mdToInPlacePreview(input.value);
};

//const mdToInPlacePreview = (markdownString) => {
//  inPlacePreview.innerHTML = markdown(markdownString);
//};
