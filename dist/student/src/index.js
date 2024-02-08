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
const headerParagraph = document.querySelector('header p');
//load user profile data
document.querySelectorAll('#profile-nav div').forEach(div => {
    if (div.id === "full_name") {
        div.lastElementChild.textContent = ss.last_name.concat(" ", ss.first_name, " ", ss.other_name);
    } else {
        div.lastElementChild.textContent = ss[div.id];
    }
})
//load user picture
document.querySelector("img[alt='Photo']").src = ss.photo_src;
//load user subjects
let i;
for (i = 0; i < ss.offered.length; i++) {
    document.querySelector('#subject-nav').insertAdjacentHTML('beforeend', `<a href="#" value="${ss.offered[i]}">${ss.offered[i]}</a>`)
}
const studentID = ss.id;
const studentClass = ss.class;
// collection refs
const ref = doc(db, studentClass, studentID);
const refToDocs = collection(db, "fileCollection");

const formUser = document.forms.formUser;
const currentUser = formUser.querySelector('#currentUsername');

headerParagraph.innerHTML = (currentUser.dataset.value = ss.em) + "&nbsp; &nearrow;";
formUser.addEventListener('change', (e) => {
    if (e.target.id === "currentUsername" && e.target.value === e.target.dataset.value) {
        e.target.disabled = true;
        e.target.parentElement.lastElementChild.classList.add('active');
    }
})
formUser.addEventListener('submit', async (e) => {
    e.preventDefault();
    loadStart(e);
    const formData = new FormData(formUser);
    const docSnap = await updateDoc(ref,{
        email: formData.get('email'),
        timestamp: serverTimestamp()
    })
    loadEnd(e);
    // formUser.reset();
})

function loadStart(event) {
    event.submitter.style.pointerEvents = 'none';
    event.submitter.parentElement.querySelector('i:first-child').classList.add('active');
}
function loadEnd(event) {
    event.submitter.parentElement.querySelectorAll('i').forEach(i => {
        i.classList.toggle('active');
    })
}

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
    if (cfp) {
        loadStart(e);
        const formData = new FormData(formPass);
        const docSnap = await updateDoc(ref, {
            password: formData.get('password'),
            timestamp: serverTimestamp()
        })
        loadEnd(e);
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
        document.querySelectorAll('.timeline-content')[i].style.setProperty('--beforeContent',`"${data.theDateCreated}"`);
        // console.log(data.theDateCreated)
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
const dialog = document.querySelector('dialog#photo-dialog');
headerParagraph.addEventListener('click', (e) => {
    if (ss.ue) {
        dialog.insertAdjacentHTML('beforeend', "<button onclick='changePhoto()'></button>")
    } else {
        dialog.showModal();
    }
})
async function changePhoto() {
    const updateSnap = await updateDoc(ref, {
        photo: 'base64',
        upload_enabled: false,
        timestamp: serverTimestamp(),
    })
}
/*
const demoSnap = await getDoc(doc(db, "JSS 3", "13IPf5eMe3sFCTBnBc8T"));
console.log(demoSnap.data());
*/