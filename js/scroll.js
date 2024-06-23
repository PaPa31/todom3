function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

  // Calculate the height of the topDiv
  const topInLiHeight = topInLi.getBoundingClientRect().height;

  // Add sticky class and padding when the top of li element scrolls out of view upwards and bottom is not visible
  if (
    !topVisible &&
    !fullyVisible &&
    rect.top < 0 &&
    rect.bottom > window.innerHeight
  ) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`; // Set the same width as li
    li.style.paddingTop = `${topInLiHeight}px`; // Add padding to li
  }

  // Remove sticky class and padding when the bottom of li element scrolls out of view downwards
  if (rect.bottom <= 0) {
    topInLi.classList.remove("sticky");
    topInLi.style.width = ""; // Reset to default width
    li.style.paddingTop = ""; // Remove padding
  }

  // Remove sticky class and padding when the top of li element becomes visible again
  if (topVisible || fullyVisible) {
    topInLi.classList.remove("sticky");
    topInLi.style.width = ""; // Reset to default width
    li.style.paddingTop = ""; // Remove padding
  }

  // Add sticky class and padding to the next li when scrolling down and it appears at the top
  if (
    rect.bottom < window.innerHeight &&
    rect.bottom > 0 &&
    !topVisible &&
    !fullyVisible
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
