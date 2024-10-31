input.addEventListener("input", inputHandler);

if (input.value) {
  xUI();
  mdToPreview(input.value);
  //preview.scrollTop = preview.scrollHeight;
}
initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();