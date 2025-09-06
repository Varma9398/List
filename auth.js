// Supabase configuration
const SUPABASE_URL = 'https://baoawezgwrotnnfaclwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhb2F3ZXpnd3JvdG5uZmFjbHdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTQ0ODEsImV4cCI6MjA3MjYzMDQ4MX0.cCoJrik_WBs-DYavxi9GvtOSAsHpsP5yjW6-RpNz5o4';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication state
let currentUser = null;
let isAuthenticated = false;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();
    updateUI();
});

// Check if user is authenticated
async function checkAuthStatus() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) {
            console.error('Auth error:', error);
            return;
        }
        
        currentUser = user;
        isAuthenticated = !!user;
    } catch (error) {
        console.error('Error checking auth status:', error);
        isAuthenticated = false;
    }
}

// Sign up function
async function signUp(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in function
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        currentUser = data.user;
        isAuthenticated = true;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out function
async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            throw error;
        }
        
        currentUser = null;
        isAuthenticated = false;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update UI based on authentication status
function updateUI() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const platformRows = document.querySelectorAll('.platform-row');
    
    if (isAuthenticated) {
        // Show user info and sign out button
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) {
            userInfo.style.display = 'block';
            userInfo.innerHTML = `
                <span>Welcome, ${currentUser?.email || 'User'}!</span>
                <button onclick="handleSignOut()" class="sign-out-btn">Sign Out</button>
            `;
        }
        
        // Remove blur from platform names
        platformRows.forEach(row => {
            row.classList.remove('blurred');
        });
    } else {
        // Show auth buttons
        if (authButtons) authButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
        
        // Add blur to platform names
        platformRows.forEach(row => {
            row.classList.add('blurred');
        });
    }
}

// Handle sign up
async function handleSignUp() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    const result = await signUp(email, password);
    
    if (result.success) {
        showMessage('Check your email for verification link!', 'success');
        closeAuthModal();
    } else {
        showMessage(result.error, 'error');
    }
}

// Handle sign in
async function handleSignIn() {
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const result = await signIn(email, password);
    
    if (result.success) {
        showMessage('Successfully signed in!', 'success');
        closeAuthModal();
        updateUI();
    } else {
        showMessage(result.error, 'error');
    }
}

// Handle sign out
async function handleSignOut() {
    const result = await signOut();
    
    if (result.success) {
        showMessage('Successfully signed out!', 'success');
        updateUI();
    } else {
        showMessage(result.error, 'error');
    }
}

// Show auth modal
function showAuthModal(type) {
    const modal = document.getElementById('authModal');
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    
    if (type === 'signin') {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'none';
    
    // Clear forms
    document.getElementById('signinEmail').value = '';
    document.getElementById('signinPassword').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirmPassword').value = '';
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        currentUser = session.user;
        isAuthenticated = true;
        updateUI();
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        isAuthenticated = false;
        updateUI();
    }
});

// Make functions globally available
window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.handleSignOut = handleSignOut;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
