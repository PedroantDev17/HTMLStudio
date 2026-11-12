const root = document.documentElement;
const btn = document.getElementById("ibtn");

btn.addEventListener("click", () => {
    const escuro = root.getAttribute("tema-data") === 'escuro'

    if (escuro) {
        root.removeAttribute("tema-data")
    } else {
        root.setAttribute("tema-data", "escuro")
    }
})