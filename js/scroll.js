// Define the maximum height limit for sticky behavior
const liHeightLimit = 300; // Adjust this value as needed

// Initial value for predictBottom
let predictBottom = 34; // Adjust this value as needed

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

  console.log(`liHeight: ${liHeight}`);
  console.log(`topInLiHeight: ${topInLiHeight}`);
  console.log(`rect.top: ${rect.top}`);
  console.log(`rect.bottom: ${rect.bottom}`);
  console.log(`window.innerHeight: ${window.innerHeight}`);
  console.log(`scrollLimit: ${scrollLimit}`);

  // Log conditions and outcomes
  console.log(`topVisible: ${topVisible}`);
  console.log(`fullyVisible: ${fullyVisible}`);
  console.log(`belowHeightLimit: ${belowHeightLimit}`);
  console.log(
    `rect.top < 0 && rect.bottom > scrollLimit: ${
      rect.top < 0 && rect.bottom > scrollLimit
    }`
  );
  console.log(`rect.bottom <= scrollLimit: ${rect.bottom <= scrollLimit}`);
  console.log(
    `rect.bottom <= scrollLimit && !topVisible && !fullyVisible && !belowHeightLimit: ${
      rect.bottom <= scrollLimit &&
      !topVisible &&
      !fullyVisible &&
      !belowHeightLimit
    }`
  );

  if (!belowHeightLimit && rect.top < 0 && rect.bottom > scrollLimit) {
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

  if (
    rect.bottom <= scrollLimit &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    console.log("Removing sticky class");
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }
}

// Rest of your code...

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
