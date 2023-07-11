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
let lastActiveWindowHeight = window.visualViewport.height;
const resizeWindowHandler = (activeWindowHeight) => {
  //console.log(win);

  const heightVisibleElements =
    form.clientHeight + preview.clientHeight + inputLabel.clientHeight;
  const diffOldAndNewAW = lastActiveWindowHeight - activeWindowHeight;
  if (activeWindowHeight >= heightVisibleElements) {
    if (lastActiveWindowHeight <= activeWindowHeight) {
      //const scrollTop2 = position.scrollHeight;
      //position.scrollTop = scrollTop2;
      //html.scrollTop = scrollTop2 + offsetScroll;
      //increaseHeight(heightVisibleElements);
      //checkActiveWindowHeightDiff();
      checkActiveWindowHeightDiff(diffOldAndNewAW);
    }
  } else {
    if (lastActiveWindowHeight > activeWindowHeight) {
      checkActiveWindowHeightDiff(diffOldAndNewAW);
    }
  }
  lastActiveWindowHeight = activeWindowHeight;
};

const checkPositionHeightDiff = (diffOldAndNewPositionHeight) => {
  const currentHeight = position.clientHeight;
  let resultHeight;
  if (diffOldAndNewPositionHeight < 0) {
    resultHeight = currentHeight + diffOldAndNewPositionHeight;
  } else {
    resultHeight = currentHeight - diffOldAndNewPositionHeight;
  }

  if (resultHeight < maxHeight) {
    increaseHeight(resultHeight);
  } else {
    reduceHeight(reduceHeight);
  }
};

let oldPositionHeight = position.scrollHeight;
const previewHeightHandler = (positionHeight) => {
  const diffPosition = oldPositionHeight - positionHeight;
  checkPositionHeightDiff(diffPosition);
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

const increaseHeight = (plusHeight) => {
  const scrollTop2 = position.scrollHeight;
  position.scrollTop = scrollTop2;
  html.scrollTop = scrollTop2 + plusHeight;

  preview.style.maxHeight = plusHeight + "px";
  position.style.maxHeight = plusHeight + "px";
};

const maxHeight = parseInt(
  window.getComputedStyle(position).maxHeight.replace("px", "")
);

const checkActiveWindowHeightDiff = (diffOldAndNewAW) => {
  //offsetHeight = 0;

  const currentHeight = position.scrollHeight;
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
      const offsetHeight = maxHeight - currentHeight;
      reduceHeight(offsetHeight);
    } else {
      console.log(" active >= visible ");
      //offsetHeight = maxHeight - currentHeight;
      const diffPosition = maxHeight - currentHeight;
      increaseHeight(diffPosition);
    }
  } else {
    console.log(" position >= preview ");
  }
};

window.addEventListener(
  "resize",
  debounce(
    (e) => {
      console.log(`width: ${e.target.visualViewport.width}px`);
      console.log(`height: ${e.target.visualViewport.height}px`);
      //changePositionBlock(getViewportSize().w);
      //resizeWindowHandler(getViewportSize());
      const activeWindowHeight = window.visualViewport.height;
      resizeWindowHandler(activeWindowHeight);
    },
    200,
    false
  ),
  false
);
