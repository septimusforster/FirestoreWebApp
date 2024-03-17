import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where, getDocs, getCountFromServer } from "firebase/firestore"
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

// initialize firebase app
var app = initializeApp(configs[6])
// init services
var db;
db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
const dlogChecker = document.querySelector('#dlog-checker');
const dlogOops = document.querySelector('#dlog-oops');
const outputs = dlogChecker.querySelectorAll('#dlog-checker output');
const formResult = document.forms.formResult;
formResult.addEventListener('change', (e) => {
    if (e.target.name === 'cls') {
        let index = configs[7].indexOf(e.target.value);
        chooseConfig(index);
    }
})
formResult.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.opacity = '.6';
    outputs.forEach(out => out.classList.remove('active'));
    dlogChecker.showModal();

    const formData = new FormData(formResult);
    const adm = formData.get('adm');
    const cls = formData.get('cls');
    const pin = Number(formData.get('pin'));
    
    // for (const pair of formData.entries()) {
    //     console.log(pair);
    // }
    let data;
    const q1 = query(collection(db, "students"), where("admission_no", "==", adm), where("pin_value", "==", pin));
    const snapShot = await getDocs(q1);
    if (snapShot.empty) {
        dlogChecker.close();
        dlogOops.querySelector('output').textContent = "No student was matched with the given numbers.";
        createButton('oops');
        dlogOops.showModal();
        return;
    };
    outputs[0].classList.add('active');
    snapShot.docs.forEach(val => {
        // check pin used
        if (val.data().pin_used >= 5) {
            dlogOops.querySelector('output').textContent = "Your PIN quota has been used up. Click here to purchase a new PIN.";
            createButton('oops');
            dlogOops.showModal();
            return;
        } else {
            data = val.data();
        }
    });
    // console.log(data.arm)
    const sizeQuery = query(collection(db, "students"), where("arm", "==", data.arm));
    const snapQuery = await getCountFromServer(sizeQuery);
    const totalCount = snapQuery.data().count;
    data["size"] = totalCount;
    data["cls"] = cls;
    outputs[1].classList.add('active');
    
    // console.log(data)
    chooseConfig(6);
    let formMaster = "masterOfForm." + cls;
    const q2 = query(collection(db, "staffCollection"), where(formMaster, "==", data.arm));
    const snapped = await getDocs(q2);
    if (snapped.empty) {
        dlogChecker.close();
        dlogOops.querySelector('output').textContent = "No form master has been declared for this class. Please contact the school's admin.";
        createButton('oops');
        dlogOops.showModal();
        return;
    };
    snapped.docs.forEach(snap => {
        data["formMaster"] = snap.get('fullName');
    })
    outputs[2].classList.add('active');
    sessionStorage.setItem("student", JSON.stringify(data));
    // sessionStorage.setItem("pinUsed", JSON.stringify(data));
    createButton('checker');

    e.submitter.disabled = false;
    e.submitter.style.opacity = '1';
})

function createButton(dlog) {
    const button = document.createElement('button');
    if (dlog === 'oops') {
        button.textContent = "OKAY";
        button.onclick = function () {
            dlogOops.close();
            dlogOops.querySelector('output').textContent = '';
            dlogOops.querySelector('button').remove();
        }
        dlogOops.appendChild(button);
        document.querySelector('input[type="submit"]').disabled = false;
        document.querySelector('input[type="submit"]').style.opacity = '1';
        // formResult.reset();
    } else {
        button.textContent = "View Result";
        button.onclick = function () {
            // this button should first submit PIN_USED taken from the sessionStorage to the backend
            location.href = '../../result.html';
        }
        // append to dialog
        dlogChecker.appendChild(button);
    }
}
