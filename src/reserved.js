import { initializeApp, deleteApp } from "firebase/app";
import {
    getFirestore, arrayUnion, arrayRemove, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, deleteField, doc, query, and, where, limit, updateDoc
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
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
const staffRef = collection(db, "staffCollection");

let i;
//Loop twice and store docs in sessionStorage
for(i = 0; i < 4; i++) {
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
        case 3:
            if(sessionStorage.hasOwnProperty('staffers')) {
                continue;
            }
            const q = query(staffRef, where("code", "!=", "USADEY"))
            let data = {}
            await getDocs(q).then(doc => doc.forEach(uname => {
                data[uname.id] = uname.data().fullName;
            }))
            sessionStorage.setItem('staffers', JSON.stringify(data));
            console.log('From server');
            break;
    }
}
const jnrArray = Object.entries(JSON.parse(sessionStorage.getItem('jnr_sub'))).sort();
const snrArray = Object.entries(JSON.parse(sessionStorage.getItem('snr_sub'))).sort();
const armArray = JSON.parse(sessionStorage.getItem('arm'));
const staffArray = Object.entries(JSON.parse(sessionStorage.getItem('staffers')));

// load Jnr subs into <datalist>
const abbrDatalist = document.querySelector('datalist#abbr');
const fullTxtDatalist = document.querySelector('datalist#fulltxt');
const armsDatalist = document.querySelector('datalist#arms');
const staffDatalist = document.querySelector('datalist#staff');
const uls = document.querySelectorAll('.aside__content ul');

function loadSubjectsIntoUls(entries, list) {
    if (list.startsWith('jun')) {
        entries.forEach((ent, ind) => {
            uls[0].insertAdjacentHTML('beforeend', `<li>${ind + 1}. ${ent[0]} - ${ent[1]}</li>`)
        })
    }
    if (list.startsWith('sen')) {
        entries.forEach((ent, ind) => {
            uls[1].insertAdjacentHTML('beforeend', `<li>${ind + 1}. ${ent[0]} - ${ent[1]}</li>`)
        })
    }
    if (list.startsWith('arm')) {
        entries.forEach((ent, ind) => {
            uls[2].insertAdjacentHTML('beforeend', `<li>${ind + 1}. ${ent}</li>`)
            // load datalist#arms as well
            armsDatalist.insertAdjacentHTML('beforeend', `<option value="${ent}"></option>`)
        })
    }
    if (list.startsWith('staff')) {
        entries.forEach(ent => {
            staffDatalist.insertAdjacentHTML('beforeend', `<option value='${ent[0]}'>${ent[1]}</option>`)
        })
    }
}
loadSubjectsIntoUls(jnrArray, "juniors");
loadSubjectsIntoUls(snrArray, "seniors");
loadSubjectsIntoUls(armArray, "arms");
loadSubjectsIntoUls(staffArray, "staffers");

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

const mulEntForm = document.forms.mulEntForm;
mulEntForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const cls = mulEntForm.cls.value.trim();
    const lname = mulEntForm.lname.value.trim();
    const fname = mulEntForm.fname.value.trim();
    const oname = mulEntForm.oname.value.trim();
    const repetitions = mulEntForm.repetitions.value;

    const classIndex = configs[7].indexOf(cls);
    chooseConfig(classIndex);

    const q = query(collection(db, "students"), and(where("last_name","==", lname), where("first_name","==", fname), where("other_name", "==", oname)), limit(repetitions));
    const docSnap = await getDocs(q);
    if (docSnap.empty) return window.alert("Oops! No student could be found in that class.");
    let size = docSnap.size;
    // console.log(size, ' was found and removed.')
    
    var IDs = [];
    docSnap.forEach(doc => {
        IDs.push(doc.id)
    })
    const promises = IDs.map(async id => {
        await deleteDoc(doc(db, "students", id));
    })
    await Promise.all(promises);
    if (size < 40 && size > 1) {
        window.alert(size + ' students were found and removed.');
    } else if (size == 1) {
        window.alert(size + ' was found and removed.');
    } else {
        window.alert('Whew! What a tremendous task. ' + size + ' students were found and removed.');
    }
    mulEntForm.reset();
    formStatus(e);
})

