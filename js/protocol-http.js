//alert('HTTP')

//var phrase = "static/demo.md";
//var phrase = "md/chron/2024-02/12-120508-best-pc-games.md";

//const rootDirectory = "../public/md/chron/";
//const rootDirectory = "public/md/chron/";
const rootDirectory = "webdav/md/chron";

let initialFileName = null;

// Directory stack to keep track of the visited directories
const directoryStack = [];

let saveDirectory = rootDirectory;

//function onSaveButtonClick() {
//  const fileName =
//    getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
//  const fileContent = input.value;
//  saveFileHttp(fileName, fileContent); // Save the file using the selected directory
//}

async function openAllFiles(currentDirectory) {
  console.log("Start loading!!");

  const includeNestedFiles = document.getElementById(
    "nestedFilesCheckbox"
  ).checked;

  // Fetch files, including nested directories only if the checkbox is checked
  await getFileHttp(currentDirectory, includeNestedFiles);

  console.log("А теперь - дискотека!!!");
  afterHttpOpen();
}

async function openSelectedFiles(fileLinks) {
  console.log("Start loading!!");

  // Loop through each selected file and fetch the file content
  for (let fileLink of fileLinks) {
    const filePath = `${currentDirectory}/${fileLink.textContent.trim()}`; // Get file path from the link text

    try {
      await getFileHttp(filePath); // Fetch each selected file content
      console.log(`Loaded file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to load file: ${filePath}`, error);
    }
  }

  console.log("А теперь - дискотека!!!");
  afterHttpOpen();
}

function afterHttpOpen() {
  initialCheckFold(isFoldFiles);
  allLiFold(!isFoldFiles, "todomFoldFiles", indexedFiles, filesArray);
  showOrHideDeleteAllItems();
  showItemSortingArrows(foldedClass.childElementCount);
}

// Function to handle directory selection
//function onDirectorySelected(selectedDirectory) {
//  // Push the current directory onto the stack
//  directoryStack.push(currentDirectory);
//  // Concatenate the current directory and the selected one
//  const newPath = `${currentDirectory}/${selectedDirectory}`;

//  // Fetch and update data for the selected directory
//  openDirectory(newPath);
//}

// Function to handle the Back button click
//async function onBackButtonClick() {
//  try {
//    // Pop the last directory from the stack
//    const previousPath = directoryStack.pop();

//    // Update the current directory to the previous one
//    currentDirectory = previousPath;

//    // Fetch data for the previous directory
//    const response = await fetch(
//      `http://192.168.0.14:8000/open-directory?path=${previousPath}`,
//      {
//        method: "GET",
//        mode: "cors",
//      }
//    );

//    const fileTree = await response.json();

//    if (fileTree.success) {
//      // Update the UI with data for the previous directory
//      createDirectoryModal(
//        fileTree.tree.map((file) => file.name),
//        onDirectorySelected,
//        onBackButtonClick
//      );
//    } else {
//      console.error(fileTree.error);
//    }
//  } catch (error) {
//    console.error(error);
//  }
//}

