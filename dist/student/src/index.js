import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, updateDoc, query, where, and, or, serverTimestamp, orderBy } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
// var [f1, f2, f3, f4, f5, f6] = configs;

const ss = JSON.parse(sessionStorage.getItem('snapshot'));
const studentID = ss.id;
const studentClass = ss.class;
const classCollection = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3","def"];
const classConfiguration = configs[classCollection.indexOf(studentClass)];
//initial firebase app
var app = initializeApp(classConfiguration)
//init services
var db;
// collection refs
function chooseConfig(projConfig) {
    deleteApp(app);
    app = initializeApp(projConfig);
    db = getFirestore();
}

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
document.querySelector("img#avatar").src = ss.photo_src;
//load user subjects
let i;
for (i = 0; i < ss.offered.length; i++) {
    document.querySelector('#subject-navs .inner:last-child').insertAdjacentHTML('beforeend', `<a href="#" value="${ss.offered[i]}">${ss.offered[i]}</a>`)
}

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
async function getDocuments(subject) {
    const group = query(collectionGroup(db, subject));
    const querySnapshot = await getDocs(group);
    if (querySnapshot.empty) return timelineBar.innerHTML = 'There are no tasks to perform.';
    timelineBar.innerHTML = '';
    querySnapshot.forEach((doc) => {
        // console.log(doc.id, ' => ', doc.data());
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
    });
    /*
    //get collection; get subject; PATH: files/mth/notes/*.txt
    const refToDocs = collection(db, "fileCollection");
    const q = query(refToDocs, where("theSubject", "==", arg), where("theClassroom", "==", studentClass)/*, orderBy("theDateCreated", "desc"));
    const docSnaps = await getDocs(q);
    if (docSnaps.empty) return timelineBar.innerHTML = 'There are no tasks to perform.';
    timelineBar.innerHTML = '';
    docSnaps.docs.forEach((doc, i) => {
        // console.log(data.theDateCreated)
    })
    */
};
const subjectNav = document.querySelector('#subject-navs .inner:last-child');
subjectNav.addEventListener('click', (e) => {
    if (e.target.hasAttribute('href')) {
        subjectNav.querySelectorAll('a').forEach(anchor => {
            if (anchor.classList.contains('active')) {
                return anchor.classList.remove('active');
            }
        })
        e.target.classList.add('active');
        chooseConfig(classConfiguration);
        getDocuments(e.target.textContent);
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