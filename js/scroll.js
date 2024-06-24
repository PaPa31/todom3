const liHeightLimit = 300;
let predictBottom = 100;
let suspendTop = -200;

let scrollLock = false;

function handleLiScroll(event, callback) {
  if (scrollLock) return;
  scrollLock = true;

  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) {
    scrollLock = false;
    if (callback) callback();
    return;
  }

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;
  const topInLiHeight = topInLi.getBoundingClientRect().height;

  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;

  console.log(`\nli \#${li.id}: --- Debug Info ---`);
  console.log(`liHeight: ${liHeight}`);
  console.log(`topInLiHeight: ${topInLiHeight}`);
  console.log(`rect.top: ${rect.top}`);
  console.log(`rect.bottom: ${rect.bottom}`);
  console.log(`window.innerHeight: ${window.innerHeight}`);

  if (
    !belowHeightLimit &&
    rect.top < suspendTop &&
    rect.bottom > predictBottom
  ) {
    if (!topInLi.classList.contains("sticky")) {
      console.log("Adding sticky class");
      topInLi.classList.add("sticky");
      topInLi.style.width = `${li.clientWidth}px`;
      li.style.paddingTop = `${topInLiHeight}px`;
    }
  } else {
    if (topInLi.classList.contains("sticky")) {
      console.log("Removing sticky class");
      topInLi.classList.remove("sticky");
      topInLi.style.width = "";
      li.style.paddingTop = "";
    }
  }

  if (
    rect.bottom <= predictBottom &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    if (topInLi.classList.contains("sticky")) {
      console.log("Forcing removal of sticky class");
      topInLi.classList.remove("sticky");
      topInLi.style.width = "";
      li.style.paddingTop = "";
    }
  }

  scrollLock = false;
  if (callback) callback();
}

function addScrollListener(li) {
  const debouncedScrollHandler = debounce(
    () => {
      handleLiScroll({ target: li }, () => {
        // Optional callback after handling scroll
      });
    },
    100,
    false
  );
  li._scrollHandler = debouncedScrollHandler;
  window.addEventListener("scroll", debouncedScrollHandler, false);
}

function removeScrollListener(li) {
  if (li._scrollHandler) {
    window.removeEventListener("scroll", li._scrollHandler);
    delete li._scrollHandler;
  }
}

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0,
};

const observerCallback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      addScrollListener(entry.target);
    } else {
      removeScrollListener(entry.target);
    }
  });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

function observeLiElements(li) {
  observer.observe(li);
}

function unobserveLiElements(li) {
  observer.unobserve(li);
}
