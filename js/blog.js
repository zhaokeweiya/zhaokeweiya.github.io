const tabs = document.querySelectorAll(".cat-tab");
const cards = document.querySelectorAll(".post-card");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const cat = tab.dataset.cat;
    cards.forEach((c) => {
      c.style.display = cat === "all" || c.dataset.cat === cat ? "" : "none";
    });
  });
});