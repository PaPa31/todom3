//let gallery; // Define gallery as a global variable

// Function to create and append the Previous button
function createPrevButton() {
  const prevBtn = document.createElement("button");
  prevBtn.classList.add("prev-btn");
  prevBtn.textContent = "Previous";
  prevBtn.addEventListener("click", function () {
    gallery.scrollBy({
      left: -200, // Adjust scroll distance as needed
      behavior: "smooth",
    });
  });
  return prevBtn;
}

// Function to create and append the Next button
function createNextButton() {
  const nextBtn = document.createElement("button");
  nextBtn.classList.add("next-btn");
  nextBtn.textContent = "Next";
  nextBtn.addEventListener("click", function () {
    gallery.scrollBy({
      left: 200, // Adjust scroll distance as needed
      behavior: "smooth",
    });
  });
  return nextBtn;
}

// Function to handle image click within a gallery block
function handleScrollEvent(event) {
  const scrolledBlock = event.target;
  const galleryBlock = scrolledBlock.closest(".gallery");

  const prevBtn = galleryBlock.querySelector(".prev-btn");
  const nextBtn = galleryBlock.querySelector(".next-btn");

  // Show or hide Previous button based on scroll position
  if (gallery.scrollLeft <= 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
  }

  // Show or hide Next button based on scroll position and container width
  if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "block";
  }
}

// Function to check if Previous button is needed
function checkPrevButton() {
  const prevBtn = document.querySelector(".prev-btn");
  if (gallery.scrollLeft <= 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
  }
}

// Function to check if Next button is needed
function checkNextButton() {
  const nextBtn = document.querySelector(".next-btn");
  if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "block";
  }
}

// Add event listener for resize event to dynamically check button visibility
window.addEventListener("resize", function () {
  checkPrevButton();
  checkNextButton();
});

// Initially check button visibility
checkPrevButton();
checkNextButton();

// Add event listener for scroll event to dynamically check button visibility
gallery.addEventListener("scroll", function () {
  checkPrevButton();
  checkNextButton();
});

// Function to add buttons Next & Prev to gallery blocks
function addButtonsToGallery(liDOM) {
  const galleryBlocks = liDOM.querySelectorAll(".gallery");
  galleryBlocks.forEach((block) => {
    block.addEventListener("scroll", handleScrollEvent);
  });
}
