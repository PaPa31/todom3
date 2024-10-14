let selectedFile = null; // To track the selected file

function createDirectoryModal(
  directories,
  onDirectorySelected,
  onBackButtonClick,
  save = false,
  resolve
) {
  const existingModal = document.getElementById("directoryModal");
  if (existingModal) {
    existingModal.remove(); // Remove the existing modal
  }

  const modalContainer = document.createElement("div");
  modalContainer.id = "directoryModal";
  modalContainer.classList.add("modal-container");
  modalContainer.style.display = "block";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content", "flex-row");

  const buttonLine = document.createElement("div");
  buttonLine.classList.add("button-line");

  const topSection = document.createElement("div");
  topSection.classList.add("top-section", "flex-small");

  const contentSection = document.createElement("div");
  contentSection.classList.add("content-section", "flex-small");

  let inputField;
  if (save) {
    inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = initialFileName;
    inputField.placeholder = "Enter file name";
    topSection.appendChild(inputField);
    inputField.addEventListener("input", function () {
      initialFileName = inputField.value.trim();
    });

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save Here";
    saveButton.onclick = function () {
      const newFileName = inputField.value.trim();
      if (newFileName) {
        saveDirectory = currentDirectory;
        modalContainer.style.display = "none";
        document.documentElement.style.overflow = "";
        initialFileName = null;
        resolve(newFileName);
      }
    };
    buttonLine.appendChild(saveButton);
  } else {
    const openButton = document.createElement("button");
    openButton.textContent = "Open";
    openButton.onclick = function () {
      if (selectedFile) {
        onOpenButtonClick(selectedFile);
        modalContainer.style.display = "none";
        document.documentElement.style.overflow = "";
      } else {
        alert("Please select a file to open."); // Show a message if no file selected
      }
    };
    buttonLine.appendChild(openButton);
  }

  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.style.visibility = "hidden";
  backButton.onclick = function () {
    currentDirectory = directoryStack.pop();
    openDirectory(currentDirectory, save).then(resolve);
  };

  buttonLine.appendChild(backButton);
  topSection.appendChild(buttonLine);

  const directoryList = document.createElement("ul");

  directories.forEach((directory) => {
    const listItem = document.createElement("li");
    const directoryLink = document.createElement("a");
    directoryLink.href = "javascript:void(0)";
    directoryLink.textContent = directory.name;

    if (directory.isDirectory) {
      directoryLink.classList.add("directory-link");
      directoryLink.onclick = function () {
        directoryStack.push(currentDirectory);
        openDirectory(`${currentDirectory}/${directory.name}`, save).then(
          resolve
        );
        selectedFile = null; // Clear selected file when a directory is clicked
        clearFileSelection(); // Remove selection styling
      };
    } else {
      directoryLink.classList.add("file-link");
      directoryLink.onclick = function () {
        if (selectedFile) {
          selectedFile.classList.remove("selected"); // Remove previous selection
        }
        directoryLink.classList.add("selected"); // Mark this file as selected
        selectedFile = directoryLink; // Track the selected file
      };
    }

    listItem.appendChild(directoryLink);
    directoryList.appendChild(listItem);
  });

  contentSection.appendChild(directoryList);
  modalContent.appendChild(topSection);
  modalContent.appendChild(contentSection);

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  document.documentElement.style.overflow = "hidden";

  window.addEventListener("click", function (event) {
    if (event.target === modalContainer) {
      modalContainer.style.display = "none";
      document.documentElement.style.overflow = "";
      initialFileName = null;
      resolve(null);
    }
  });
}

function clearFileSelection() {
  const selectedElements = document.querySelectorAll(".file-link.selected");
  selectedElements.forEach((element) => element.classList.remove("selected"));
}
