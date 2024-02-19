import { initializeApp, deleteApp } from "firebase/app";
import {
    getFirestore, arrayUnion, arrayRemove, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, deleteField, doc, query, where, limit, updateDoc
} from "firebase/firestore";
import  configs from "./JSON/configurations.json" assert {type: 'json'};

// initial firebase app
var app = initializeApp(configs[6])
var db;

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}

db = getFirestore()
// collection ref
const jnrRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
const snrRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");
const armRef = doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu");

let i;
//Loop twice and store docs in sessionStorage
for(i = 0; i < 3; i++) {
    switch (i) {
        case 0:
            if(sessionStorage.hasOwnProperty('jnr_sub')) {
                continue;
            }
            await getDoc(jnrRef).then(doc => sessionStorage.setItem('jnr_sub', JSON.stringify(doc.data())))
            console.log('From server')
            break;
        case 1:
            if(sessionStorage.hasOwnProperty('snr_sub')) {
                continue;
            }
            await getDoc(snrRef).then(doc => sessionStorage.setItem('snr_sub', JSON.stringify(doc.data())))
            console.log('From server')
            break;
        case 2:
            if(sessionStorage.hasOwnProperty('arm')) {
                continue;
            }
            await getDoc(armRef).then(doc => sessionStorage.setItem('arm', JSON.stringify(doc.data().arms)))
            console.log('From server')
            break;
    }
}
const jnrArray = Object.entries(JSON.parse(sessionStorage.getItem('jnr_sub'))).sort();
const snrArray = Object.entries(JSON.parse(sessionStorage.getItem('snr_sub'))).sort();
const armArray = JSON.parse(sessionStorage.getItem('arm'));

//load Jnr subs into <datalist>
const abbrDatalist = document.querySelector('datalist#abbr');
const fullTxtDatalist = document.querySelector('datalist#fulltxt');
const armsDatalist = document.querySelector('datalist#arms');
const uls = document.querySelectorAll('.aside__content ul');

function loadSubjectsIntoUls(entries, list) {
    if (list.startsWith('j')) {
        entries.forEach((ent, ind) => {
            uls[0].insertAdjacentHTML('beforeend', `<li>${ind + 1}. ${ent[0]} - ${ent[1]}</li>`)
        })
    }
    if (list.startsWith('s')) {
        entries.forEach((ent, ind) => {
            uls[1].insertAdjacentHTML('beforeend', `<li>${ind + 1}. ${ent[0]} - ${ent[1]}</li>`)
        })
    }
    if (list.startsWith('a')) {
        entries.forEach((ent, ind) => {
            uls[2].insertAdjacentHTML('beforeend', `<li>${ind + 1}. ${ent}</li>`)
            // load datalist#arms as well
            armsDatalist.insertAdjacentHTML('beforeend', `<option value="${ent}"></option>`)
        })
    }
}
loadSubjectsIntoUls(jnrArray, "juniors");
loadSubjectsIntoUls(snrArray, "seniors");
loadSubjectsIntoUls(armArray, "arms");

const myobjects = [JSON.parse(sessionStorage.getItem('jnr_sub')),JSON.parse(sessionStorage.getItem('snr_sub'))];
function mergeObjects(objs) {
    var result = {};
    objs.forEach(obj => {
        for (const key in obj) {
                if (!result.hasOwnProperty(key)) result[key] = obj[key];
        }
    });
    return result;
}

const uniqueAbbr = Object.keys(mergeObjects(myobjects))
const uniqueFullTxt = Object.values(mergeObjects(myobjects))
uniqueAbbr.forEach((abbr, i) => {
    abbrDatalist.insertAdjacentHTML('afterbegin', `<option value="${abbr}"></option>`)
    fullTxtDatalist.insertAdjacentHTML('afterbegin', `<option value="${uniqueFullTxt[i]}"></option>`)
})

