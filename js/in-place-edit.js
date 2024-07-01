const editInPlaceItem = (e, element) => {
  const editedItemLiDOM2 = findParentTagOrClassRecursive(element);
  const itemIndexToEdit2 = indexedItems.indexOf(editedItemLiDOM2.id) * 1;

  let current = getCurrentSpec("save", itemIndexToEdit2);
  const textArr = itemsArray[itemIndexToEdit2].text;

  const editing = textArr[current];

  intervalFocus(
    element,
    "background-color: var(--todom-textEdit-background);",
    300
  );

  if (!itemsSpecArray[itemIndexToEdit2].edit) {
    const dual = editedItemLiDOM2.querySelector(".dual");
    const editor = document.createElement("div");
    editor.setAttribute("class", "editor");
    dual.insertAdjacentElement("afterbegin", editor);

    const textAttr = { id: `li${editedItemLiDOM2.id}` };
    const textArea = createEl("textarea", textAttr, editor);
    textArea.value = editing;
  } else {
    const editor = editedItemLiDOM2.querySelector(".dual > .editor");
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
