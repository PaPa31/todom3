// Function to add buttons and wrapper to galleries
function addButtonsAndWrapperToGalleries(liDOM) {
  const galleries = liDOM.querySelectorAll(".gallery");
  galleries.forEach((gallery) => {
    // Create wrapper element
    const wrapper = document.createElement("div");
    wrapper.classList.add("gallery-wrapper");

    // Clone gallery element and append to wrapper
    const galleryClone = gallery.cloneNode(true);
    wrapper.appendChild(galleryClone);

    // Create and append the Previous button
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("prev-btn");
    prevBtn.textContent = "Previous";
    prevBtn.addEventListener("click", function () {
      galleryClone.scrollBy({
        left: -200, // Adjust scroll distance as needed
        behavior: "smooth",
      });
    });
    wrapper.appendChild(prevBtn);

    // Create and append the Next button
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("next-btn");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", function () {
      galleryClone.scrollBy({
        left: 200, // Adjust scroll distance as needed
        behavior: "smooth",
      });
    });
    wrapper.appendChild(nextBtn);

    // Replace original gallery with wrapper
    gallery.parentNode.replaceChild(wrapper, gallery);

    // Initially check button visibility
    checkButtonVisibility(galleryClone);

    // Add event listener for scroll event to dynamically check button visibility
    galleryClone.addEventListener("scroll", function () {
      checkButtonVisibility(galleryClone);
    });
  });
}

// Function to check button visibility based on scroll position
function checkButtonVisibility(gallery) {
  const prevBtn = gallery.parentNode.querySelector(".prev-btn");
  const nextBtn = gallery.parentNode.querySelector(".next-btn");

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
