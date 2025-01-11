"use strict";
const html = document.documentElement;
const form = document.querySelector("form");

const input = document.getElementById("input");
const preview = document.getElementById("preview");

const xButton = document.getElementById("x-button");
const returnInputButton = document.getElementById("return-last-input");

const deleteAllItemsButton = document.getElementById("delete-all-items");
const restoreTrashedItemButton = document.getElementById(
  "restore-trashed-item"
);
const clearTrashButton = document.getElementById("clear-trash");
const undoLastDeleteButton = document.getElementById("undo-delete");
const saveAsOldButton = document.getElementById("save-as-old");
const saveAsNewButton = document.getElementById("save-as-new");
const saveAsFileButton = document.getElementById("save-as-file");
const openFileButton = document.getElementById("open-file");
const openDirButton = document.getElementById("open-dir");

const trashedCounter = document.getElementById("trashed-counter");
const deletedCounter = document.getElementById("deleted-counter");

const output = document.getElementById("output");
const position = document.getElementById("position");

const inputLabel = document.getElementById("input-label");

clearTrashButton.classList.add("invisible", "none");
clearTrashButton.removeAttribute("style");

deleteAllItemsButton.classList.add("invisible");
deleteAllItemsButton.removeAttribute("style");

saveAsFileButton.classList.add("inline-block");

saveAsOldButton.classList.add("none");
saveAsOldButton.removeAttribute("style");

openDirButton.classList.add("none");
openDirButton.removeAttribute("style");

restoreTrashedItemButton.classList.add("invisible", "none");
restoreTrashedItemButton.removeAttribute("style");

undoLastDeleteButton.classList.add("invisible", "none");
undoLastDeleteButton.removeAttribute("style");

inputLabel.classList.add("invisible");
inputLabel.removeAttribute("style");

input.removeAttribute("style");
input.classList.add("border");

returnInputButton.style = "display:none";

let variant = true;

const scrollToLast = () => {
  preview.scrollIntoView(false);
  input.focus();
};

const editUI = (label) => {
  input.classList.replace("border", "border-edit");
  xButton.title = "Cancel edit";

  inputLabel.innerHTML = `<span>Edit: </span><span>${label}</span>`;
  inputLabel.classList.replace("invisible", "visible");
  input.setAttribute("placeholder", "Edit");

  scrollToLast();

  intervalFocus(
    form,
    "background-color: var(--todom-textEdit-background);",
    300
  );
};

const xUI = () => {
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
  position.innerHTML = "";
};

const splitSaveItemButton = () => {
  saveAsOldButton.classList.replace("none", "inline-block");
  saveAsNewButton.classList.add("button-edit");
  saveAsNewButton.innerText = "Save as new";
};

const joinSaveItemButton = () => {
  saveAsOldButton.classList.replace("inline-block", "none");
  //saveAsNewButton.removeAttribute("style");
  saveAsNewButton.classList.remove("button-edit");
  saveAsNewButton.innerText = "Save item";
};

const editItem = (e, editButtonElem, parentLi) => {
  const itemIndexToEdit2 = indexedItems.indexOf(parentLi.id) * 1;

  let currentSave = getCurrentSpec("save", itemIndexToEdit2);
  const textArr = itemsArray[itemIndexToEdit2].text;

  const editing = textArr[currentSave].variant;
  if (e.ctrlKey) {
    intervalFocus(
      editButtonElem,
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
    editedItemLiDOM = parentLi;
    intervalFocus(
      editButtonElem,
      "background-color: var(--todom-textEdit-background);",
      300
    );
    input.value = editing;
    splitSaveItemButton();
    editUI("#" + (itemIndexToEdit + 1));
  }
  xUI();
  mdToPreview(input.value);
};

const inputLabelNewOrEdit = (indexToDelete) => {
  if (itemIndexToEdit != null && itemIndexToEdit >= indexToDelete) {
    if (itemIndexToEdit == indexToDelete) {
      defaultMarkers();
      inputLabel.innerHTML = "<div>New</div>";
    } else {
      itemIndexToEdit = itemIndexToEdit - 1;
      inputLabel.innerHTML = `<span>Edit: </span><span>#${
        itemIndexToEdit + 1
      }</span>`;
    }
  }
};

const putItemToTrash = (indexToTrash) => {
  trashArray.push(itemsArray[indexToTrash]);
  trashedCounter.innerText = trashArray.length;
  restoreTrashedItemButton.classList.replace("invisible", "visible");
  clearTrashButton.classList.replace("invisible", "visible");
  localStorage.setItem("todomTrashArray", JSON.stringify(trashArray));
};

const putItemToDeletedArray = (indexToDelete) => {
  deletedArray.push(itemsArray[indexToDelete]);
  deletedCounter.innerText = deletedArray.length;
  undoLastDeleteButton.classList.replace("invisible", "visible");
};

const putSaveAndDateToDeletedArray = (deletedText, deletedDate) => {
  const deletedObj = {
    text: [{ variant: deletedText, date: deletedDate }],
  };

  deletedArray.push(deletedObj);
  deletedCounter.innerText = deletedArray.length;
  undoLastDeleteButton.classList.replace("invisible", "visible");
};

const removeItemFromMemory = (item, indexToDelete) => {
  inputLabelNewOrEdit(indexToDelete);

  foldedClass.removeChild(item);
  showItemSortingArrows(foldedClass.childElementCount);

  itemsArray.splice(indexToDelete, 1);
  indexedItems.splice(indexToDelete, 1);
  itemsSpecArray.splice(indexToDelete, 1);

  showOrHideDeleteAllItems();

  if (itemsArray.length == 0) {
    defaultItemStateVars();
    localStorage.removeItem("todomItemsArray");
    localStorage.removeItem("todomItemsSpecArray");
  } else {
    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
    localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));
  }
};

