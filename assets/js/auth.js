// Google OAuth configuration
const googleConfig = {
    client_id: '505805190701-tamf3pslp0jd12dia097fpqp3mvomhqs.apps.googleusercontent.com',
    client_secret: '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'
};

// Initialize Google OAuth
function initGoogleAuth() {
    google.accounts.id.initialize({
        client_id: googleConfig.client_id,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    // Display the Sign In With Google button
    google.accounts.id.renderButton(
        document.getElementById("googleSignInBtn"), {
            theme: "filled_blue",
            size: "large",
            width: "100%",
            text: "continue_with"
        }
    );
}

// Handle Google Sign In
async function handleGoogleSignIn(response) {
    try {
        // Get the ID token from the response
        const credential = response.credential;
        
        // Decode the JWT token to get user information
        const payload = parseJwt(credential);
        
        console.log("User Details:", payload);
        
        // Store user info in localStorage
        const userData = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            token: credential,
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));

        // Update UI or redirect
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Authentication error:', error);
        showError('Authentication failed. Please try again.');
    }
}

// Function to parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        throw new Error('Invalid token format');
    }
}

// Function to trigger Google Sign In
function signInWithGoogle() {
    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
            console.error('Google Sign In not displayed:', notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
            console.warn('Google Sign In skipped:', notification.getSkippedReason());
        }
    });
}

// Function to sign out
function signOut() {
    // Clear user data
    localStorage.removeItem('user');
    
    // Revoke Google authentication
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (token) {
        google.accounts.id.revoke(token, () => {
            console.log('Token revoked');
        });
    }
    
    // Redirect to sign in page
    window.location.href = 'sign-in.html';
}

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user && !isPublicPage()) {
        window.location.href = 'sign-in.html';
        return false;
    }
    return true;
}

// Helper function to check if current page is public
function isPublicPage() {
    const publicPages = ['/sign-in.html', '/sign-up.html', '/forgot-password.html'];
    return publicPages.includes(window.location.pathname);
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        console.error(message);
    }
}

// Update user profile in UI
function updateUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const profileElements = document.querySelectorAll('.user-profile');
        profileElements.forEach(element => {
            element.innerHTML = `
                <img src="${user.picture}" alt="${user.name}" class="avatar-img rounded-circle">
                <div class="ms-2">
                    <h6 class="mb-0">${user.name}</h6>
                    <p class="small m-0">${user.email}</p>
                </div>
            `;
        });
    }
}
