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
          (selectedDirectory) => {
            // Push the current directory onto the stack
            directoryStack.push(currentDirectory);
            openDirectory(`${directoryPath}/${selectedDirectory}`, save).then(
              resolve
            );
          },
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
async function createDirectoryModal(
  directories,
  onDirectorySelected,
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
  modalContent.addEventListener("click", function (event) {
    event.stopPropagation();
  });


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
      const savedDate = getSavedDate();
      const datePartFileName = savedDate.substring(8);
      const meaningPartName = await processFilename(input.value);
      initialFileName = datePartFileName + "-" + meaningPartName + ".md";
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
        html.style.overflow = "";

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
      html.style.overflow = "";
    };
    buttonLine.appendChild(openAllButton);

    // Create open button
    soButton.textContent = "Open";
    soButton.onclick = function () {
      if (selectedFiles.length > 0) {
        openSelectedFiles(selectedFiles); // Pass all selected files to be opened
        modalContainer.style.display = "none";
        html.style.overflow = "";
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
    html.style.overflow = "";

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
  html.style.overflow = "hidden";

  // Close modal when clicking outside of it
  modalContainer.addEventListener("click", function handleModalClick(event) {
    if (event.target === modalContainer) {
      modalContainer.style.display = "none";

      // Remove the style to allow scrolling
      html.style.overflow = "";

      // Reset `initialFileName` if clicking outside the modal
      initialFileName = null;

      resolve(null);

      // 🧼 Optional: remove the listener if the modal won't be reused immediately
      modalContainer.removeEventListener("click", handleModalClick);
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

async function saveFileHttp(fileName, fileContent) {
  if (!fileName || !fileContent) {
    console.error("Invalid file name or content.");
    return;
  }

  const path = `${saveDirectory}/${fileName}`;
  const url = `cgi-bin/binary-file-upload.sh?${encodeURIComponent(path)}`;

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/octet-stream");

  xhr.onload = function () {
    const response = xhr.responseText.trim();

    if (xhr.status >= 200 && xhr.status < 300) {
      if (response === "EXTRA_OVERWRITE_NEEDED") {
        if (confirm("File already exists. Do you want to overwrite it?")) {
          sendExtraInfo(url, "overwrite=true");
        } else {
          console.log("User canceled file overwrite.");
        }
      } else {
        console.log("File uploaded successfully:", response);
      }
    } else {
      console.error("Upload failed:", xhr.status, xhr.statusText, response);
    }
  };

  xhr.onerror = function () {
    console.error("Network error occurred during upload.");
  };

  try {
    xhr.send(fileContent);
  } catch (err) {
    console.error("Error during upload:", err);
  }
}

function sendExtraInfo(url, extraData) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${url}&${extraData}`, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      console.log("File saved with extra confirmation:", xhr.responseText);
    } else {
      console.error("Extra request failed:", xhr.status, xhr.statusText);
    }
  };

  xhr.onerror = function () {
    console.error("Network error during extra request.");
  };

  try {
    xhr.send(); // No file content sent in second request
  } catch (err) {
    console.error("Error during extra request:", err);
  }
}

// Function to save the file content to the server
async function saveFileHttp2(fileName, fileContent) {
  try {
    const startTotal = performance.now(); // Start overall timer

    console.log(`File size: ${fileContent.length} bytes`);
    const formData = new FormData();
    const filePath = `${saveDirectory}/${fileName}`;
    formData.append("filename", filePath);

    //const fileBlob = new Blob([fileContent], {
    //  type: "text/plain; charset=utf-8",
    //});
    formData.append("file", fileContent); // Directly append content as string
    formData.append("overwrite", "false");
    //formData.append("file", fileContent);
    //formData.append("overwrite", "false");

    // Timer for preparing FormData
    //const startFormData = performance.now();
    // this forEach block only for console.log formData :)
    //formData.forEach((value, key) => {
    //  if (value instanceof File) {
    //    const reader = new FileReader();
    //    reader.onload = () => {
    //      console.log(`File content for ${key}:`, reader.result);
    //    };
    //    reader.readAsText(value);
    //  } else {
    //    console.log(`${key}: ${value}`);
    //  }
    //});
    const endFormData = performance.now();
    //console.log(
    //  `Time to prepare FormData: ${(endFormData - startFormData).toFixed(2)} ms`
    //);
    console.log(
      `Time to prepare FormData: ${(endFormData - startTotal).toFixed(2)} ms`
    );

    // Timer for sending the HTTP request
    const startRequest = performance.now();
    const response = await fetch(`upload-test.cgi`, {
      method: "POST",
      body: formData,
    });
    const endRequest = performance.now();
    console.log(
      `Time to send HTTP request and receive response: ${(
        endRequest - startRequest
      ).toFixed(2)} ms`
    );

    const startResponseParse = performance.now();
    const result = await response.json();
    const endResponseParse = performance.now();
    console.log(
      `Time to parse server response: ${(
        endResponseParse - startResponseParse
      ).toFixed(2)} ms`
    );

    if (result.fileExists) {
      const userWantsToOverwrite = confirm(
        `File "${fileName}" already exists. Do you want to overwrite it?`
      );
      if (userWantsToOverwrite) {
        const startOverwriteRequest = performance.now();
        // Retry with overwrite set to true
        formData.set("overwrite", "true");
        const overwriteResponse = await fetch(`upload-test.cgi`, {
          method: "POST",
          body: formData,
        });
        const overwriteResult = await overwriteResponse.json();
        const endOverwriteRequest = performance.now();
        console.log(
          `Time for overwrite request: ${(
            endOverwriteRequest - startOverwriteRequest
          ).toFixed(2)} ms`
        );

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

    const endTotal = performance.now();
    console.log(
      `Total time for saveFileHttp function: ${(endTotal - startTotal).toFixed(
        2
      )} ms`
    );
  } catch (error) {
    console.error("Error saving the file: ", error);
  }
}

// Function to create a new folder
async function createNewFolder(directory, folderName, confirmFlag = false) {
  if (!directory || !folderName) {
    console.error("Invalid directory or folder name.");
    return false; // ⬅️ Return false for invalid input
  }

  // Initial request without confirmation
  let requestData = JSON.stringify({
    directory,
    folderName,
    confirm: confirmFlag,
  });

  let response = await fetch("protocol-http.cgi?action=create-folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestData,
  });

  let data = await response.json();

  // Handle server response
  if (data.success) {
    console.log("✅ Folder created successfully.");
    return true; // ✅ SUCCESS, folder created!
  } else if (data.message === "EXTRA_DIRECTORY_CREATE_NEEDED") {
    if (
      !confirm(
        `The parent directory '${folderName}' directory does not exist. \nDo you want to create it?`
      )
    ) {
      console.log(`🚫 User canceled "${folderName}" directory creation.`);
      return false;
    }

    // Retry request with confirmation
    requestData = JSON.stringify({ directory, folderName, confirm: true });

    response = await fetch("protocol-http.cgi?action=create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestData,
    });

    data = await response.json();

    if (data.success) {
      console.log("✅ Folder created successfully on second attempt.");
      return true;
    } else {
      console.error("❌ Failed to create folder:", data.message);
      return false;
    }
  } else if (data.message === "Folder already exists.") {
    console.log("✅ Folder already exists, proceeding...");
    return true; // ✅ Folder exists, so we proceed!
  } else {
    console.error("❌ Failed to create folder:", data.message);
    return false;
  }
}

async function passFolderHttp(folderName) {
  const folderPath = rootDirectory + "/" + folderName;
  console.log("📂 Attempting to create/open folder:", folderPath);

  // 🟢 Add true, to create folderName (yyyy-mm) automatically
  const folderCreated = await createNewFolder(rootDirectory, folderName, true);
  console.log("📂 Folder creation result:", folderCreated);
  if (!folderCreated) {
    console.log("❌ Failed to create folder or user canceled.");
    return;
  }

  // 🟢 Now, proceed to save the file
  const newFileName = await openDirectory(folderPath, true);
  console.log("📂 Open directory result:", newFileName);

  if (!newFileName) {
    console.log("❌ Save operation canceled or no file name provided.");
    return;
  }

  console.log("💾 Attempting to save file:", newFileName);
  saveFileHttp(newFileName, ensureFinalNewline(input.value));
  return newFileName;
}