const deleteOneItem = (e, liDOM) => {
  e.stopPropagation();
  if ((twoClickToTrash && liDOM.id === lastClickId) || e.ctrlKey) {
    const indexToDelete = indexedItems.indexOf(liDOM.id) * 1;

    if (!e.ctrlKey) {
      putItemToTrash(indexToDelete);
    } else {
      putItemToDeletedArray(indexToDelete);
    }

    removeItemFromMemory(liDOM, indexToDelete);

    twoClickToTrash = false;
    lastClickId = undefined;
  } else {
    if (lastItem)
      lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
    lastClickId = liDOM.id;
    liDOM.querySelector(".delete-one-item").classList.add("filter-red");
    lastItem = liDOM;
    twoClickToTrash = true;
  }
  if (lastItem && e.ctrlKey)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
  if (twoClickTrashClear || e.ctrlKey) {
    clearTrashButton.classList.remove("filter-red");
  }
  twoClickTrashClear = false;
};

const showItemSortingArrows = (count) => {
  const arrows = document.getElementById("list-order");
  if (count > 1) {
    //with only opacity rule the arrows are hidden but still clickable
    arrows.style = "";
  } else {
    arrows.style = "visibility: hidden; opacity: 0";
  }
};

const mdToPreview = (markdownString) => {
  preview.innerHTML = markdown(markdownString);
};

const debounce = (func, wait, immediate) => {
  let timeout;
  return function counter() {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const intervalFocus = (element, cssRule, interval) => {
  element.style = cssRule;
  window.setTimeout(function () {
    element.removeAttribute("style");
  }, interval);
};

function scrollToTargetAdjusted(targetElement, offset) {
  const elementPosition = targetElement.getBoundingClientRect().top;
  const offsetPosition = elementPosition + offset;

  if (window.innerHeight < offsetPosition)
    window.scrollBy({
      top: offsetPosition,
    });

  intervalFocus(
    targetElement,
    "background-color: var(--todom-textEdit-background);",
    300
  );
}

function splitDateIntoFolderNameAndFileName() {
  let savedDate;

  if (itemIndexToEdit != null) {
    const currentSave = itemsSpecArray[itemIndexToEdit].save;
    const textArr = itemsArray[itemIndexToEdit].text;
    const date = textArr[currentSave].date;
    savedDate =
      textArr && date !== "0000-00-00-000000" ? date : getFullCurrentDate();
  } else {
    savedDate = getFullCurrentDate();
  }
  const dateFolderName = savedDate.substring(0, 7);
  const datePartFileName = savedDate.substring(8);

  return { dateFolderName, datePartFileName };
}

const saveItemFromFile = (fileName) => {
  foldedClass = document.getElementById("list-items");
  isItemState = !isItemState;

  const itemIndex = itemsArray.findIndex((s) => s.name && s.name === fileName);
  if (itemIndex !== -1) {
    const itemId = indexedItems[itemIndex];
    const liDOM = document.getElementById(itemId);
    liDOM.classList.add("new-from-file");

    newSave(liDOM, itemIndex);
  } else {
    const itemObj = {
      text: [{ variant: input.value, date: getFullCurrentDate() }],
      name: fileName,
    };
    const specObj = { save: 0 };

    pushItemArrays(itemObj, specObj);
    indexedItems.push(idCounterItems.toString());
    liDomMaker(idCounterItems, "new-from-file");
    idCounterItems++;
  }
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));

  foldedClass = document.getElementById("list-files");
  isItemState = !isItemState;
};

