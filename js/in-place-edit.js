const editInPlaceItem = (e, element) => {
  const editedItemLiDOM2 = findParentTagOrClassRecursive(element);
  const itemIndexToEdit2 = indexedItems.indexOf(editedItemLiDOM2.id) * 1;

  let current = getCurrentSpec("save", itemIndexToEdit2);
  const textArr = itemsArray[itemIndexToEdit2].text;

  const editing = textArr[current];
  if (e.ctrlKey) {
    intervalFocus(
      element,
      "background-color: var(--todom-main-action-icon-foreground);",
      300
    );
    input.value = input.value
      ? /^ *- /.test(editing)
        ? input.value + "\n" + editing
        : input.value + "\\\n" + editing
      : editing;
    scrollToLast();
  } else {
    itemIndexToEdit = itemIndexToEdit2;
    editedItemLiDOM = editedItemLiDOM2;
    intervalFocus(
      element,
      "background-color: var(--todom-textEdit-background);",
      300
    );
    //const dual = createEl("div", { class: "dual" }, editedItemLiDOM);
    const dual = editedItemLiDOM.querySelector(".dual");
    const editor = document.createElement("div");
    editor.setAttribute("class", "editor");
    dual.insertAdjacentElement("afterbegin", editor);

    const textAttr = { id: `li${editedItemLiDOM.id}` };
    const textArea = createEl("textarea", textAttr, editor);
    textArea.value = editing;

    //const file = filesArray[arrIndex];
    //const fileInfoDiv = createEl("div", { class: "file-info" }, parentDiv);
    //const fileNameDiv = createEl("div", { class: "file-name" }, fileInfoDiv);
    //fileNameDiv.innerHTML = file.dir ? file.dir : file.name;
    //const fileSizeDiv = createEl("div", { class: "file-size" }, fileInfoDiv);
    //fileSizeDiv.innerHTML = file.size ? fileSizeTerm(file.size) : "";

    //splitSaveItemButton();
    //editUI("#" + (itemIndexToEdit + 1));
  }
  //  xUI();
  //  mdToInPlacePreview(input.value);
};

//const mdToInPlacePreview = (markdownString) => {
//  inPlacePreview.innerHTML = markdown(markdownString);
//};
