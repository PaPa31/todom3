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

const getLineHeight = (el) => {
  //console.log("el:", el);
  const fontSize = window.getComputedStyle(el).fontSize;
  //console.log("fontSize:", fontSize);
  const lineHeight = Math.floor(parseInt(fontSize.replace("px", "")) * 1.5);
  //console.log("lineHeight:", lineHeight);
  return lineHeight;
};

let offsetScroll = 0;
let lastHeightValue = 0;
const resizeWindowHandler = (win) => {
  console.log(win);
  const activeWindowHeight = window.visualViewport.height;
  const heightVisibleElements =
    form.clientHeight + preview.clientHeight + inputLabel.clientHeight;
  if (activeWindowHeight >= heightVisibleElements) {
    if (lastHeightValue <= activeWindowHeight) {
      //const scrollTop2 = position.scrollHeight;
      //position.scrollTop = scrollTop2;
      //html.scrollTop = scrollTop2 + offsetScroll;
      //increaseHeight(heightVisibleElements);
      //checkHeightDifference();
      checkHeightDifference();
    }
  } else {
    if (lastHeightValue > activeWindowHeight) {
      checkHeightDifference();
    }
  }
  lastHeightValue = activeWindowHeight;
};

//let offsetHeight = 0;
const reduceHeight = (offsetHeight) => {
  const lastChild = position.querySelector(
    ".last-child, .last-child-lb, .last-child-rb"
  );
  const heightLastChild = lastChild ? getLineHeight(lastChild) : 0;
  const offsetScroll = heightLastChild + offsetHeight - 40;

  const scrollTop2 = position.scrollHeight;
  position.scrollTop = scrollTop2;
  html.scrollTop = scrollTop2 - offsetScroll;

  preview.style.maxHeight = position.clientHeight + "px";
  position.style.maxHeight = position.clientHeight + "px";
  //console.log("offsetHeight:", offsetHeight);
};

const increaseHeight = (offsetScroll) => {
  preview.removeAttribute("style");
  position.removeAttribute("style");
  const scrollTop2 = position.scrollHeight;
  position.scrollTop = scrollTop2;
  html.scrollTop = scrollTop2 - offsetScroll;
};

const maxHeight = parseInt(
  window.getComputedStyle(position).maxHeight.replace("px", "")
);

const checkHeightDifference = () => {
  //offsetHeight = 0;

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
    if (activeWindowHeight < heightVisibleElements) {
      offsetHeight = maxHeight - currentHeight;
      reduceHeight(offsetHeight);
    } else {
      console.log(" active >= visible ");
      increaseHeight(offsetHeight);
    }
  } else {
    console.log(" position === preview ");
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
