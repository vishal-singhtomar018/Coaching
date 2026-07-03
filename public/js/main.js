const nav = document.querySelector("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("bg-white", "shadow-sm");

    nav.classList.remove("bg-transparent");
  } else {
    nav.classList.remove("bg-white", "shadow-sm");

    nav.classList.add("bg-transparent");
  }
});


