// Function to check button visibility based on scroll position
function checkButtonVisibility(gallery) {
  const prevBtn = gallery.firstChild;
  const nextBtn = gallery.lastChild;

  if (gallery.scrollLeft <= 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "block";
  }

  if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "block";
  }
}

// Function to add buttons to galleries and set initial visibility
function addButtonsToGalleries(liDOM) {
  const galleries = liDOM.querySelectorAll(".gallery");
  galleries.forEach((gallery) => {
    // Create and append the Previous button
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("prev-btn");
    prevBtn.textContent = "Previous";
    prevBtn.addEventListener("click", function () {
      gallery.scrollBy({
        left: -200, // Adjust scroll distance as needed
        behavior: "smooth",
      });
    });
    gallery.insertAdjacentElement("afterbegin", prevBtn);

    // Create and append the Next button
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("next-btn");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", function () {
      gallery.scrollBy({
        left: 200, // Adjust scroll distance as needed
        behavior: "smooth",
      });
    });
    gallery.insertAdjacentElement("beforeend", nextBtn);

    // Initially check button visibility
    checkButtonVisibility(gallery);

    // Add event listener for scroll event to dynamically check button visibility
    gallery.addEventListener("scroll", function () {
      checkButtonVisibility(gallery);
    });
  });
}
