// ============================================
// FILE: js/auth.js - UPGRADED GLASS LAGOON VERSION
// ============================================

import { registerUser, loginUser, logoutUser, getCurrentUser, loginWithGoogle, loginAsGuest } from '../gd-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const user = await getCurrentUser();
    if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
        return;
    }

    setupLoginForm();
    setupSignupForm();
    setupGoogleButtons();
    setupGuestButtons();
});

// Setup Login Form
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const errEl = document.getElementById('loginError');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (errEl) errEl.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-lagoon"></span> Authenticating...';

        const result = await loginUser(email, password);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Sign In</span> <i class="fas fa-arrow-right"></i>';
            if (errEl) {
                errEl.textContent = result.error || 'Invalid email or password.';
                errEl.style.display = 'block';
            }
        }
    });
}

// Setup Signup Form
function setupSignupForm() {
    const form = document.getElementById('signupForm');
    const errEl = document.getElementById('signupError');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (password !== confirmPassword) {
            if (errEl) {
                errEl.textContent = 'Passwords do not match.';
                errEl.style.display = 'block';
            }
            return;
        }

        if (password.length < 6) {
            if (errEl) {
                errEl.textContent = 'Password must be at least 6 characters.';
                errEl.style.display = 'block';
            }
            return;
        }

        if (errEl) errEl.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-lagoon"></span> Creating account...';

        const result = await registerUser(email, password, name);
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Create Free Account</span> <i class="fas fa-arrow-right"></i>';
            if (errEl) {
                errEl.textContent = result.error || 'Failed to create account.';
                errEl.style.display = 'block';
            }
        }
    });
}

// Setup Google Sign In
function setupGoogleButtons() {
    const googleBtns = document.querySelectorAll('.btn-google-auth');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-lagoon"></span> Connecting Google...';
            const result = await loginWithGoogle();
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                btn.disabled = false;
                btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width: 18px;"> <span>Continue with Google</span>';
                // If popup blocked or unauthorized, offer instant demo access
                const confirmGuest = confirm("Google Sign-In requires an active Firebase popup. Would you like to enter as a Verified Candidate Demo account instead?");
                if (confirmGuest) {
                    loginAsGuest("Alex Rivera (Demo)");
                    window.location.href = 'dashboard.html';
                }
            }
        });
    });
}

// Setup Guest / Demo Button
function setupGuestButtons() {
    const guestBtns = document.querySelectorAll('.btn-guest-auth');
    guestBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginAsGuest();
            window.location.href = 'dashboard.html';
        });
    });
}