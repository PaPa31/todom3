if (document.getElementById("list-order")) {
  const listorder = document.getElementById("list-order");

  listorder.addEventListener(
    "click",
    function (e) {
      toggleLocalStorageReversedMode();
      toggleStyle();
    },
    false
  );
}

if (isReversed()) {
  toggleStyle();
}

function isReversed() {
  return localStorage.getItem("reversed-mode");
}

function toggleStyle() {
  document.getElementById("content").classList.toggle("reversed");
}

function toggleLocalStorageReversedMode() {
  if (isReversed()) {
    localStorage.removeItem("reversed-mode");
  } else {
    localStorage.setItem("reversed-mode", "set");
  }
}