function drawFile(fileSize) {
  const previewOffset = preview.scrollTop;
  let fileName;
  if (fileIndexToEdit != null) {
    fileName = filesArray[fileIndexToEdit].name;
    const resizableDiv = editedFileLiDOM.querySelector(".resizable-div");
    mdToTagsWithoutShape(resizableDiv, filesArray[fileIndexToEdit].text);
    addOrRemoveScrollObserverToLi(editedFileLiDOM);
    scrollToTargetAdjusted(editedFileLiDOM, previewOffset);
  } else {
    fileName = filesArray[idCounterFiles].name;
    filesArray[idCounterFiles].size = fileSize;
    liDomMaker(idCounterFiles);
    idCounterFiles++;
  }

  if (!isItemState) saveItemFromFile(fileName);

  updateUI6();
}

const fileDownload = async (drawItemOnly = false) => {
  const path = splitDateIntoFolderNameAndFileName();

  var blob = new Blob([input.value], {
    type: "text/plain;charset=utf-8",
  });

  const fileSize = blob.size;

  if (window.protocol === "file:") {
    //const meaningPartFileName = generateFileNameUniversal(input.value, true);
    const meaningPartFileName = processFilename(input.value);
    const fileName = path.datePartFileName + "-" + meaningPartFileName + ".md";
    await saveFileFile(fileName, blob, fileSize, drawItemOnly);
  } else {
    let newFileName = await passFolderHttp(path.dateFolderName);
    //I copy/pasted below check from nested passFolderHttp func
    // I don't if this is really necessary
    if (!newFileName) {
      console.log("Save operation canceled or no file name provided.");
      //return;
      //const meaningPartFileName = generateFileNameUniversal(input.value, true);
      const meaningPartFileName = processFilename(input.value);
      newFileName = path.datePartFileName + "-" + meaningPartFileName + ".md";
    }
    if (drawItemOnly) saveItem();
    else {
      pushFilesArray(newFileName);
      drawFile(fileSize);
    }
  }
};

function formatDate(date) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

function getCurrentDate() {
  var today = new Date();
  //var y = today.getFullYear();
  // JavaScript months are 0-based.
  //var m = ("0" + (today.getMonth() + 1)).slice(-2);
  var d = ("0" + today.getDate()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var hour = ("0" + today.getHours()).slice(-2);
  var t = hour + minutes + seconds;
  return d + "-" + t;
}

function getFullCurrentDate() {
  var today = new Date();
  var y = today.getFullYear();
  // JavaScript months are 0-based.
  var m = ("0" + (today.getMonth() + 1)).slice(-2);
  var d = ("0" + today.getDate()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var hour = ("0" + today.getHours()).slice(-2);
  var t = hour + minutes + seconds;
  return y + "-" + m + "-" + d + "-" + t;
}

//<-----------------Start--------------------->

// Step 1: Script Detection Function
// Enhanced Script Detection Function
function detectScript(text) {
  if (/[\u0400-\u04FF]/.test(text)) return "cyrillic"; // Cyrillic script
  if (/[\u0600-\u06FF]/.test(text)) return "arabic"; // Arabic script
  if (/^[\u0000-\u007F\u0100-\u017F\s-]+$/.test(text)) return "latin"; // Latin or already Latinized
  return "unknown"; // Default if no match
}

// Step 2: Transliteration Maps
const transliterationMaps = {
  cyrillic: {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  },
};

// Step 3: Transliteration with Character Maps
function transliterateWithCharMap(text) {
  const script = detectScript(text);
  const charMap = transliterationMaps[script];
  if (!charMap) return text; // No transliteration for Latin or unsupported scripts

  return text
    .split("") // Split into characters
    .map((char) => {
      const mappedChar = charMap[char];
      return mappedChar !== undefined ? mappedChar : char; // Ensure exact matches
    })
    .join(""); // Reassemble the string
}

// Step 4: Transliteration Library Loading
let libraryLoaded = false; // Track library load status globally

function loadTransliterationLibrary() {
  if (libraryLoaded) {
    //console.log("Library already loaded.");
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "libs/transliteration-2.3.5/bundle.umd.min.js"; // Path to the transliteration library
    script.async = true;

    script.onload = () => {
      if (typeof window.transliterate === "function") {
        libraryLoaded = true;
        //console.log("Transliteration library loaded successfully.");
        resolve();
      } else {
        reject(
          new Error(
            "Library loaded, but `transliterate` function is undefined."
          )
        );
      }
    };

    script.onerror = () =>
      reject(new Error("Failed to load transliteration library."));
    document.head.appendChild(script);
  });
}

async function transliterateWithLibrary(text, translitOrSlugify) {
  // Ensure library is loaded only once
  try {
    await loadTransliterationLibrary();

    if (typeof window[translitOrSlugify] === "function") {
      const result = window[translitOrSlugify](text);
      console.log("Library Transliteration or Slugification:", result);
      return result;
    } else {
      throw new Error(
        "Transliteration library loaded, but `transliterate` is undefined."
      );
    }
  } catch (err) {
    console.error("Error in transliterateWithLibrary:", err.message);
    throw err; // Bubble up to the main function
  }
}

// Step 5: Google Transliteration API Fallback
async function transliterateWithGoogle(text, apiKey) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const body = {
    q: text,
    target: "en",
    format: "text",
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data.data.translations[0].translatedText || text;
  } catch (error) {
    console.error("Google Transliteration API failed:", error);
    return text;
  }
}

