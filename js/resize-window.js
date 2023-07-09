// source: https://stackoverflow.com/a/18284182
function getViewportSize(w) {
  // Use the specified window or the current window if no argument
  w = w || window;

  // This works for all browsers except IE8 and before
  if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };

  // For IE (or any browser) in Standards mode
  var d = w.document;
  if (document.compatMode == "CSS1Compat")
    return {
      w: d.documentElement.clientWidth,
      h: d.documentElement.clientHeight,
    };

  // For browsers in Quirks mode
  return { w: d.body.clientWidth, h: d.body.clientHeight };
}

//let preview;
//let position;
//const changePositionBlock = (windowWidth) => {
//  let oldPreviewEl = preview;
//  let oldPositionEl = position;

//  if (windowWidth < 1320) {
//    console.log("< 1320 :", windowWidth);
//    preview = document.querySelector("#form1 > #preview");
//    position = document.querySelector("#form1 > #position");
//  } else {
//    console.log("1320 >= :", windowWidth);
//    preview = document.querySelector(".preview-outer #preview");
//    position = document.querySelector(".preview-outer #position");
//  }
//  console.log("preview:", preview);

//  // != and !== cause different result.
//  // At start: oldPreview = undefined
//  // and preview = null
//  if (oldPreviewEl != preview) {
//    if (oldPreviewEl && preview) {
//      console.log("not start; change");
//      //oldPreviewEl.style.display = "none";
//      //preview.style.display = "block";
//      //oldPositionEl.style.display = "none";
//      //position.style.display = "block";
//    } else {
//      console.log("start; not change");
//    }
//    if (input.value) {
//      //oldPreviewEl.innerHTML = "";
//      mdToPreview(input.value);
//      //syncPreview();
//    }
//  } else {
//    console.log("same");
//  }
//};

//changePositionBlock(getViewportSize().w);

const getLineHeight = (el) => {
  console.log("el:", el);
  const fontSize = window.getComputedStyle(el).fontSize;
  console.log("fontSize:", fontSize);
  const lineHeight = Math.floor(parseInt(fontSize.replace("px", "")) * 1.5);
  console.log("lineHeight:", lineHeight);
  return lineHeight;
};

const resizeWindowHandler = (win) => {
  console.log(win);
  const activeWindowHeight = window.visualViewport.height;
  const heightVisibleElements =
    form.clientHeight + preview.clientHeight + inputLabel.clientHeight;
  if (activeWindowHeight >= heightVisibleElements) {
    preview.removeAttribute("style");
    position.removeAttribute("style");
  } else {
    checkHeightDifferent();
  }
};

//let offsetHeight = 0;
const reduceHeight = (offsetHeight) => {
  const lastChild = position.querySelector(
    ".last-child, .last-child-lb, .last-child-rb"
  );

  const offsetScroll = getLineHeight(lastChild) - offsetHeight - 20;

  const scrollTop2 = position.scrollHeight;
  position.scrollTop = scrollTop2;
  html.scrollTop = scrollTop2 - offsetScroll;

  preview.style.maxHeight = position.clientHeight + "px";
  position.style.maxHeight = position.clientHeight + "px";
  //console.log("offsetHeight:", offsetHeight);
};

const checkHeightDifferent = () => {
  //offsetHeight = 0;
  const maxHeight = parseInt(
    window.getComputedStyle(position).maxHeight.replace("px", "")
  );

  //console.log(maxHeight);
  const currentHeight = position.clientHeight;
  //console.log(currentHeight);
  if (currentHeight < maxHeight) {
    if (!window.visualViewport) {
      return;
    }
    const activeWindowHeight = window.visualViewport.height;
    //console.log("window.visualViewport.height:", window.visualViewport.height);
    const heightVisibleElements =
      form.clientHeight + preview.clientHeight + inputLabel.clientHeight;
    //console.log("form.clientHeight:", form.clientHeight);
    if (activeWindowHeight < heightVisibleElements) {
      offsetHeight = maxHeight - currentHeight;
      reduceHeight(offsetHeight);
    }
  }
};

window.addEventListener(
  "resize",
  debounce(
    (e) => {
      console.log(`width: ${e.target.visualViewport.width}px`);
      console.log(`height: ${e.target.visualViewport.height}px`);
      //changePositionBlock(getViewportSize().w);
      resizeWindowHandler(getViewportSize());
    },
    200,
    false
  ),
  false
);
