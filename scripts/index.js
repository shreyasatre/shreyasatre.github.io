// Add click event to allow toggling to dark theme.
document.querySelector("#chk").addEventListener("click", () => {
    document.body.classList.toggle("dark");
})

// Trigger click event to force dark theme.
document.querySelector("#chk").dispatchEvent(new Event("click"));