import Rebase from 're-base';
import firebase from 'firebase';

const app = firebase.initializeApp(
    {
        apiKey: "AIzaSyBeUCEuz8VGw9J0c1wJZ6denAiMfxjEqkM",
        authDomain: "noted-d9faf.firebaseapp.com",
        databaseURL: "https://noted-d9faf.firebaseio.com",
    }
);

const base = Rebase.createClass(app.database());

const auth = firebase.auth();

export {base, auth};