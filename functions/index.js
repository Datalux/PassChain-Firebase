const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

async function getSnapshot(ref) {
    return ref.once('value');
}

exports.setUserData = functions.https.onCall(async(data, context) => {
    const name = data.name;
    const surname = data.surname;

    const userRef = admin.database().ref('/users/' + context.auth.uid).ref;

    await userRef.push().ref.set({
        'name': name,
        'surname': surname,
        'email': context.auth.email
    });

    return {
        status: 0
    };
});

exports.checkDoor = functions.https.onCall(async(data, context) => {
    const pin = data.pin;

    const doorRef = admin.database().ref('/doors/' + pin).ref;
    const doorDS = await getSnapshot(doorRef);

    //TODO
    if (doorDS.exists()) {
        return {
            status: 0
        }
    }

    return {
        status: -1
    };
});