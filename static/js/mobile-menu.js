window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("ul#navigation").classList.add("mobile-hidden");
    document.querySelector(".js-toggle-nav .js-header-toggle").click(() => {
        event.preventDefault();
        document.getElementById("ul#navigation").classList.toggle("mobile-hidden");
        document.querySelector("#global-nav").classList.toggle("open");
    })
})