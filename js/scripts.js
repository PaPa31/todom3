const form = document.querySelector("form");
const ul = document.querySelector("ul");
const button = document.querySelector("button");
const input = document.getElementById("item");

let itemsArray = localStorage.getItem("items")
  ? JSON.parse(localStorage.getItem("items"))
  : [];

const liMaker = (text) => {
  const li = document.createElement("li");
  li.textContent = text;
  ul.appendChild(li);
  aMaker(li);
};

const aMaker = (liTag) => {
  const aTag = document.createElement("a");
  aTag.setAttribute("class", "delete-one-item");
  aTag.setAttribute("href", "javascript: void(0)");
  aTag.setAttribute("onclick", "deleteOneItem(this.parentElement)");
  aTag.setAttribute("title", "Delete item");
  aTag.innerHTML = "del";

  liTag.appendChild(aTag);
};

const deleteOneItem = (item) => {
  ul.removeChild(item);
  const itemDeleteIndex = itemsArray.indexOf(item.firstChild.data);
  itemsArray.splice(itemDeleteIndex, 1);
  localStorage.removeItem("items");
  localStorage.setItem("items", JSON.stringify(itemsArray));
};

form.addEventListener("submit", function (e) {
  e.preventDefault();

  itemsArray.push(input.value);
  localStorage.setItem("items", JSON.stringify(itemsArray));

  liMaker(input.value);
  input.value = "";
});

itemsArray?.forEach((item) => {
  liMaker(item);
});

button.addEventListener("click", function (e) {
  if (confirm("Are you sure?")) {
    localStorage.removeItem("items");
    itemsArray = [];
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  } else {
    e.preventDefault();
  }
});
