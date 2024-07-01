function getViewportSize(w) {
  // source: https://stackoverflow.com/a/18284182
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
  const fontSize = window.getComputedStyle(el).fontSize;
  const lineHeight = Math.floor(parseInt(fontSize.replace("px", "")) * 1.5);
  return lineHeight;
};

let offsetScroll = 0;
let lastActiveWindowHeight = window.visualViewport.height;
const resizeWindowHandler = (activeWindowHeight) => {
  changeFixedElementWidth();
  const heightVisibleElements =
    form.clientHeight + preview.clientHeight + inputLabel.clientHeight;
  const diffOldAndNewAW = lastActiveWindowHeight - activeWindowHeight;
  if (activeWindowHeight >= heightVisibleElements) {
    if (lastActiveWindowHeight <= activeWindowHeight) {
      checkActiveWindowHeightDiff(diffOldAndNewAW);
    }
  } else {
    if (lastActiveWindowHeight > activeWindowHeight) {
      checkActiveWindowHeightDiff(diffOldAndNewAW);
    }
  }
  lastActiveWindowHeight = activeWindowHeight;
};

const checkPositionHeightDiff = (
  diffOldAndNewPositionHeight,
  positionHeight
) => {
  const currentHeight = position.clientHeight;
  let resultHeight;
  if (diffOldAndNewPositionHeight > 0) {
    resultHeight = positionHeight;
  } else {
    //resultHeight = currentHeight - diffOldAndNewPositionHeight;
    resultHeight = positionHeight;
  }

  if (resultHeight >= currentMaxHeight) {
    //const sum = currentHeight + resultHeight;
    increaseHeight(resultHeight);
  } else {
    //const subtract = currentHeight - resultHeight;
    reduceHeight(resultHeight);
  }
  currentMaxHeight = resultHeight < maxHeight ? resultHeight : maxHeight;
  oldPositionHeight = currentHeight;
};

const maxHeight = parseInt(
  window.getComputedStyle(position).maxHeight.replace("px", "")
);

let oldPositionHeight = maxHeight;
let currentMaxHeight = maxHeight;

const previewHeightHandler = (positionHeight) => {
  let oldPositionHeight2 = position.scrollHeight;
  let oldPositionHeight3 = position.scrollTop;
  const diffPosition = oldPositionHeight - positionHeight;
  checkPositionHeightDiff(diffPosition, positionHeight);
};

const reduceHeight = (offsetHeight) => {
  const lastChild = position.querySelector(
    ".last-child, .last-child-lb, .last-child-rb"
  );
  const heightLastChild = lastChild ? getLineHeight(lastChild) : 0;
  const offsetScroll = heightLastChild + offsetHeight;

  const scrollTop2 = position.scrollHeight;
  position.scrollTop = scrollTop2;
  //html.scrollTop = scrollTop2 - offsetScroll;

  preview.style.maxHeight = position.clientHeight + "px";
  position.style.maxHeight = position.clientHeight + "px";
};

const increaseHeight = (plusHeight) => {
  const scrollTop2 = position.scrollHeight;
  position.scrollTop = scrollTop2;
  //html.scrollTop = scrollTop2 - plusHeight;

  const maxH = plusHeight < maxHeight ? plusHeight : maxHeight;

  preview.style.maxHeight = maxH + "px";
  position.style.maxHeight = maxH + "px";
};

const checkActiveWindowHeightDiff = (diffOldAndNewAW) => {
  const currentHeight = position.scrollHeight;
  if (currentHeight < maxHeight) {
    if (!window.visualViewport) {
      return;
    }
    const activeWindowHeight = window.visualViewport.height;
    const heightVisibleElements =
      form.clientHeight + preview.clientHeight + inputLabel.clientHeight;
    if (activeWindowHeight < heightVisibleElements) {
      const offsetHeight = maxHeight - currentHeight;
      reduceHeight(offsetHeight);
    } else {
      //console.log(" active >= visible ");
      const diffPosition = maxHeight - currentHeight;
      increaseHeight(diffPosition);
    }
  } else {
    //console.log(" position >= preview ");
  }
};

function changeFixedElementWidth() {
  if (sticky) {
    const topInLi = document.querySelector("li > .top-in-li.sticky");
    topInLi.style.width = `${
      topInLi.nextSibling.getBoundingClientRect().width
    }px`;
  }
}

window.addEventListener(
  "resize",
  debounce(
    (e) => {
      //console.log(`width: ${e.target.visualViewport.width}px`);
      //console.log(`height: ${e.target.visualViewport.height}px`);
      const activeWindowHeight = window.visualViewport.height;
      resizeWindowHandler(activeWindowHeight);
    },
    0,
    false
  ),
  false
);
