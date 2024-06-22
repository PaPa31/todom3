// Function to handle scroll events on a specific li element
function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

  // Add sticky class when the top of li element scrolls out of view upwards
  if (!topVisible && rect.top < 0 && rect.bottom > 0) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`; // Set the same width as li
  }

  // Remove sticky class when the bottom of li element scrolls out of view downwards
  if (rect.bottom <= 0) {
    topInLi.classList.remove("sticky");
    topInLi.style.width = ""; // Reset to default width
  }

  // Remove sticky class when the top of li element becomes visible again
  if (topVisible) {
    topInLi.classList.remove("sticky");
    topInLi.style.width = ""; // Reset to default width
  }
}

// Function to add scroll event listener to li elements as they become visible
function addScrollListener(li) {
  const rect = li.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

  if (isVisible && !li.hasAttribute("data-scroll-listener")) {
    li.setAttribute("data-scroll-listener", "true");
    li.addEventListener("scroll", handleLiScroll);
  }
}
