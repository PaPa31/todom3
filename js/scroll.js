const liHeightLimit = 300;
let predictBottom = 64;

function handleLiScroll(event) {
  const li = event.target;
  const topInLi = li.querySelector(".top-in-li");
  if (!topInLi) return;

  const rect = li.getBoundingClientRect();
  const liHeight = li.clientHeight;
  const topInLiHeight = topInLi.getBoundingClientRect().height;

  const topVisible = rect.top >= 0 && rect.top <= window.innerHeight;
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  const belowHeightLimit = liHeight < liHeightLimit;
  const scrollLimit =
    window.innerHeight - (rect.bottom - rect.top + predictBottom);

  if (
    !belowHeightLimit &&
    !topVisible &&
    !fullyVisible &&
    rect.top < 0 &&
    rect.bottom > scrollLimit
  ) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`;
    li.style.paddingTop = `${topInLiHeight}px`;
  } else {
    topInLi.classList.remove("sticky");
    topInLi.style.width = "";
    li.style.paddingTop = "";
  }

  if (
    rect.bottom < window.innerHeight &&
    rect.bottom > 0 &&
    !topVisible &&
    !fullyVisible &&
    !belowHeightLimit
  ) {
    topInLi.classList.add("sticky");
    topInLi.style.width = `${li.clientWidth}px`;
    li.style.paddingTop = `${topInLiHeight}px`;
  }
}

function addScrollListener(li) {
  window.addEventListener("scroll", function () {
    handleLiScroll({ target: li });
  });
}
