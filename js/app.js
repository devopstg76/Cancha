(function(){
  const cfg = window.CANCHA_FIREBASE;
  firebase.initializeApp(cfg);
  const auth = firebase.auth();
  const db = firebase.firestore();

  const btnLogin = document.getElementById('btnLoginGoogle');
  const btnLogout = document.getElementById('btnLogout');
  const whoami = document.getElementById('whoami');
  const profileForm = document.getElementById('profileForm');
  const profileMsg = document.getElementById('profileMsg');
  const bookingForm = document.getElementById('bookingForm');
  const bookingMsg = document.getElementById('bookingMsg');
  const myBookings = document.getElementById('myBookings');
  const planningFrame = document.getElementById('planningFrame');
  const openSheet = document.getElementById('openSheet');

  planningFrame.src = window.CANCHA_SHEET.pubUrl || planningFrame.src;
  openSheet.href = window.CANCHA_SHEET.editUrl || '#';

  btnLogin.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  });
  btnLogout.addEventListener('click', () => auth.signOut());

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      whoami.textContent = "Non connecté.";
      btnLogin.classList.remove('hidden');
      btnLogout.classList.add('hidden');
      profileForm.classList.add('hidden');
      bookingForm.classList.add('hidden');
      myBookings.innerHTML = "";
      return;
    }
    whoami.textContent = "Connecté : " + user.email;
    btnLogin.classList.add('hidden');
    btnLogout.classList.remove('hidden');
    profileForm.classList.remove('hidden');
    bookingForm.classList.remove('hidden');

    const uref = db.collection('users').doc(user.uid);
    const snap = await uref.get();
    if (snap.exists) {
      const d = snap.data();
      profileForm.fullName.value = d.fullName || "";
      profileForm.licence.value = d.licence || "";
      profileForm.serie.value = d.serie || "NC";
    }

    db.collection('reservations')
      .where('uid','==',user.uid)
      .orderBy('date','desc').limit(20)
      .onSnapshot((qs)=>{
        myBookings.innerHTML = '<h4>Mes réservations</h4>';
        qs.forEach(doc=>{
          const r = doc.data();
          const div = document.createElement('div');
          div.className = 'item';
          const start = new Date(r.start).toLocaleString();
          const end = new Date(r.end).toLocaleTimeString();
          div.textContent = `${r.court} — ${start} → ${end}`;
          myBookings.appendChild(div);
        });
      });
  });

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = firebase.auth().currentUser; if(!u) return;
    const data = {
      fullName: profileForm.fullName.value.trim(),
      licence: profileForm.licence.value.trim(),
      serie: profileForm.serie.value,
      email: u.email,
      role: 'licencie',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await firebase.firestore().collection('users').doc(u.uid).set(data, { merge: true });
    profileMsg.textContent = "Profil enregistré 👍";
  });

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    bookingMsg.textContent = "";
    const u = firebase.auth().currentUser; if(!u){ bookingMsg.textContent="Non connecté."; return; }
    const date = bookingForm.date.value;
    const startStr = bookingForm.start.value;
    const duration = parseInt(bookingForm.duration.value,10);
    const court = bookingForm.court.value;

    const start = new Date(date + 'T' + startStr + ':00');
    const end = new Date(start.getTime() + duration*60000);

    const id = date.replace(/-/g,'') + '_' + court + '_' + startStr.replace(':','');
    const ref = firebase.firestore().collection('reservations').doc(id);
    try {
      await firebase.firestore().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists) throw new Error('Créneau déjà réservé.');
        tx.set(ref, {
          uid: u.uid, email: u.email,
          court, date,
          start: start.toISOString(),
          end: end.toISOString(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      bookingMsg.textContent = "Réservation confirmée ✅";
      bookingForm.reset();
    } catch(err){
      bookingMsg.textContent = '⚠️ ' + err.message;
    }
  });

})();