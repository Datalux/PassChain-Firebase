const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = admin.initializeApp();

const generate = require('nanoid/generate');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

function generatePIN() {
    return generate('1234567890', 5);
}

async function getSnapshot(ref) {
    return ref.once('value');
}

exports.setUserData = functions.https.onCall(async(data, context) => {
    const name = data.name;
    const surname = data.surname;

    await admin.database().ref('/users/' + context.auth.uid).ref.set({
        'name': name,
        'surname': surname,
        'email': context.auth.token.email
    });

    return {
        status: 0,
        pin: generatePIN()
    };
});

exports.checkDoor = functions.https.onCall(async(data, context) => {
    const doorID = data.pin;

    const doorRef = admin.database().ref('/doors/' + doorID).ref;
    const doorDS = await getSnapshot(doorRef);

    if (doorDS.exists() && doorDS.val().toString() === '1') {
        var payload = {
            data: {
                id: doorID
            }
        }

        admin.messaging().sendToTopic("openDoor", payload);

        return {
            status: 0
        }
    }

    return {
        status: -1
    };
});