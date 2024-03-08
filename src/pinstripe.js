import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, getDocs, doc, query, where, orderBy, updateDoc } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};
import pins from "./JSON/pinstripe.json" assert {type: 'json'};

// check pin availability
// console.log(pins[0][0]);

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

var index, cursor;
//get arms

const armDatal = document.querySelector('datalist#arm');
if (!sessionStorage.hasOwnProperty('arms')) {
    const q = query(doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu"));
    await getDoc(q).then(arm => {
        let arms = arm.data().arms.sort();
        sessionStorage.setItem('arms', JSON.stringify(arms));
        arms.forEach(a => {
            armDatal.insertAdjacentHTML('beforeend', `
                <option value="${a}"></option>
                `)
        })
        console.log("From Server.")
    });
    // if (armSnapshot.empty) {
        //     window.alert("The class arms are not set/the document reference has been detached.");
        // }
} else {
    const ssArms = JSON.parse(sessionStorage.getItem('arms'));
    ssArms.forEach(a => {
        armDatal.insertAdjacentHTML('beforeend', `
            <option value="${a}"></option>
        `)
    })
}

const tabContents = document.querySelectorAll('.tab__contents');
const getClass = document.forms.getForm;
getClass.addEventListener('change', (e) => {
    if (e.target.name === 'cls') {
        index = configs[7].indexOf(e.target.value);
        chooseConfig(index);
    }
})
getClass.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.opacity = '.5';

    const formData = new FormData(getForm);
    const cls = formData.get('cls');
    const arm = formData.get('arm');

    document.querySelector('main h3').textContent = cls + arm;

    const q = query(collection(db, "students"), where("arm", "==", arm), orderBy("last_name"));
    const querySnapshot = await getDocs(q);
    tabContents.forEach(tab => tab.querySelector('tbody').innerHTML = '');
    querySnapshot.docs.forEach((res, idx) => {
        if (res.data()?.pin_value) {
           tabContents[0].querySelector('tbody').insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${res.data().admission_no}</td>
                    <td>${res.data().last_name} ${res.data().first_name} ${res.data().other_name}</td>
                    <td>${res.data().pin_value}</td>
                    <td>${res.data().pin_used}</td>
                </tr>
           `)
        } else {
            tabContents[1].querySelector('tbody').insertAdjacentHTML('beforeend', `
                <tr>
                    <td>
                        <input type="checkbox" name="cbx" id="cb${idx}" value="${res.id}"/>
                        <label for="cb${idx}"></label>
                    </td>
                    <td>${res.data().admission_no}</td>
                    <td>${res.data().last_name} ${res.data().first_name} ${res.data().other_name}</td>
                    <td></td>
                </tr>
            `)
        }
    })
    e.submitter.disabled = false;
    e.submitter.style.opacity = '1';
})

const pinForm = document.forms.pinForm;
pinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.opacity = '.5';
    const formData = new FormData(pinForm);
    const checkboxes = formData.getAll("cbx");

    chooseConfig(6)
    await getDoc(doc(db, "reserved", "EOT")).then( async res => {
        cursor = res.get("pu" + index) || 0;
        console.log("Cursor in pinForm:", cursor);

        chooseConfig(index);
        const promises = checkboxes.map(async (cbx, idx) => {
            await updateDoc(doc(db, "students", cbx), {
                pin_used: 0,
                pin_value: Number(pins[index][cursor++]),
            })
        });
        
        await Promise.allSettled(promises).then(async (res) => {
            chooseConfig(6);
            await updateDoc(doc(db, "reserved", "EOT"), {
                ["pu"+index]: cursor
            });
            chooseConfig(index);
            e.submitter.disabled = false;
            e.submitter.style.opacity = '1';
        });
    })
})