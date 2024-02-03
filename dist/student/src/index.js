import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, query, where, and, or, serverTimestamp, orderBy } from "firebase/firestore";

const firebaseConfig = {    
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
/*
const firebaseConfig = {
    apiKey: "AIzaSyCT92x3HE8nUsYsKgQ2eJZU7DHQ83mTgwE",
    authDomain: "dca-mobile-26810.firebaseapp.com",
    projectId: "dca-mobile-26810",
    storageBucket: "dca-mobile-26810.appspot.com",
    messagingSenderId: "843119620986",
    appId: "1:843119620986:web:e1a4f469626cbd4f241cc3"
};
*/
// initialize firebase app
initializeApp(firebaseConfig)
// init services

const db = getFirestore()
const ss = JSON.parse(sessionStorage.getItem('snapshot'));

document.querySelectorAll('#profile-nav div').forEach(div => {
    if (div.id === "full_name") {
        div.lastElementChild.textContent = ss.last_name.concat(" ", ss.first_name, " ", ss.other_name);
    } else {
        div.lastElementChild.textContent = ss[div.id];
    }
})
const studentID = ss.snapshotId;
const studentClass = ss.class;
// collection refs
const ref = doc(db, studentClass, studentID);
const refToDocs = collection(db, "fileCollection");

const formUser = document.forms.formUser;
const currentUser = formUser.querySelector('#currentUsername');

currentUser.dataset.value = ss.em;
formUser.addEventListener('change', (e) => {
    if (e.target.id === "currentUsername" && e.target.value === e.target.dataset.value) {
        e.target.disabled = true;
        e.target.parentElement.lastElementChild.classList.add('active');
    }
})
formUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formUser);
    const docSnap = await updateDoc(ref,{
        email: formData.get('email'),
        timestamp: serverTimestamp()
    })
    console.log('Username changed, though it will take some time to effect.')
})

const formPass = document.forms.formPass;
const currentPassword = formPass.querySelector('#currentPassword');

currentPassword.dataset.value = ss.pwd;
formPass.addEventListener('change', (e) => {
    if (e.target.id === "currentPassword" && e.target.dataset.value === e.target.value) {
        e.target.disabled = true;
        e.target.parentElement.lastElementChild.classList.add('active');
    }
})
formPass.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cfp) { // && new and confirm password are the same
        const formData = new FormData(formPass);
        console.log(formData.get('password'));
        const docSnap = await updateDoc(ref, {
            password: formData.get('password'),
            timestamp: serverTimestamp()
        })
        console.log("Password changed, though it will take some time to effect.");
    }
})

let cfp;
const passwords = formPass.querySelectorAll('input[name="password"]');
passwords.forEach((password, index) => {
    password.addEventListener('change', (e) => {
        if(passwords[Math.abs(index - 1)].value == "") return;
        if (passwords[Math.abs(index - 1)].value == e.target.value) {
            cfp = e.target.value;
            e.target.classList.remove('invalid');
            passwords[Math.abs(index - 1)].classList.remove('invalid');
        } else {
            cfp = undefined;
            e.target.classList.toggle('invalid');
        }
        // console.log(passwords[index].value)
    })
})

const timelineBar = document.querySelector('#timeline-bar');
async function getDocuments(arg) {
    const q = query(refToDocs, where("theSubject", "==", arg), where("theClassroom", "==", studentClass)/*, orderBy("theDateCreated", "desc")*/);
    const docSnaps = await getDocs(q);
    if (docSnaps.empty) return timelineBar.innerHTML = 'There are no tasks to perform.';
    timelineBar.innerHTML = '';
    docSnaps.docs.forEach((doc, i) => {
        let data = doc.data();
        let docName = doc.data().theFileName || "No topic.";
        let title = docName.slice(0,docName.lastIndexOf('.'));
        timelineBar.insertAdjacentHTML('beforeend', `
        <div class="timeline-content">
            <input type="checkbox" class="accordion__input" id="cb${i+1}" />
            <label for="cb${i+1}" class="accordion__label" title="${title}">#${i+1} ${title}</label>
            <div class="accordion__content">
                <p>${data.info ? data.info : "No messages."}</p>
                ${title != "No topic" ? `<a href="${data.theFileEncoding}" download="${title}">Download ${data.category}</a>` : ""}    
            </div>
        </div>
        `)
    })
};
const subjectNav = document.querySelector('#subject-nav');
subjectNav.addEventListener('click', (e) => {
    if (e.target.hasAttribute('href')) {
        subjectNav.querySelectorAll('a').forEach(anchor => {
            if (anchor.classList.contains('active')) {
                return anchor.classList.remove('active');
            }
        })
        e.target.classList.add('active');
        // getDocuments(e.target.textContent);
    }
})
// getDocuments();

/*
const demoSnap = await getDoc(doc(db, "JSS 3", "13IPf5eMe3sFCTBnBc8T"));
console.log(demoSnap.data());
*/