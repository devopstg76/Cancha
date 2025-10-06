const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onReservationCreate = functions.firestore
  .document('reservations/{id}')
  .onCreate(async (snap, ctx) => {
    const data = snap.data();
    console.log('New reservation', data);
    // TODO: push to Google Sheets or send email.
    return true;
  });
