// Define the maximum height limit for sticky behavior
const liHeightLimit = 300; // Adjust this value as needed
let predictBottom = 34; // Initial value, adjust as needed

// Function to handle scroll events on a specific li element
function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;

  // Calculate the height of the topDiv
  const topInLiHeight = topInLi.clientHeight || topInLi.offsetHeight || 0;

  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;

  // Calculate the scroll limit dynamically
  const scrollLimit = window.innerHeight - predictBottom;

  if (!belowHeightLimit && rect.top < 0 && rect.bottom > scrollLimit) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`;
    li.style.paddingTop = `${topInLiHeight}px`;
  } else {
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }

  if (
    rect.bottom <= scrollLimit &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }
}

// Function to handle visibility changes using IntersectionObserver
function handleVisibility(entries, observer) {
  entries.forEach((entry) => {
    const li = entry.target;
    if (entry.isIntersecting) {
      // Attach scroll listener when li enters viewport
      li.addEventListener("scroll", handleLiScroll);
      observer.unobserve(li); // Stop observing once scroll listener is added
    } else {
      // Remove scroll listener when li leaves viewport
      li.removeEventListener("scroll", handleLiScroll);
    }
  });
}

// IntersectionObserver configuration
const observerOptions = {
  root: null, // Use the viewport as the root
  rootMargin: "0px", // No margin around the root
  threshold: 0, // Default threshold
};

// Initialize IntersectionObserver
const observer = new IntersectionObserver(handleVisibility, observerOptions);

// Function to add IntersectionObserver to li elements
function observeLiElements() {
  const liElements = document.querySelectorAll("li.folded");
  liElements.forEach((li) => {
    observer.observe(li);
  });
}

// Call observeLiElements initially
observeLiElements();

function addScrollListener(li) {
  window.addEventListener("scroll", function () {
    handleLiScroll({ target: li });
  });
}
