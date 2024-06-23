const liHeightLimit = 300;
let predictBottom = 100;
let suspendTop = -200;

// Function to handle scroll events on a specific li element
function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;

  // Calculate the height of the topDiv
  const topInLiHeight = topInLi.getBoundingClientRect().height;

  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;

  // Logging variables for debugging
  console.log(`\nli \#${li.id}: --- Debug Info ---`);
  console.log(`liHeight: ${liHeight}`);
  console.log(`topInLiHeight: ${topInLiHeight}`);
  console.log(`rect.top: ${rect.top}`);
  console.log(`rect.bottom: ${rect.bottom}`);
  console.log(`window.innerHeight: ${window.innerHeight}`);

  // Apply sticky class and padding
  if (
    !belowHeightLimit &&
    rect.top < suspendTop &&
    rect.bottom > predictBottom
  ) {
    console.log("Adding sticky class");
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`;
    li.style.paddingTop = `${topInLiHeight}px`;
  } else {
    console.log("Removing sticky class");
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }

  // Remove sticky class and padding when the li is no longer in the viewport
  if (
    rect.bottom <= predictBottom &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    console.log("Forcing removal of sticky class");
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }
}

function addScrollListener(li) {
  window.addEventListener(
    "scroll",
    debounce(
      // Debounce function to limit the rate at which the scroll handler is called
      function () {
        handleLiScroll({ target: li });
      },
      100,
      false
    )
  );
}

// Observer options
const observerOptions = {
  root: null, // Use the viewport as the root
  rootMargin: "0px",
  threshold: 0, // Trigger when any part of the element is visible
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

function removeScrollListener(li) {
  window.removeEventListener("scroll", function () {
    handleLiScroll({ target: li });
  });
}
