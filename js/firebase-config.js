// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBDJE9CoS_N8fdtqgHYwDMWPGkFuCIj5zo",
    authDomain: "minsukim-database-72105.firebaseapp.com",
    projectId: "minsukim-database-72105",
    storageBucket: "minsukim-database-72105.appspot.com",
    messagingSenderId: "532092657612",
    appId: "1:532092657612:web:a2f8cfb62deb71ce6d4769",
    measurementId: "G-EZ9Z5RVM9J"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
