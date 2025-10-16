// Type for user
interface User {
  email: string;
  password: string;
}

// Simple mock user database
const USERS: User[] = [
  { email: "admin@venuu.is", password: "12345" },
  { email: "user@venuu.is", password: "password" }
];

// DOM elements
const form = document.getElementById("login-form") as HTMLFormElement | null;
const emailInput = document.getElementById("email") as HTMLInputElement | null;
const passwordInput = document.getElementById("password") as HTMLInputElement | null;

// If the form exists, attach a submit event listener
if (form) {
  form.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    // Check if both fields are filled
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // Try to find a matching user
    const foundUser = USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      localStorage.setItem("userEmail", foundUser.email);
      window.location.href = "index.html";
    } else {
      alert("Invalid email or password");
    }
  });
}