// Function to open a directory
async function openDirectory(directoryPath, save = false) {
  return new Promise(async (resolve, reject) => {
    // Wrap in Promise
    try {
      // Remove trailing slashes
      directoryPath = directoryPath.replace(/\/+$/, "");

      // Update the current directory when navigating into a new directory
      currentDirectory = directoryPath;

      const response = await fetch(
        `protocol-http.cgi?action=open-directory&path=${encodeURIComponent(
          directoryPath
        )}`,
        {
          method: "GET",
        }
      );

      const fileTree = await response.json();

      if (fileTree.success) {
        // Show the directory modal with the correct behavior (open or save)
        createDirectoryModal(
          fileTree.tree.map((file) => file),
          //onDirectorySelected(currentDirectory),
          (selectedDirectory) => {
            // Push the current directory onto the stack
            directoryStack.push(currentDirectory);
            openDirectory(`${directoryPath}/${selectedDirectory}`, save).then(
              resolve
            );
          },
          () => {
            currentDirectory = directoryStack.pop();
            openDirectory(currentDirectory, save).then(resolve);
          },
          //onBackButtonClick,
          save,
          resolve // Pass resolve to resolve when modal is done
        );
      } else {
        reject(fileTree.error);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to create and show the directory modal
function createDirectoryModal(
  directories,
  onDirectorySelected,
  onBackButtonClick,
  save = false,
  resolve
) {
  let selectedFiles = []; // Array to track multiple selected files

  // Check if the modal already exists
  const existingModal = document.getElementById("directoryModal");
  if (existingModal) {
    existingModal.remove(); // Remove the existing modal
  }

  // Create modal container
  const modalContainer = document.createElement("div");
  modalContainer.id = "directoryModal";
  modalContainer.classList.add("modal-container");
  modalContainer.style.display = "block"; // Make it visible

  // Create modal content
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content", "flex-row");

  const buttonLine = document.createElement("div");
  buttonLine.classList.add("button-line");

  const topSection = document.createElement("div");
  topSection.classList.add("top-section", "flex-small");

  const contentSection = document.createElement("div");
  contentSection.classList.add("content-section", "flex-small");

  // Add input for file name if in save mode
  let inputField;

  const soButton = document.createElement("button");

  if (save) {
    if (initialFileName === null) {
      initialFileName =
        getCurrentDate() + "-" + getFirstCharsWithTrim(input.value) + ".md";
    }
    // Create "Create Folder" button
    const createFolderButton = document.createElement("button");
    createFolderButton.textContent = "Create Folder";
    createFolderButton.onclick = function () {
      const folderName = prompt("Enter new folder name:");
      if (folderName && folderName.trim()) {
        createNewFolder(currentDirectory, folderName.trim()).then(() => {
          // Refresh the directory listing after creating the folder
          openDirectory(currentDirectory, save).then(resolve);
        });
      }
    };

    // Create file name input field
    inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = initialFileName;
    inputField.placeholder = "Enter file name"; // Placeholder text
    topSection.appendChild(inputField);

    // Add an event listener to update the global `initialFileName` when the user changes the input
    inputField.addEventListener("input", function () {
      initialFileName = inputField.value.trim(); // Update the global variable
    });

    // Create save button
    soButton.textContent = "Save Here";
    soButton.onclick = function () {
      const newFileName = inputField.value.trim();
      if (newFileName) {
        saveDirectory = currentDirectory; // Set the current directory as the save location
        modalContainer.style.display = "none";
        document.documentElement.style.overflow = "";

        // Reset `initialFileName` after saving
        initialFileName = null;

        resolve(newFileName); // Resolve with the new file name
      }
    };
    buttonLine.appendChild(createFolderButton);
  } else {
    // Add this checkbox near the "Open" button in the modal
    const nestedFilesCheckbox = document.createElement("input");
    nestedFilesCheckbox.type = "checkbox";
    nestedFilesCheckbox.id = "nestedFilesCheckbox";
    nestedFilesCheckbox.checked = false; // Default: do not include nested files

    const nestedFilesLabel = document.createElement("label");
    nestedFilesLabel.for = "nestedFilesCheckbox";
    nestedFilesLabel.textContent = "Include nested files";
    topSection.appendChild(nestedFilesCheckbox);
    topSection.appendChild(nestedFilesLabel);

    const openAllButton = document.createElement("button");
    openAllButton.textContent = "Open All Files";
    openAllButton.onclick = function () {
      openAllFiles(currentDirectory);

      modalContainer.style.display = "none"; // Hide the modal after opening files
      // Remove the style to allow scrolling
      document.documentElement.style.overflow = "";
    };
    buttonLine.appendChild(openAllButton);

    // Create open button
    soButton.textContent = "Open";
    soButton.onclick = function () {
      if (selectedFiles.length > 0) {
        openSelectedFiles(selectedFiles); // Pass all selected files to be opened
        modalContainer.style.display = "none";
        document.documentElement.style.overflow = "";
      } else {
        alert("Please select at least one file to open.");
      }
    };
  }

  // Create back button
  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.style.visibility =
    directoryStack.length > 0 ? "visible" : "hidden";
  backButton.onclick = function () {
    currentDirectory = directoryStack.pop();
    openDirectory(currentDirectory, save).then(resolve);
  };

  buttonLine.appendChild(backButton);
  buttonLine.appendChild(soButton);

  // Create close button
  const closeButton = document.createElement("div");
  closeButton.classList.add("close");
  closeButton.innerHTML = "&times;"; // Times symbol for close
  closeButton.onclick = function () {
    modalContainer.style.display = "none"; // Hide the modal on close
    // Remove the style to allow scrolling
    document.documentElement.style.overflow = "";

    // Reset `initialFileName` if the modal is closed
    initialFileName = null;

    resolve(null); // Resolve with null when modal is closed
  };

  // Append close button to content
  buttonLine.appendChild(closeButton);
  topSection.appendChild(buttonLine);

  // Check if the directory stack is empty to decide whether to show the back button
  if (directoryStack.length > 0) {
    // Append back button to content
    backButton.style.visibility = "visible";
  }

  // Create directory list
  const directoryList = document.createElement("ul");

  // Populate directory list
  directories.forEach((directory) => {
    const listItem = document.createElement("li");
    const directoryLink = document.createElement("a");
    directoryLink.href = "javascript:void(0)";
    directoryLink.textContent = directory.name;

    // if it's a directory, open it
    if (directory.isDirectory) {
      directoryLink.classList.add("directory-link");
      directoryLink.onclick = function () {
        directoryStack.push(currentDirectory);
        openDirectory(`${currentDirectory}/${directory.name}`, save).then(
          resolve
        );
        selectedFiles = []; // Clear selected files when a directory is clicked
        clearFileSelection(); // Remove selection styling
      };
    } else {
      // If it's a file, style it and handle file opening on click
      directoryLink.classList.add("file-link"); // Apply file styling
      directoryLink.onclick = function () {
        if (save) {
          inputField.value = directory.name;
        } else {
          if (directoryLink.classList.contains("selected")) {
            // If the file is already selected, deselect it
            directoryLink.classList.remove("selected");
            selectedFiles = selectedFiles.filter(
              (file) => file !== directoryLink
            ); // Remove from the selected list
          } else {
            // Select this file (allow multiple selections)
            directoryLink.classList.add("selected");
            selectedFiles.push(directoryLink); // Add to the selected list
          }
        }
      };
    }

    listItem.appendChild(directoryLink);
    directoryList.appendChild(listItem);
  });

  // Append directory list to content
  contentSection.appendChild(directoryList);

  modalContent.appendChild(topSection);
  modalContent.appendChild(contentSection);

  // Append content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to the document body
  document.body.appendChild(modalContainer);

  // Add the style to hide scrollbar thumb
  document.documentElement.style.overflow = "hidden";

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === modalContainer) {
      modalContainer.style.display = "none";
      // Remove the style to allow scrolling
      document.documentElement.style.overflow = "";

      // Reset `initialFileName` if clicking outside the modal
      initialFileName = null;

      resolve(null);
    }
  });
}

function clearFileSelection() {
  const selectedElements = document.querySelectorAll(".file-link.selected");
  selectedElements.forEach((element) => element.classList.remove("selected"));
}

// Example: Attach this function to your "Open Directory" button
function httpProtocolOpenDirectoryClick() {
  openDirectory(rootDirectory);
}

const dir = "md/chron/2023-12/";

const fileHttpHandler = (name, dir, size, text) => {
  const fileObj = {
    name: name,
    //dir: res.webkitRelativePath,
    size: size,
    text: text,
  };
  filesArray.push(fileObj);
  //indexedFiles.push(idCounterFiles.toString());
  //liDomMaker(idCounterFiles);
  //idCounterFiles++;
  indexedFiles.push(idCounterFiles.toString());
  const correctedFilesIndex =
    indexedFiles.indexOf(idCounterFiles.toString()) * 1;
  filesArray[correctedFilesIndex].text = text;
  liDomMaker(idCounterFiles);
  idCounterFiles++;
};

// Recursive function for downloading files
const getFileHttp = async (fileName, includeNestedFiles = false) => {
  try {
    const response = await fetch(
      `protocol-http.cgi?action=open-directory&path=${encodeURIComponent(
        fileName
      )}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Bad response from server");
    }

    let isJSON = false;
    let directoryListing;

    try {
      // Clone the response to avoid reading the body more than once
      const clonedResponse = response.clone();
      // Attempt to parse the response as JSON
      directoryListing = await clonedResponse.json();
      isJSON = true;
    } catch (jsonError) {
      // Parsing as JSON failed; treat it as a regular file
      isJSON = false;
    }

    if (isJSON && directoryListing && Array.isArray(directoryListing.tree)) {
      // It's a directory; create an array of promises for each file
      // or It's a directory; get files
      const filePromises = directoryListing.tree.map(async (file) => {
        const filePath = fileName + "/" + file.name;

        if (!file.isDirectory) {
          // If it's a file, process it
          await getFileHttp(filePath);
        } else if (includeNestedFiles && file.isDirectory) {
          // If nested files are allowed, process the directory
          await getFileHttp(filePath, includeNestedFiles);
        }
      });

      // Wait for all files and directories to be processed
      await Promise.all(filePromises);
    } else {
      // Handle the file content here
      const text = await response.text();
      fileHttpHandler(fileName, null, text.length, text);
    }
  } catch (error) {
    console.error(error);
  }
};

function encodeBase64UTF8(input) {
  return btoa(unescape(encodeURIComponent(input)));
}

// Function to save the file content to the server
async function saveFileHttp(fileName, fileContent) {
  try {
    console.log(`File size: ${fileContent.length} bytes`);
    const formData = new FormData();
    const filePath = `${saveDirectory}/${fileName}`;
    formData.append("filename", filePath);
    formData.append(
      "file",
      new Blob([fileContent], {
        type: "text/plain; charset=utf-8",
      }),
      filePath
    );
    formData.append("overwrite", "false");
    //formData.append("file", fileContent);
    //formData.append("overwrite", "false");

    // this forEach block only for console.log formData :)
    formData.forEach((value, key) => {
      if (value instanceof File) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log(`File content for ${key}:`, reader.result);
        };
        reader.readAsText(value);
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    const response = await fetch(`upload.cgi`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.fileExists) {
      const userWantsToOverwrite = confirm(
        `File "${fileName}" already exists. Do you want to overwrite it?`
      );
      if (userWantsToOverwrite) {
        // Retry with overwrite set to true
        formData.set("overwrite", "true");
        const overwriteResponse = await fetch(`upload.cgi`, {
          method: "POST",
          body: formData,
        });

        const overwriteResult = await overwriteResponse.json();
        if (overwriteResult.success) {
          console.log("File overwritten successfully.");
        } else {
          console.error("Error overwriting file: ", overwriteResult.message);
        }
      } else {
        console.log("File save canceled by user.");
      }
    } else if (result.success) {
      console.log("File saved successfully.");
    } else {
      console.error("File save failed: ", result.message);
    }
  } catch (error) {
    console.error("Error saving the file: ", error);
  }
}

// Function to create a new folder
async function createNewFolder(currentDirectory, folderName) {
  try {
    const response = await fetch(`protocol-http.cgi?action=create-folder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        directory: currentDirectory,
        folderName: folderName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create folder.");
    }

    const result = await response.json();
    console.log("Folder created successfully:", result);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
}

async function passFolderHttp(folderName) {
  const folderPath = rootDirectory + "/" + folderName;
  const newFileName = await openDirectory(folderPath, true);
  if (!newFileName) {
    console.log("Save operation canceled or no file name provided.");
    return;
  }
  saveFileHttp(newFileName, input.value);
}