// Step 6: Main Transliteration Function
async function transliterate3(text, apiKey, slug = false) {
  //console.log("Input Text:", text);

  // Step 1: Character map transliteration
  //const resultFromCharMap = transliterateWithCharMap(text);
  //if (resultFromCharMap !== text) {
  //  //console.log("CharMap Transliteration Result:", resultFromCharMap);
  //  return resultFromCharMap;
  //}

  // Step 2: Library transliteration
  try {
    const translitOrSlugify = slug ? "slugify" : "transliterate";
    const resultFromLibrary = await transliterateWithLibrary(
      text,
      translitOrSlugify
    );
    if (resultFromLibrary && resultFromLibrary !== text) {
      console.log("Library Transliteration Result:", resultFromLibrary);
      return resultFromLibrary;
    }
  } catch (err) {
    console.warn("Library transliteration failed:", err);
  }

  // Step 3: Google API transliteration
  //try {
  //  const resultFromGoogle = await transliterateWithGoogle(text, apiKey);
  //  if (resultFromGoogle && resultFromGoogle !== text) {
  //    console.log("Google API Transliteration Result:", resultFromGoogle);
  //    return resultFromGoogle;
  //  }
  //} catch (err) {
  //  console.error("Google API transliteration failed:", err);
  //}

  // Final fallback: return the original text
  console.warn("All transliteration methods failed. Returning original text.");
  return text;
}

// Step 7: Slugification
async function universalSlugifyDynamic(text, options = {}) {
  const { maxLength = 50 } = options;
  //console.log("Original Text for Latinized and Slugify:", text);

  // Step 1: Normalize and strip accents/diacritics
  let normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacritics

  //console.log("Normalized text:", normalizedText);

  // Step 2: Transliterate if not already Latinized
  if (!certainlyLatinized(normalizedText)) {
    console.log("Start of Latinization");

    normalizedText = await transliterate3(normalizedText, showPhrase());
  } else {
    console.log(
      "Text is already Latinized. Proceeding with slugification only."
    );
  }

  // Step 3: Replace invalid characters with a hyphen
  //const slugifiedText = normalizedText
  //  .replace(/[^\w\s-]+/g, "") // Remove non-alphanumeric characters
  //  .replace(/\s+/g, "-") // Replace spaces with hyphens
  //  .trim()
  //  .toLowerCase()
  //  .slice(0, maxLength); // Limit length to maxLength
  const slugifiedText = await transliterate3(
    normalizedText,
    showPhrase(),
    true
  );

  // Ensure filename is safe and ASCII-compatible
  //console.log("Slugified Filename:", slugifiedText || "unknown");
  return slugifiedText || "unknown"; // Fallback if slugification fails
}

