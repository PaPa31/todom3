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

const resizeWindowHandler = (window) => {
  console.log(window);
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
