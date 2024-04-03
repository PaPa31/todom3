let images = []; // Define images as a global variable
let touchStartX, touchEndX; // Variables to store touch swipe coordinates
let modalImg = null; // Initialize modalImg as null

// Function to create modal window for the clicked image
function createModalForImage(imageUrl) {
  // Create modal container
  const modal = document.createElement("div");
  modal.id = "imgModal";
  modal.classList.add("modal-image");

  // Create close button
  const closeBtn = document.createElement("span");
  closeBtn.classList.add("close");
  closeBtn.innerHTML = "&times;";
  closeBtn.addEventListener("click", () => {
    modal.remove();
    modalImg = null; // Clear modalImg when modal is removed
  });

  // Create modal content (image)
  modalImg = document.createElement("img");
  modalImg.classList.add("modal-image-content");
  modalImg.src = imageUrl;
  modalImg.addEventListener("click", handleModalImageClick);

  // Create previous button
  const prevBtn = document.createElement("button");
  prevBtn.id = "prevBtn";
  prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;
  prevBtn.addEventListener("click", prevImage);

  // Create next button
  const nextBtn = document.createElement("button");
  nextBtn.id = "nextBtn";
  nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;
  nextBtn.addEventListener("click", nextImage);

  // Append elements to modal container
  modal.appendChild(closeBtn);
  modal.appendChild(prevBtn);
  modal.appendChild(modalImg);
  modal.appendChild(nextBtn);

  // Append modal container to document body
  document.body.appendChild(modal);
}

// Function to handle image click within a gallery block
function handleImageClick(event) {
  const clickedImage = event.target;
  const galleryBlock = clickedImage.closest(".gallery");
  if (galleryBlock) {
    const imagesInBlock = Array.from(galleryBlock.querySelectorAll("img"));
    const imageUrl = clickedImage.src;
    currentImageIndex = imagesInBlock.findIndex((img) => img.src === imageUrl);
    createModalForImage(imageUrl);
    images = imagesInBlock.map((img) => img.src); // Update the global images array
    toggleButtonVisibility(); // Adjust visibility of buttons
  }
}

// Function to add click event listeners to images within gallery blocks
function addClickListenersToImages(liDOM) {
  const galleryBlocks = liDOM.querySelectorAll(".gallery");
  galleryBlocks.forEach((block) => {
    const imagesInBlock = block.querySelectorAll("img");
    imagesInBlock.forEach((img) => {
      img.addEventListener("click", handleImageClick);
    });
  });
}

// Function to show the previous image
function prevImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    if (modalImg) {
      // Check if modalImg is defined
      modalImg.src = images[currentImageIndex];
      toggleButtonVisibility();
    }
  }
}

// Function to show the next image
function nextImage() {
  if (currentImageIndex < images.length - 1) {
    currentImageIndex++;
    if (modalImg) {
      // Check if modalImg is defined
      modalImg.src = images[currentImageIndex];
      toggleButtonVisibility();
    }
  }
}

// Function to toggle visibility of previous and next buttons
function toggleButtonVisibility() {
  const prevBtn = modalImg.getElementById("prevBtn");
  const nextBtn = modalImg.getElementById("nextBtn");
  if (currentImageIndex === 0) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = "";
  }
  if (currentImageIndex === images.length - 1) {
    nextBtn.style.display = "none";
  } else {
    nextBtn.style.display = "";
  }
}

// Function to handle keydown event for keyboard navigation
function handleKeyDown(event) {
  if (event.key === "ArrowLeft") {
    prevImage();
  } else if (event.key === "ArrowRight") {
    nextImage();
  }
}

// Add event listener for keydown event
document.addEventListener("keydown", handleKeyDown);

// Function to handle touch swipe event
function handleTouch(event) {
  touchStartX = event.touches[0].clientX;
}

// Function to handle touch swipe end event
function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  if (touchStartX - touchEndX > 50) {
    // Swipe left
    nextImage();
  } else if (touchEndX - touchStartX > 50) {
    // Swipe right
    prevImage();
  }
}

// Add event listeners for touch events
document.addEventListener("touchstart", handleTouch);
document.addEventListener("touchend", handleTouchEnd);

// Function to handle click on left or right edges of the image
function handleModalImageClick(event) {
  const clickedX = event.clientX;
  const modalImage = document.querySelector(".modal-image");

  if (modalImage) {
    // Modal image exists, proceed with the logic
    const modalWidth = modalImage.offsetWidth;

    if (clickedX < modalWidth / 2) {
      // Clicked on the left side of the image
      prevImage();
    } else {
      // Clicked on the right side of the image
      nextImage();
    }
  }
}