// Step 8: Filename Generation
async function generateFileNameUniversal(noteContent, useTranslit = false) {
  const startTime = performance.now(); // Start timer
  //console.log("Original Note Content:", noteContent);

  const cleanedContent = noteContent
    .slice(0, 50)
    .replace(/[^\p{L}\p{N}\s]+/gu, "-")
    .trim()
    .toLowerCase();

  //console.log("Cleaned Note Content:", cleanedContent);

  const content = useTranslit
    ? await universalSlugifyDynamic(cleanedContent)
    : cleanedContent.replace(/\s+/g, "-").slice(0, 21).replace(/-$/, "");

  const endTime = performance.now();
  console.log(`Average Execution Time: ${(endTime - startTime).toFixed(4)} ms`);

  //console.log("Generated File Name Content:", content);

  return `${content}`;
}

// Detect if the text is certainly Latinized (already in Latin script)
function certainlyLatinized(text) {
  return detectScript(text) === "latin";
}

async function testLatinizationAndSlugification() {
  const testCases = [
    // Simple Latinized Text
    { input: "hello world", expected: "hello-world" },
    { input: "dynamic-slugifier", expected: "dynamic-slugifier" },
    { input: "neobrabotannyye dannyye", expected: "neobrabotannyye-dannyye" },

    // Non-Latin Script
    { input: "Привет мир", expected: "privet-mir" },
    { input: "مرحبا بالعالم", expected: "mrhb-blaalm" },
    { input: "你好，世界", expected: "ni-hao-shi-jie" },

    // Mixed Script
    { input: "Привет 123 world", expected: "privet-123-world" },
    { input: "مرحبا Hello", expected: "mrhb-hello" },
    { input: "你好123world", expected: "ni-hao-123-world" },

    // Special Characters
    { input: "hello @world!", expected: "hello-world" },
    { input: "Привет! Мир?", expected: "privet-mir" },

    // Excessively Long Inputs
    {
      input:
        "This is a very long string that exceeds fifty characters in length",
      expected: "this-is-a-very-long-string-that-exceeds-fifty-ch",
    },
    {
      input: "Очень длинный текст, превышающий лимит символов",
      expected: "ochen-dlinnyy-tekst-prevyshayushchiy-limit-simvo",
    },

    // Edge Cases
    { input: "", expected: "" },
    { input: "     ", expected: "" },
    { input: "@#$%^&*", expected: "" },
    { input: "𐍈𐍈𐍈", expected: "unknown" },
  ];

  let passedTests = 0;

  for (const { input, expected } of testCases) {
    //const output = await universalSlugifyDynamic(input, { maxLength: 50 });
    const output = await processFilename(input);
    const result = output === expected ? "PASSED" : "FAILED";

    console.log(
      `Input: "${input}"\nExpected: "${expected}"\nOutput: "${output}"\nResult: ${result}\n`
    );

    if (result === "PASSED") passedTests++;
  }

  console.log(
    `\n${passedTests}/${testCases.length} tests passed (${(
      (passedTests / testCases.length) *
      100
    ).toFixed(2)}%).`
  );
}
//testLatinizationAndSlugification();

// Function to dynamically load a script
function loadScript(url, callback) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onload = callback; // Execute callback once script is loaded
  script.onerror = () => console.error("Failed to load script:", url);
  document.head.appendChild(script);
}

// Flag to track if the transliteration library is already loaded
let transliterationLoaded = false;

// Function to process filenames with transliteration
function processFilename(originalFilename) {
  return new Promise((resolve, reject) => {
    // Check if the library is already loaded
    if (transliterationLoaded || window.transliterate) {
      // Transliterate and slugify the filename
      const latinized = transliterate(originalFilename);
      const slugified = slugify(latinized);
      resolve(slugified);
    } else {
      // Load the transliteration library dynamically
      loadScript("libs/transliteration-2.3.5/bundle.umd.min.js", () => {
        if (window.transliterate) {
          transliterationLoaded = true; // Mark as loaded
          // Transliterate and slugify the filename
          const latinized = transliterate(originalFilename);
          const slugified = slugify(latinized);
          resolve(slugified);
        } else {
          reject(new Error("Transliteration library not loaded"));
        }
      });
    }
  });
}

//<-----------------End----------------------->

function transliterate2(text) {
  const charMap = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ъ: "",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text
    .split("") // Split into characters
    .map((char) => {
      const mappedChar = charMap[char];
      return mappedChar !== undefined ? mappedChar : char; // Ensure exact matches
    })
    .join(""); // Reassemble the string
}