const subjectForm = document.forms.subjectForm;
subjectForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(subjectForm);
    let uid = formData.get('uid');
    let abbr = formData.getAll('abbr');
    let txt = formData.getAll('txt');
    
    if (e.submitter.id === 'add') {
        const promises = 
            abbr.map( async (a,i) => {
                let obj = {};
                obj[a] = txt[i];
                await updateDoc(doc(db, "staffCollection", uid), {
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
                await updateDoc(doc(db, "staffCollection", uid), {
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
    let uid = formData.get('uid');
    let abbr = formData.getAll('classesTaught')
    
    if (e.submitter.id === 'register') {
        const promises = 
            abbr.map( async (a) => {
                await updateDoc(doc(db, "staffCollection", uid), {
                    classroomsTaught: arrayUnion(a),
                })
            });
        await Promise.all(promises)
        window.alert("Your class(es) have been updated.");
        formStatus(e)
    } else {
        const promises = 
            abbr.map( async (a) => {
                await updateDoc(doc(db, "staffCollection", uid), {
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
    const uid = formData.get('uid');
    const cls = formData.get('cls');
    const arm = formData.get('arm');

    if (e.submitter.id === 'add') {
        await updateDoc(doc(db, "staffCollection", uid), {
            masterOfForm: { [cls]: arm },
        })
        window.alert("User has been declared 'Master of Form'.")
    } else {
        await updateDoc(doc(db, "staffCollection", uid), {
            masterOfForm: deleteField(),
        })
        window.alert("User has been undeclared 'Master of Form'.")
    }
    formStatus(e);
})
const eOTForm = document.forms.eOTForm;
eOTForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const cls = eOTForm.cls.value;
    const eot = eOTForm.eot.value;

    const eotRef = doc(db, "reserved", "EOT");
    try {
        await setDoc(eotRef, { [cls]: eot }, { merge: true });
        window.alert('Record access has been restricted for ' + cls + '.')
    } catch (error) {
        window.alert(error)
    }
    formStatus(e);
})
const extForm = document.forms.extForm;
extForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    const formData = new FormData(extForm);
    let data = {};
    for (const pair of formData.entries()) {
        if (!pair[1]) continue;
        if (pair[0].endsWith('comm')) {
            data["principal."+pair[0]] = pair[1];
        } else if (pair[0].endsWith('principal')) {
            data[pair[0]+".name"] = pair[1];
        } else {
            data[pair[0]] = pair[1];
        }
    }
    // console.log(data);
    const reference = doc(db, "reserved", "EOT");
    await updateDoc(reference, data);
    window.alert("EOT resources successfully set.");
    formStatus(e);
})
const imgStamp = document.querySelector('img[alt="stamp"]');
const stamp = document.querySelector('#stamp');
stamp.addEventListener('change', (e) => {
    const fr = new FileReader();
    fr.onload = function () {
        imgStamp.src = fr.result;
        // console.log(fr.result)
    }
    fr.readAsDataURL(e.target.files[0]);
})
const stampForm = document.forms.stampForm;
stampForm.addEventListener('submit', async (e) => {
    formStatus(e, 'enabled');
    chooseConfig(6);
    const file = stamp.files[0];
    const fileName = file.name;

    const storage = getStorage();
    const dest = ref(storage, "img/" + fileName);
    await uploadBytes(dest, file).then(async res => {
        await getDownloadURL(res.ref).then(async url => {
            await updateDoc(doc(db, "reserved", "EOT"), { stamp: url });
            window.alert("Stamp upload successful.")
        })
    })
    formStatus(e);
})