// Firebase Configuration
// Note: These keys are restricted in Firebase Console to only work from authorized domains
const firebaseConfig = {
  apiKey: "AIzaSyCZtiVXvMKX3FodLchIQzIUUqg15htdwyA",
  authDomain: "ai-hebrew.firebaseapp.com",
  projectId: "ai-hebrew",
  storageBucket: "ai-hebrew.firebasestorage.app",
  messagingSenderId: "63571235516",
  appId: "1:63571235516:web:6b81c388fca7d4fc39f6b9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Auth
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user.email);
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));
  } else {
    console.log('User signed out');
    localStorage.removeItem('user');
  }
});

// Sign in with Google
async function signInWithGoogle() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    console.log('Signed in successfully:', result.user.email);
    window.location.href = '/dashboard.html';
    return result.user;
  } catch (error) {
    console.error('Sign in error:', error);
    alert('Sign in failed: ' + error.message);
  }
}

// Sign out
async function signOut() {
  try {
    await auth.signOut();
    console.log('Signed out successfully');
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Check if user is authenticated
function isAuthenticated() {
  return auth.currentUser !== null;
}

// Get current user
function getCurrentUser() {
  return auth.currentUser;
}
