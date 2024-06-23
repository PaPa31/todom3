// Define the maximum height limit for sticky behavior
const liHeightLimit = 300; // Adjust this value as needed
let predictBottom = 34; // Adjust this value as needed

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

  // Calculate the scroll limit dynamically
  const scrollLimit = window.innerHeight - predictBottom;

  // Logging variables for debugging
  console.log(`liHeight: ${liHeight}`);
  console.log(`topInLiHeight: ${topInLiHeight}`);
  console.log(`rect.top: ${rect.top}`);
  console.log(`rect.bottom: ${rect.bottom}`);
  console.log(`window.innerHeight: ${window.innerHeight}`);
  console.log(`scrollLimit: ${scrollLimit}`);

  // Apply sticky class and padding
  if (!belowHeightLimit && rect.top < 0 && rect.bottom > scrollLimit) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`;
    li.style.paddingTop = `${topInLiHeight}px`;
  } else {
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }

  // Remove sticky class and padding
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

function addScrollListener(li) {
  window.addEventListener("scroll", function () {
    handleLiScroll({ target: li });
  });
}
