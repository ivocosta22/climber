// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


//This is my Database. As you can see this is just a configuration file. As my database is not local. It's set up on the web.
//This is Firebase. An App development platform that I'm using as a Database for my project.
//I'm currently using 4 of their Modules. Authentication, Storage, Firebase Database and Firebase Firestore.
//If you check the ./images directory, you will see how my Firebase dashboard looks and how my database it set up.

//Authentication:
//In Authentication, I have all the users that I created, and what method they used to create their account.
//Firebase provides a handful of methods to signup/login. The methods I wanted to implement was login using email/password,
//Google Authentication, AppleID, and Twitter. I ended up only using Email/Password Authentication using the following functions/methods that you can search inside the project:
//getAuth(app) (It gets the current authentication state from the App's configuration (This file))
//auth.onAuthStateChanged (Runs when the current state of the user changes).
//signInWithEmailAndPassword (Runs whenever the user attempts to login).
//sendPasswordResetEmail (Runs whenever the user attempts to send a password reset if they for example forgot their password).
//createUserWithEmailAndPassword (Runs whenever a new user attempts to create a new account using a provided email/password).
//sendEmailVerification (Runs whenever an Email verification needs to be sent to a newly created email).
//EmailAuthProvider.credential (Initializes a AuthCredential to be used in the future in case the user needs to reauthenticate for a password/email change for example).
//reauthenticateWithCredential (Reauthenticates the user with provided credentials (Mostly using the EmailAuthProvider.credential mentioned above)).
//verifyBeforeUpdateEmail (Runs whenever the user is updating their email inside the App. Firebase sends a verification email to the new email, and as soon as it's updated,
//the old email receives an email informing that the email used for the app as been changed. For security reasons, the user can revert this change by clicking on the link provided in
//the old email's email).
//updatePassword (Runs whenever the user is attempting to change the password, it simply takes a provided AuthCredential and updates the password).
//Unfortunately, due to me using Expo to create and program this React Native project, apparently from my research there is
//currently an unsolved problem when it comes to authentication using Google, AppleID and Twitter. According to the users,
//expo didn't work with those login methods for android, which is not something I want. I want to provide the same experience
//for both iOS and Android.
//So I first started installing the Google Auth package, which Expo tells me it's deprecated, so that instantly was not an option for me to use
//I've checked the updated method, called Auth Session, and watched multiple tutorials about it, I also was paying attention to the official
//documentation provided by Expo. After I implemented the login method, I tested it on my Expo Go App, which works fine. But after building the
//standalone APK for Android. The result of the login method was returning a 'dismiss'. I tried looking for the reason why this was happening,
//and eventually found a tutorial speaking about it. The person in the tutorial said that if I was looking to build
//standalone packages for each platform, which I am, then AuthSession was not the way to do it, as there is currently issues with it, and immediately
//mentioned the same issue I was facing.
//I could've chosen to follow the deprecated method, but for some reason that wasn't working either, so I assumed it was because it was deprecated.
//All the links about this issue are provided below:
//https://www.youtube.com/watch?v=QT0PXhH9uTg
//https://www.youtube.com/watch?v=hmZm_jPvWWM
//https://github.com/expo/expo/issues/6679
//https://docs.expo.dev/versions/latest/sdk/auth-session/

//Firebase Firestore:
//This is very straight forward, I use this module for the posts inside my app. These are the functions/methods I use:
//getFirestore(app) (It gets the current Firestore state from the App's configuration (This file))
//addDoc (Adds a 'Document' to the Firestore with provided parameters/objects/arguments. In my case I send a post with variables provided such as
//userID, Post Text, Post Image if it exists, Post Time, Likes and Comments).
//getDocs (Gets all the 'Documents', or in my case posts.) After I do this I run a forEach statement to push each individual document to a list and show it in the UI.

//Storage:
//Also very straight forward. I'm using storage to store the user's profile pictures and respective posts.
//Methods/Functions I use:
//getStorage(app) (It gets the current Storage state from the App's configuration (This file))
//uploadBytesResumable (It runs whenever the user is uploading an image to Firebase. It gets uploaded as a blob).
//getDownloadURL (Gets the URL of an upload image. I use this to handle the image past upload).

//Realtime Database:
//This Database updates super fast, hence why it's called Realtime.
//I'm using this database to send the user's info (UserID, Username, Profile Picture URL, Bio, Follower and Following list and Liked Posts)
//Methods/Functions I use:
//get (Gets the database content or any child/value that I need)
//update (Updates any path provided in the function with the data provided)
//push (I used this for the user's liked posts) (It pushes to the database the same way the Array.push works.)
//remove (Deletes a path/child/value provided to the database)

//Additional Note: If you want to test this App using your own Firebase Project, make sure you create your own.
//https://firebase.google.com/
//Create a Project -> When Firebase says 'Get started by adding Firebase to your app' Click on the Web Icon
//Give it a name and press register
//Firebase will then give you the config for you to insert here.
//Check firebaseConfig.png in ./images directory for better understanding
//For now, I will leave my own config here, this will be removed in the future to preserve the secutiry of my
//API key. Thank you.
export const firebaseConfig = {
  apiKey: "AIzaSyDSFjmtdZ0KFpUZSuu_97vGcX9ajfHD6aQ",
  authDomain: "climber-3b27e.firebaseapp.com",
  projectId: "climber-3b27e",
  storageBucket: "climber-3b27e.appspot.com",
  messagingSenderId: "806149464222",
  appId: "1:806149464222:web:94711ec5f362239b035b8f",
  measurementId: "G-WT2V921ZQV",
  databaseURL: "https://climber-3b27e-default-rtdb.europe-west1.firebasedatabase.app"
}
