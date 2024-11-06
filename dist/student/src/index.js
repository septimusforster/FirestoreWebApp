import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";

import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
// var [f1, f2, f3, f4, f5, f6] = configs;

const ss = JSON.parse(sessionStorage.getItem('snapshot'));
const classIndex = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3","Demo"].indexOf(ss.class);
const classConfiguration = configs[classIndex];
//initial firebase app
var app = initializeApp(classConfiguration)
//init services
var db = getFirestore();
// collection refs

// get EOT for session
const session = '2025';
const userRef = doc(db, 'session', session, 'students', ss.id);
/*
function chooseConfig(projConfig) {
    deleteApp(app);
    app = initializeApp(projConfig);
    db = getFirestore();
}
*/
//load user profile data
document.querySelectorAll('#profile-nav div').forEach(div => {
    if (div.id === "full_name") {
        div.lastElementChild.textContent = ss.last_name.concat(" ", ss.first_name, " ", ss.other_name);
    } else {
        div.lastElementChild.textContent = ss[div.id];
    }
})
//load user picture
document.querySelector("img#avatar").src = ss.photo_src || '../img/../img/9035117_person_icon.png';
//load user subjects
let offered = Object.entries(ss.offered);
let i;
offered.forEach((o) => {
    document.querySelector('#subject-navs .inner:last-child').insertAdjacentHTML('beforeend', `<a href="#" id="${o[0]}">${o[1]}</a>`)
})

const formUser = document.forms.formUser;
const currentUser = formUser.querySelector('#currentUsername');
const headerParagraph = document.querySelector('header p');
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
    await updateDoc(userRef,{
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
let cfp;
formPass.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cfp) {
        loadStart(e);
        const formData = new FormData(formPass);
        await updateDoc(userRef, {
            password: formData.get('password'),
            timestamp: serverTimestamp()
        })
        loadEnd(e);
    }
})

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
    });
});
const hideUnhide = document.querySelector('#hide__unhide');
hideUnhide.addEventListener('change', (e) => {
    if (e.target.checked) {
        passwords.forEach(password => {
            password.type = 'text'
        })
    } else {
        passwords.forEach(password => {
            password.type = 'password'
        })
    }
});
const timelineBar = document.querySelector('#timeline-bar');
async function getDocuments(category, subject) {
    // const group = query(collectionGroup(db, subject))
    const querySnapshot = await getDocs(collection(db, "activities", category, subject));
    if (querySnapshot.empty) return timelineBar.innerHTML = 'There are no tasks to perform.';
    timelineBar.innerHTML = '';
    let counter = 0;
    let payload = [];
    querySnapshot.forEach((doc, i) => {
        let data = doc.data();
        let docName = doc.data().name;
        let title = docName.slice(0,docName.lastIndexOf('.'));
        if (category === 'test') {
            data.chosen = [];
            payload.push(data);
        }
        timelineBar.insertAdjacentHTML('beforeend', `
        <div class="timeline-content">
            <input type="checkbox" class="accordion__input" id="cb${counter+1}"/>
            <label for="cb${counter+1}" class="accordion__label" title="${title}">#${data.catNo || counter+1} ${title}</label>
            <div class="accordion__content">
                <p>${data.info || data.instr[0] || "No messages."}</p>
                ${title != "No topic" ? `<a href="${data.dest || `./quiz.html?ct=${data.catNo}&uid=${ss.id}&sb=${subject}`}" ${category === 'test' ? '' : 'download='+title}>Download ${data.catPath || 'test'}</a>` : ""}    
            </div>
        </div>
        `)
        document.querySelectorAll('.timeline-content')[counter].style.setProperty('--beforeContent',`"${data.timestamp || data.startDate}"`);
        counter++;
    });
    if (payload.length) sessionStorage.setItem(subject, JSON.stringify(payload))
};

const subjectNav = document.querySelector('#subject-navs .inner:last-child');
subjectNav.addEventListener('click', (e) => {
    e.preventDefault();
    let ctx = document.querySelector('#ctx-txt').textContent.toLowerCase();
    if (e.target.hasAttribute('href')) {
        subjectNav.querySelectorAll('a').forEach(anchor => {
            if (anchor.classList.contains('active')) {
                return anchor.classList.remove('active');
            }
        })
        e.target.classList.add('active');
    }
    if (ctx === "test" && sessionStorage.hasOwnProperty(e.target.id)) {
        // use testPayload, which is an array of the objects, to setup the test links
        timelineBar.innerHTML = '';
        const doc = JSON.parse(sessionStorage.getItem(e.target.id));
        let sb = e.target.id;
        let dt = Date.now();
        doc.forEach((data, i) => {
            let docName = data.name;
            let title = docName.slice(0,docName.lastIndexOf('.'));
            // let cde = `<code>${data.code}</code>`;
            let [h, m] = data.startTime.split(':');
            let ulimit = 15;   //15 i.e. 1500, school close time
            const d = new Date(data.startDate).setHours(Number(h), Number(m) - 5);
            const e = new Date(data.startDate).setHours(ulimit, Number(m) + data.duration);
            let cde = '';
            if (d < dt && e > dt) cde = `<code>${data.code}</code>`;
            timelineBar.insertAdjacentHTML('beforeend', `
                <div class="timeline-content">
                    <input type="checkbox" class="accordion__input" id="cb${i+1}"/>
                    <label for="cb${i+1}" class="accordion__label" title="${title}">#${data.catNo} ${title}</label>
                    <div class="accordion__content">
                        <p>${data.instr[0] || "No instructions."}</p>
                        ${title != "No topic" ? `<a href="${data.dest || `./quiz.html?ct=${data.catNo}&uid=${ss.id}&sb=${sb}`}">Download test</a>` : ""}
                        ${cde}
                    </div>
                </div>
            `);
            document.querySelectorAll('.timeline-content')[i].style.setProperty('--beforeContent',`"${data.startDate}"`);
        });

        //<code> buttons
        const toast = document.querySelector('div.toast');
        const codeBtns = document.querySelectorAll('code');
        codeBtns.forEach(cd => {
            cd.addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.target.textContent);
                //display toast
                toast.classList.add('shw');
                const toastID = setTimeout(() => {
                    toast.classList.remove('shw');
                    clearTimeout(toastID);
                }, 3000);
            });
        });
    } else {
        // get document from server and store it in 'testPayload' sessionStorage
        getDocuments(ctx, e.target.id);
    }
});