const viewChanges = document.querySelector('#view-changes');
viewChanges.addEventListener('click', (e) => {
    sessionStorage.removeItem('jnr_sub')
    sessionStorage.removeItem('snr_sub')
    sessionStorage.removeItem('arm')
    location.reload();
})

function formStatus(e, submit='disabled') {
    e.preventDefault();
    if (submit === 'enabled') {
        e.submitter.disabled = true;
        e.submitter.style.cursor = 'not-allowed'
    } else {
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer'
    }
}

const juniorForm = document.forms.juniorForm;
juniorForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    let obj = new Object();
    if (e.submitter.id === 'submit') {
        const formData = new FormData(juniorForm);
        let abbr = formData.getAll('abbr');
        let txt = formData.getAll('txt');
    
        abbr.forEach((a, i) => obj[a.toUpperCase()] = txt[i]);
        await setDoc(jnrRef, obj, {merge: true})
        window.alert('Subject upload successful');
        formStatus(e);
    } else {
        const formData = new FormData(juniorForm);
        let abbr = formData.getAll('abbr');

        abbr.forEach((a) => obj[a.toUpperCase()] = deleteField())
        await updateDoc(jnrRef, obj)
        window.alert('Subject delete successful');
        formStatus(e);
    }  
})

const seniorForm = document.forms.seniorForm;
seniorForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    let obj = new Object();
    if (e.submitter.id === 'submit') {
        const formData = new FormData(seniorForm);
        let abbr = formData.getAll('abbr');
        let txt = formData.getAll('txt');
    
        abbr.forEach((a,i) => obj[a.toUpperCase()] = txt[i]);
        await setDoc(snrRef, obj, {merge: true})
        window.alert('Subject upload successful');
        formStatus(e);
    } else {
        const formData = new FormData(seniorForm);
        let abbr = formData.getAll('abbr');

        abbr.forEach((a) => obj[a.toUpperCase()] = deleteField())
        await updateDoc(snrRef, obj)
        window.alert('Subject delete successful');
        formStatus(e);
    }
})
const armForm = document.forms.armForm;
armForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(armForm);
    let arms = formData.getAll('arms');

    if (e.submitter.id === 'submit') {
        const promises = arms.map(async arm => {
            await updateDoc(doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu"), {
                arms: arrayUnion(arm),
            })
        })
        await Promise.all(promises)
        window.alert("Arms successfully updated.")
        formStatus(e);
    } else {
        const promises = arms.map(async arm => {
            await updateDoc(doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu"), {
                arms: arrayRemove(arm),
            })
        })
        await Promise.all(promises)
        window.alert("Deletion success.")
        formStatus(e);
    }
})
const cOSForm = document.forms.cOSForm;
cOSForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(cOSForm);
    const optItem = formData.get('abbr'), q_adm = formData.get('adm'), q_cos = formData.getAll('cos');
    const datalcls = document.querySelector('datalist#cls').options;
    const datalAbbr = Array.from(document.querySelector('datalist#abbr').options);
    const datal = datalcls.namedItem(optItem);
    const q_class = Array.from(datalcls).indexOf(datal);
    chooseConfig(q_class);

    let datalfulltxt = Array.from(document.querySelector('datalist#fulltxt').options);
    let obj = {};
    datalfulltxt.forEach((opt, ind) => {
        if (q_cos.includes(opt.value)) {
            let a = datalAbbr[ind].value
            obj[a] = opt.value;
            // update.push(obj)
        }
    })
    // console.log(Object.keys(obj))
    // console.log(update)
    const q = query(collection(db, "students"), where("admission_no", "==", q_adm));
    const docSnap = await getDocs(q);
    if (docSnap.empty) return window.alert('No such student exists.');
    let id, offering;
    docSnap.docs.forEach(doc => {
       id = doc.id;
       offering = doc.data().offered;
    })
    const studentRef = doc(db, "students", id);
    if (e.submitter.id === 'add') {
        await updateDoc(studentRef, {
            offered: { ...offering, ...obj }
        })
        window.alert('Subjects have been successfully added.')
    } else {
        // console.log(offering)
        const mykeys = Object.keys(obj);
        mykeys.forEach(k => {
            delete offering[k];
        })
        // console.log(offering)
        await updateDoc(studentRef, {
            offered: offering
        })
        window.alert('Subjects have been successfully removed.')
    }
    chooseConfig(6);
    formStatus(e);
})
const subjectForm = document.forms.subjectForm;
subjectForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(subjectForm);
    let user = formData.get('username');
    if (!user.trim().length) {
        window.alert("Enter your current username.");
        formStatus(e);
        return;
    }
    const q = query(collection(db, "staffCollection"), where("username", "==", user), limit(1))
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        window.alert("Username does not exist.");
        formStatus(e);
        return;
    }
    let userID;
    querySnapshot.docs.forEach(doc => {
        userID = doc.id;
    })
    let abbr = formData.getAll('abbr')
    let txt = formData.getAll('txt')
    
    if (e.submitter.id === 'add') {
        const promises = 
            abbr.map( async (a,i) => {
                let obj = {};
                obj[a] = txt[i];
                await updateDoc(doc(db, "staffCollection", userID), {
                    subjectsTaught: arrayUnion(obj),
                })
            });

        await Promise.all(promises)
        window.alert("Subject(s) added.");
        formStatus(e)
    } else {
        const promises = 
            abbr.map( async (a,i) => {
                let obj = {};
                obj[a] = txt[i];
                await updateDoc(doc(db, "staffCollection", userID), {
                    subjectsTaught: arrayRemove(obj),
                })
            });

        await Promise.all(promises)
        window.alert("Subject(s) removed.");
        formStatus(e);
    }
})
const classForm = document.forms.classForm;
classForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(classForm);
    let user = formData.get('username');
    if (!user.trim().length) {
        window.alert("Enter your current username.");
        formStatus(e);
        return;
    }
    const q = query(collection(db, "staffCollection"), where("username", "==", user), limit(1))
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        window.alert("Username does not exist.");
        formStatus(e);
        return;
    }
    let userID;
    querySnapshot.docs.forEach(doc => {
        userID = doc.id;
    })
    let abbr = formData.getAll('classesTaught')
    
    if (e.submitter.id === 'register') {
        const promises = 
            abbr.map( async (a) => {
                await updateDoc(doc(db, "staffCollection", userID), {
                    classroomsTaught: arrayUnion(a),
                })
            });
        await Promise.all(promises)
        window.alert("Your class(es) have been updated.");
        formStatus(e)
    } else {
        const promises = 
            abbr.map( async (a) => {
                await updateDoc(doc(db, "staffCollection", userID), {
                    classroomsTaught: arrayRemove(a),
                })
            });

        await Promise.all(promises)
        window.alert("Subject(s) removed.");
        formStatus(e);
    }
})
const mOFForm = document.forms.mOFForm;
mOFForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(mOFForm);
    const user = formData.get('username');
    const cls = formData.get('cls');
    const arm = formData.get('arm');

    const q = query(collection(db, "staffCollection"), where("username", "==", user))
    const queryShot = await getDocs(q);
    if (queryShot.empty) return window.alert("This user does not exist.")/* && formStatus(e)*/

    if (e.submitter.id === 'add') {
        queryShot.docs.forEach(async d => {
            await updateDoc(doc(db, "staffCollection", d.id), {
                masterOfForm: { [cls]: arm },
            })
            window.alert(`'${d.data().fullName}'  has been declared 'Master of Form'.`)
        })
    } else {
        queryShot.docs.forEach(async d => {
            await updateDoc(doc(db, "staffCollection", d.id), {
                masterOfForm: deleteField(),
            })
            window.alert(`'${d.data().fullName}'  has been undeclared 'Master of Form'.`)
        })
    }
    formStatus(e);
})
