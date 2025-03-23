document.addEventListener("DOMContentLoaded", function () {
  let searchInput = document.getElementById("search");
  let clearIcon = document.getElementById("clearIcon");

  searchInput.addEventListener("keyup", function (event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      searchRecipes();
    }
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      navigateResults(event);
    }
  });

  searchInput.addEventListener("input", function () {
    if (this.value.trim() !== "") {
      clearIcon.style.display = "block";
    } else {
      clearIcon.style.display = "none";
      showAllRecipes();
    }
  });

  clearIcon.addEventListener("click", function () {
    searchInput.value = "";
    searchInput.focus();
    clearIcon.style.display = "none";
    showAllRecipes();
  });
});

let searchIndex = -1;
function searchRecipes() {
  let input = document.getElementById("search").value.toLowerCase();
  let cards = document.getElementsByClassName("recipe-card");
  let found = false;
  searchIndex = -1;

  for (let i = 0; i < cards.length; i++) {
    let title = cards[i].querySelector(".card-title").textContent.toLowerCase();
    if (title.includes(input)) {
      cards[i].classList.add("show");
      cards[i].style.display = "block";
      found = true;
    } else {
      cards[i].classList.remove("show");
      cards[i].style.display = "none";
    }
  }

  document.getElementById("noResults").style.display = found ? "none" : "block";
}

function showAllRecipes() {
  let cards = document.getElementsByClassName("recipe-card");
  for (let i = 0; i < cards.length; i++) {
    cards[i].classList.add("show");
    cards[i].style.display = "block";
  }
  document.getElementById("noResults").style.display = "none";
}

// 🔹 Arrow Key Navigation (Focus & Scroll)
function navigateResults(event) {
  let cards = document.querySelectorAll(".recipe-card.show .card");

  if (cards.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    searchIndex = (searchIndex + 1) % cards.length;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    searchIndex = (searchIndex - 1 + cards.length) % cards.length;
  }

  if (searchIndex >= 0 && searchIndex < cards.length) {
    cards[searchIndex].focus();
    cards[searchIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
