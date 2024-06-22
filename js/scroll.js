// Function to handle scroll events on li elements
function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  console.log("rect: ", rect);
  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  console.log("topVisible: ", topVisible);
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  console.log("fullyVisible: ", fullyVisible);

  if (!topVisible && !fullyVisible) {
    topInLi.classList.add("sticky");
  } else {
    topInLi.classList.remove("sticky");
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
