// Function to check if gallery is scrollable horizontally and show next button on hover
function handleGalleryHover(event) {
  const gallery = event.currentTarget;
  const nextBtn = gallery.parentNode.querySelector(".next-btn");

  // Check if the gallery is scrollable horizontally
  if (gallery.scrollWidth > gallery.clientWidth) {
    nextBtn.style.display = "block";
  }
}

// Add event listener to show next button on gallery hover
function addHoverListenerToGallery(liDOM) {
  const galleries = liDOM.querySelectorAll(".gallery");
  galleries.forEach((gallery) => {
    gallery.addEventListener("mouseenter", handleGalleryHover);
  });
}

// Function to add buttons and wrapper to galleries
function addButtonsAndWrapperToGalleries(liDOM) {
  const galleries = liDOM.querySelectorAll(".gallery");
  galleries.forEach((gallery) => {
    const parentElement = gallery.parentElement; // Get the parent element of the gallery
    parentElement.addEventListener("load", function () {
      // Check if gallery is scrollable horizontally
      if (gallery.scrollWidth > gallery.clientWidth) {
        // Create wrapper element
        const wrapper = document.createElement("div");
        wrapper.classList.add("gallery-wrapper");

        // Clone gallery element and append to wrapper
        const galleryClone = gallery.cloneNode(true);
        wrapper.appendChild(galleryClone);

        // Create and append the Previous button
        const prevBtn = document.createElement("button");
        prevBtn.classList.add("prev-btn");
        prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;
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
        nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;
        nextBtn.addEventListener("click", function () {
          galleryClone.scrollBy({
            left: 200, // Adjust scroll distance as needed
            behavior: "smooth",
          });
        });
        wrapper.appendChild(nextBtn);

        // Replace original gallery with wrapper
        gallery.parentNode.replaceChild(wrapper, gallery);

        // Add event listener for scroll event to dynamically check button visibility
        galleryClone.addEventListener("scroll", function () {
          checkButtonVisibility(galleryClone);
        });

        // Add hover listener to galleries
        galleryClone.addEventListener("mouseenter", handleGalleryHover);
      }
    });
  });

  // Add hover listener to galleries
  //addHoverListenerToGallery(liDOM);
}

// Function to check button visibility based on scroll position
function checkButtonVisibility(gallery) {
  const prevBtn = gallery.parentNode.querySelector(".prev-btn");
  const nextBtn = gallery.parentNode.querySelector(".next-btn");

  if (gallery.scrollLeft <= 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "";
  }

  if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "";
  }

  // Ensure Next button is hidden when at the right edge
  if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 1) {
    nextBtn.style.display = "none";
  }
}
