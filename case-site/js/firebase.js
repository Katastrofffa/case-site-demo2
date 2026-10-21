import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ==== ЗАМЕНИ НА СВОЙ КОНФИГ ИЗ FIREBASE CONSOLE ====
const firebaseConfig = {
    apiKey: 'ТВОЙ_API_KEY',
    authDomain: 'ТВОЙ_PROJECT.firebaseapp.com',
    projectId: 'ТВОЙ_PROJECT_ID',
    storageBucket: 'ТВОЙ_PROJECT.appspot.com',
    messagingSenderId: 'ТВОЙ_SENDER_ID',
    appId: 'ТВОЙ_APP_ID',
};
// ====================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.fb = {
    auth, db, provider,
    signInWithPopup, signOut, onAuthStateChanged, updateProfile,
    doc, getDoc, setDoc,
    currentUser: null,
    userDoc: null,
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        let snap;
        try { snap = await getDoc(userRef); } catch (e) { console.error(e); }

        let data;
        if (snap && snap.exists()) {
            data = snap.data();
        } else {
            data = {
                nick: user.displayName || 'Игрок',
                photoURL: user.photoURL || '',
                email: user.email || '',
                createdAt: Date.now(),
            };
            try { await setDoc(userRef, data); } catch (e) { console.error(e); }
        }

        window.fb.currentUser = user;
        window.fb.userDoc = data;
        window.dispatchEvent(new CustomEvent('fb:login', { detail: { user, data } }));
    } else {
        window.fb.currentUser = null;
        window.fb.userDoc = null;
        window.dispatchEvent(new CustomEvent('fb:logout'));
    }
});