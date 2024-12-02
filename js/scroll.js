var liHeightLimit = 300; // global
let predictBottom = 100;
let suspendTop = -200;
let sticky = false;
let stickyNumber;

// Function to handle scroll events on a specific li element
function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;
  const topInLiWidth = topInLi.clientWidth;

  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;

  function addStickyClass() {
    const topInLiHeight =
      topInLi.getBoundingClientRect().height +
      topInLi.getBoundingClientRect().x;
    li.style.paddingTop = `${topInLiHeight}px`; // Set the paddingTop first to avoid jerking
    sticky = true;
    stickyNumber = indexedItems.indexOf(li.id) * 1;
    topInLi.style.width = `${topInLiWidth}px`;
    // renamed classes (to sticken, showen and hiden) because
    // sticky menu stopped working with "injected stylesheet"
    // possibly due to some Chrome extensions or .epub books
    topInLi.classList.add("sticken");

    // double requestAnimationFrame ensures that the DOM update is fully processed before applying the next class
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        topInLi.classList.add("showen");
      });
    });
  }

  function removeClasses() {
    topInLi.classList.add("hiden");
    topInLi.addEventListener(
      "transitionend",
      function () {
        li.style.paddingTop = "";
        topInLi.classList.remove("sticken", "showen", "hiden");
        sticky = false;
        stickyNumber = undefined;
        topInLi.style.width = "";
      },
      { once: true }
    );
  }

  // Apply sticken class and padding
  if (
    !belowHeightLimit &&
    rect.top < suspendTop &&
    rect.bottom > predictBottom
  ) {
    if (!topInLi.classList.contains("sticken")) {
      addStickyClass();
    }
  } else {
    if (topInLi.classList.contains("sticken")) {
      removeClasses();
    }
  }

  // Remove sticken class and padding when the li is no longer in the viewport
  if (
    rect.bottom <= predictBottom &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    if (topInLi.classList.contains("sticken")) {
      removeClasses();
    }
  }
}

function addScrollListener(li) {
  const debouncedScrollHandler = debounce(
    () => {
      handleLiScroll({ target: li });
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
  removeScrollListener(li);
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div
  if (topInLi.classList.contains("sticken")) {
    topInLi.classList.add("hiden");
    topInLi.addEventListener(
      "transitionend",
      function () {
        li.style.paddingTop = "";
        topInLi.classList.remove("sticken", "showen", "hiden");
        sticky = false;
        topInLi.style.width = "";
      },
      { once: true }
    );
  }
}
