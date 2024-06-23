// Define the maximum height limit for sticky behavior
const liHeightLimit = 300; // Adjust this value as needed
let predictBottom = 64; // Initial value, adjust as needed

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

  // Check if the li element height is below the limit
  const belowHeightLimit = liHeight < liHeightLimit;

  // Calculate the scroll limit dynamically
  const scrollLimit =
    window.innerHeight - (rect.bottom - rect.top + predictBottom);

  // Add sticky class and padding when conditions are met
  if (
    !belowHeightLimit &&
    !topVisible &&
    !fullyVisible &&
    rect.top < 0 &&
    rect.bottom > scrollLimit
  ) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`; // Set the same width as li
    li.style.paddingTop = `${topInLiHeight}px`; // Add padding to li
  }

  // Remove sticky class and padding when conditions are met
  if (
    rect.top >= 0 ||
    rect.bottom <= window.innerHeight ||
    fullyVisible ||
    belowHeightLimit ||
    rect.bottom <= scrollLimit
  ) {
    topInLi.classList.remove("sticky");
    topInLi.style.width = ""; // Reset to default width
    li.style.paddingTop = ""; // Remove padding
  }

  // Add sticky class and padding to the next li when conditions are met
  if (
    rect.bottom < window.innerHeight &&
    rect.bottom > 0 &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`; // Set the same width as li
    li.style.paddingTop = `${topInLiHeight}px`; // Add padding to li
  }
}

function addScrollListener(li) {
  window.addEventListener("scroll", function () {
    handleLiScroll({ target: li });
  });
}
