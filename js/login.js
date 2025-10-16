"use strict";
// Simple mock user database
const USERS = [
    { email: "admin@venuu.is", password: "12345" },
    { email: "user@venuu.is", password: "password" }
];
// DOM elements
const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
// If the form exists, attach a submit event listener
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput === null || emailInput === void 0 ? void 0 : emailInput.value.trim();
        const password = passwordInput === null || passwordInput === void 0 ? void 0 : passwordInput.value.trim();
        // Check if both fields are filled
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }
        // Try to find a matching user
        const foundUser = USERS.find((u) => u.email === email && u.password === password);
        if (foundUser) {
            localStorage.setItem("userEmail", foundUser.email);
            window.location.href = "index.html";
        }
        else {
            alert("Invalid email or password");
        }
    });
}
//# sourceMappingURL=login.js.map