// Filename generation function
function generateFileNameUniversal2(noteContent, useTranslit = false) {
  const startTime = performance.now(); // Start timer
  // Trim and clean the content
  let cleanedContent = noteContent
    .slice(0, 50)
    .replace(/[^\p{L}\p{N}\s]+/gu, "")
    .trim()
    .toLowerCase();

  // Apply transliteration if enabled
  if (useTranslit) {
    //inspectUnicode(cleanedContent);
    cleanedContent = transliterate2(cleanedContent);
  }

  // Replace spaces with hyphens and truncate to the first 21 characters
  const truncatedContent = cleanedContent
    .slice(0, 21)
    .replace(/\s+/g, "-")
    .replace(/-$/, "");

  // Combine with base name and extension

  const endTime = performance.now();
  console.log(`Average Execution Time: ${(endTime - startTime).toFixed(4)} ms`);
  console.log("Traslit:", truncatedContent);

  return truncatedContent;
}

//function getFirstCharsWithTrim(s) {
//  s = s.replace(/[^\p{L}\p{N}]+/gu, " ");
//  s = s.replace(/(^\s*)|(\s*$)/gi, "");
//  s = s.replace(/[ ]{2,}/gi, " ");
//  s = s.replace(/\n /, "\n");
//  s = s.toLowerCase();
//  s = s.replace(/\s+/g, "-");
//  s = s.slice(0, 21);
//  return s.replace(/-$/, "");
//}

function pushFilesArray(fileName) {
  let _fileName;

  if (fileIndexToEdit != null) {
    const _fi = filesArray[fileIndexToEdit];
    _fileName = _fi.name || fileName;
    _fi.text = input.value;
  } else {
    _fileName = fileName;
    const file = { name: _fileName, text: input.value };
    filesArray.push(file);
    indexedFiles.push(idCounterFiles.toString());
  }
}

const mdToTagsWithoutShape = (el, text) => {
  el.innerHTML = markdown(text);
  addButtonsAndWrapperToGalleries(el);
  addClickListenersToImages(el);
  waitForIframe(el);
};

const markdown = (s) => {
  s = s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, "");
  s = s.replace(/\u200B/, "");
  return marked.parse(s);
};

const saveHistoryTracker = (liDOM, resizableDiv, lengthSave) => {
  const saveEl = liDOM.querySelector(".save-history");
  if (lengthSave > 1) {
    saveEl.querySelector(".counter-save").innerText = lengthSave;
    changeCurrentInBefore(resizableDiv, lengthSave);
    saveEl.removeAttribute("disable");
    saveEl.querySelector(".previous-save").removeAttribute("disable");
  }
  saveEl.querySelector(".next-save").setAttribute("disable", true);
};

function updateUI5() {
  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  localStorage.removeItem("todomLastInputValue");
}

function newSave(liDOM, itemIndex) {
  const textArr = itemsArray[itemIndex].text;
  textArr.push({ variant: input.value, date: getFullCurrentDate() });
  const lengthSave = textArr.length;
  itemsSpecArray[itemIndex].save = lengthSave - 1;
  localStorage.setItem("todomItemsSpecArray", JSON.stringify(itemsSpecArray));

  const resizableDiv = liDOM.querySelector(".resizable-div");
  saveHistoryTracker(liDOM, resizableDiv, lengthSave);
  changeDateInAfter(resizableDiv, textArr[lengthSave - 1].date);
  mdToTagsWithoutShape(resizableDiv, input.value);
}

const saveItem = () => {
  if (itemIndexToEdit != null) {
    //save as new
    newSave(editedItemLiDOM, itemIndexToEdit);
    addOrRemoveScrollObserverToLi(editedItemLiDOM);
    scrollToTargetAdjusted(editedItemLiDOM, preview.scrollTop);
    joinSaveItemButton();
  } else {
    const itemObj = {
      text: [{ variant: input.value, date: getFullCurrentDate() }],
    };
    const specObj = { save: 0 };
    pushItemArrays(itemObj, specObj);
    drawLi(idCounterItems);
    showItemSortingArrows(foldedClass.childElementCount);
  }
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  updateUI6();
};

function updateUI6() {
  clearInputAndPreviewAreas();
  defaultMarkers();
  hideAndNewInputLabel();
  ifReturnAndNoneX();
  showOrHideDeleteAllItems();
  localStorage.removeItem("todomLastInputValue");
}

const defaultFileStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedFiles = [];
  filesArray = [];
  idCounterFiles = 0;
  if (window.protocol === "file:") fileElem.value = null;
  showItemSortingArrows(0);
  foldedClass.innerHTML = "";
};

const defaultItemStateVars = () => {
  defaultMarkers();
  inputLabel.innerHTML = "<div>New</div>";
  deleteAllItemsButton.classList.replace("visible", "invisible");
  indexedItems = [];
  itemsArray = [];
  itemsSpecArray = [];
  idCounterItems = 0;
  showItemSortingArrows(0);
  foldedClass.innerHTML = "";
};

const mergeAllItems = () => {
  itemsArray.forEach((item, index) => {
    const textArr = item.text;
    const currentSave = getCurrentSpec("save", index);
    const text = textArr[currentSave].variant.replace(/\\$/, "");
    const regex = /(^ *#{1,6} *)|(^ *\d+\.* *)|(^ *\- *)|(^ *\>+ *)|(^ +)/;
    if (text) {
      input.value = input.value
        ? regex.test(text)
          ? input.value + "\n" + text
          : input.value + "\\\n" + text
        : text;
    }
  });
  xUI();
  mdToPreview(input.value);
  scrollToLast();
};

const defaultMarkers = () => {
  itemIndexToEdit = null;
  fileIndexToEdit = null;
  input.classList.replace("border-edit", "border");
  input.setAttribute("placeholder", "New");
  xButton.title = "Clear input";
};

const hideAndNewInputLabel = () => {
  inputLabel.classList.replace("visible", "invisible");
  inputLabel.innerHTML = "<div>New</div>";
};

const ifReturnAndNoneX = () => {
  if (lastInputValue) {
    returnInputButton.style = "display:block";
  }
  xButton.style = "display:none";
};

const clearInputAndPreviewAreas = () => {
  input.value = "";
  preview.innerHTML = "";
  position.innerHTML = "";
};

function pushItemArrays(itemObj, specObj) {
  itemsArray.push(itemObj);
  itemsSpecArray.push(specObj);
}

const restoreHandler = (arr, btns, counterEl, todomArr) => {
  let len = arr.length;
  if (len !== 0) {
    const returningObj = arr.pop();
    const specObj = { save: 0 };
    pushItemArrays(returningObj, specObj);
    drawLi(idCounterItems);
    showItemSortingArrows(foldedClass.childElementCount);
    sho(deleteAllItemsButton);

    localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));

    len = len - 1;
    counterEl.innerText = len;
  }
  if (len === 0) {
    btns.map((i) => i.classList.replace("visible", "invisible"));
    if (todomArr) localStorage.removeItem(todomArr);
  } else {
    if (todomArr) localStorage.setItem(todomArr, JSON.stringify(arr));
  }
};

function handleDblClick(event) {
  const initiator = event.target,
    targetEl = initiator.classList.contains("dual")
      ? initiator
      : findParentTagOrClassRecursive(initiator, undefined, "dual");
  targetEl.style = "";
}

const inputChange = function (e) {
  lastInputValue = e.target.value;
  if (lastInputValue) {
    inputLabel.classList.replace("invisible", "visible");
    xButton.style = "display:block";
  } else {
    inputLabel.classList.replace("visible", "invisible");
    xButton.style = "display:none";
  }
  returnInputButton.style = "display:none";

  localStorage.setItem("todomLastInputValue", lastInputValue);
  mdToPreview(e.target.value);
  if (preview.innerHTML === "") position.innerHTML = "";
};

var inputHandler = function (e) {
  debounce(inputChange(e), 200, false);
};

html.addEventListener("click", function () {
  //if (event.target === modalContainer) {
  //  modalContainer.style.display = "none";
  //}
  if (twoClickTrashClear) clearTrashButton.classList.remove("filter-red");
  twoClickTrashClear = false;
  if (twoClickToTrash)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
  twoClickToTrash = false;
});

openDirButton.addEventListener("click", function (e) {
  if (window.protocol === "file:") {
    fileElem.setAttribute("webkitdirectory", "true");
    fileElem.click();
  } else {
    httpProtocolOpenDirectoryClick();
  }
});

openFileButton.addEventListener("click", function (e) {
  if (window.protocol === "file:") {
    fileElem.removeAttribute("webkitdirectory");
    fileElem.click();
  } else {
    httpProtocolOpenDirectoryClick();
  }
});

