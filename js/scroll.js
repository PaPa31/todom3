// Define the maximum height limit for sticky behavior
const liHeightLimit = 300; // Adjust this value as needed
let predictBottom = 34; // Initial value, adjust as needed

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return; // Skip if there's no .top-in-li div

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;
  const topInLiHeight = topInLi.getBoundingClientRect().height;

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

function addScrollListener(li) {
  window.addEventListener("scroll", function () {
    handleLiScroll({ target: li });
  });
}
