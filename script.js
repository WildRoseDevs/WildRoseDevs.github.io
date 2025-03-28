document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("main-nav");

    toggle.addEventListener("click", function () {
        nav.classList.toggle("show");
    });
});

// Scroll to Top Button
const scrollUpButton = document.getElementById("scroll-up");
if (scrollUpButton) {
    scrollUpButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
        scrollUpButton.style.display = window.scrollY > 200 ? "block" : "none";
    });
}