saveAsFileButton.addEventListener("click", async function () {
  if (input.value) {
    const drawItemOnly = true;
    fileDownload(drawItemOnly);
  }
});

saveAsOldButton.addEventListener("click", function (e) {
  const currentSave = itemsSpecArray[itemIndexToEdit].save;
  const textArr = itemsArray[itemIndexToEdit].text;
  textArr[currentSave].variant = input.value;
  localStorage.setItem("todomItemsArray", JSON.stringify(itemsArray));
  const resizableDiv = editedItemLiDOM.querySelector(".resizable-div");
  mdToTagsWithoutShape(resizableDiv, input.value);
  addOrRemoveScrollObserverToLi(editedItemLiDOM);

  updateUI5();

  scrollToTargetAdjusted(editedItemLiDOM, preview.scrollTop);
  joinSaveItemButton();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    if (isItemState) {
      saveItem();
    } else {
      fileDownload();
    }
  }
});

deleteAllItemsButton.addEventListener("click", function (e) {
  if (isItemState) {
    if (e.ctrlKey) {
      mergeAllItems();
    } else {
      if (confirm("Are you sure?")) {
        defaultItemStateVars();
        localStorage.removeItem("todomItemsArray");
        localStorage.removeItem("todomItemsSpecArray");
      } else {
        e.preventDefault();
      }
    }
  } else {
    if (confirm("Are you sure?")) {
      defaultFileStateVars();
    } else {
      e.preventDefault();
    }
  }
});

xButton.addEventListener("click", function (e) {
  if (itemIndexToEdit != null || fileIndexToEdit != null) {
    defaultMarkers();
  } else {
    localStorage.removeItem("todomLastInputValue");
  }

  hideAndNewInputLabel();
  ifReturnAndNoneX();
  clearInputAndPreviewAreas();
  joinSaveItemButton();
  input.focus();
});

returnInputButton.addEventListener("click", function () {
  input.value = lastInputValue;
  mdToPreview(input.value);
  localStorage.setItem("todomLastInputValue", lastInputValue);
  inputLabel.classList.replace("invisible", "visible");
  returnInputButton.style = "display:none";
  xButton.style = "display:block";
  input.focus();
});

restoreTrashedItemButton.addEventListener("click", function () {
  restoreHandler(
    trashArray,
    [restoreTrashedItemButton, clearTrashButton],
    trashedCounter,
    "todomTrashArray"
  );
});

clearTrashButton.addEventListener("click", function (e) {
  e.stopPropagation();
  if (twoClickTrashClear) {
    trashArray = [];
    localStorage.removeItem("todomTrashArray");
    restoreTrashedItemButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.replace("visible", "invisible");
    clearTrashButton.classList.remove("filter-red");
    window.setTimeout(function () {
      trashedCounter.innerText = "";
    }, 300);
    twoClickTrashClear = false;
  } else {
    clearTrashButton.classList.add("filter-red");
    twoClickTrashClear = true;
  }
  if (twoClickToTrash)
    lastItem.querySelector(".delete-one-item").classList.remove("filter-red");
  twoClickToTrash = false;
});

undoLastDeleteButton.addEventListener("click", function (e) {
  restoreHandler(deletedArray, [undoLastDeleteButton], deletedCounter);
});

input.addEventListener("input", inputHandler);

document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "Control":
      deleteAllItemsButton.innerText = "Merge All Items";
      foldedClass.classList.add("ctrl");
      break;
  }
});

document.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "Control":
      deleteAllItemsButton.innerText = "Delete All Items";
      foldedClass.classList.remove("ctrl");
      break;
  }
});

if (lastInputValue) {
  xButton.style = "display:block";
  inputLabel.classList.replace("invisible", "visible");
  input.value = lastInputValue;
  input.scrollTop = input.scrollHeight;
} else {
  xButton.style = "display:none";
}

if (input.value) {
  xUI();
  mdToPreview(input.value);
  //preview.scrollTop = preview.scrollHeight;
}

//  Инициализация `marked` с уникальными id
const renderer = new marked.Renderer();
const slugger = new marked.Slugger();

renderer.heading = (text, level) => {
  // Добавляем префикс `note-` чтобы не конфликтовать с 'mocha'
  // Добавляем постфикс для уникальности
  const slug = `note-${slugger.slug(text)}`;
  return `<h${level} id="${slug}">${text}</h${level}>`;
};

marked.use({ renderer });

initializeItemState();
showOrHideDeleteAllItems();
showOrHideTrash();
