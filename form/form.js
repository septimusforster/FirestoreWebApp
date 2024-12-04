import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, getDoc, doc, query, where, getDocs, limit, setDoc } from "firebase/firestore";
import  configs from "../src/JSON/configurations.json" assert {type: 'json'};

var app = initializeApp(configs[6]);
var db = getFirestore(app);

function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore(app);
}

//form elements
const admNo = document.getElementById('admission_no');
const clsName = document.getElementById('class_name');

const month = new Date().getMonth();
const session = month >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());
let counter = 0;

const notice = document.querySelector('.notice');
const robotform = document.forms.namedItem('robotform');
const robotbody = robotform.querySelector('.body');
const dialog = document.querySelectorAll('dialog');

class Student {
    constructor(_id, _name, _admNo, _dob) {
        this.id = _id,
        this.name = _name,
        this.admNo = _admNo,
        this.dob = _dob,
        this.file = null
    }
    
    insertExpectations () {
        robotbody.querySelectorAll('input, select, textarea').forEach(elem => {
            elem.disabled = true;
            elem.toggleAttribute('readonly', true);
        });
        robotbody.insertAdjacentHTML('beforeend', `
            <input type="text" placeholder="${this.name}" disabled>
            <input type="text" placeholder="Born ${this.dob}" disabled>
            <div class="fmgp">
                <div id="expectations">What are your expectations for your child?</div>
                <label for="cb1">
                    <input type="checkbox" name="cb" id="cb1"><span>Learn the basics of Machine AI</span>
                </label>
                <label for="cb2">
                    <input type="checkbox" name="cb" id="cb2"><span>Connect and program robotic parts</span>
                </label>
                <label for="cb3">
                    <input type="checkbox" name="cb" id="cb3"><span>Build a custom-made application for a machine's UI</span>
                </label>
                <textarea name="cb" id="other" placeholder="Others"></textarea>
            </div>    
        `)
        counter++;
        console.log('counter', counter);
    }

    insertPaymentDetails () {
        robotbody.insertAdjacentHTML('beforeend', `
            <div class="fmgp">
                <div id="pop">Payment Details</div>
                <div>
                    <small>Account Name</small><strong>Destiny Christian Academy</strong>
                    <small>Bank Name</small><strong>Zenith Bank</strong>
                    <small>Account Number</small><strong>1012756749</strong>
                </div>
                <div>
                    <label for="uploadpop">Upload Receipt</label>
                    <input type="file" name="uploadpop" id="uploadpop">
                    <output></output>
                </div>
            </div>
        `);
        robotbody.querySelector('input[type="file"]').addEventListener('input', (e) => {
            const f = e.target.files[0];
            //convert to base64
            const fr = new FileReader();
            fr.onload = () => {
                this.file = fr.result;
            }
            fr.readAsDataURL(f);
            e.target.nextElementSibling.textContent = f.name;
        });
        counter++;
        console.log('counter', counter);
    }
}
let student;
robotform.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.classList.add('clk');
    //scroll robotbody
    // const height = robotbody.scrollHeight;
    // robotbody.scrollBy(0, height);
    const cfg_no = configs[7].indexOf(clsName.value);
    const admission = admNo.value.replaceAll(' ', '').toUpperCase();

    if (counter === 1) { //get proof of payment for upload
        const inputs = [...robotbody.querySelectorAll('input[type="checkbox"]:checked, textarea')].map(input => input.tagName.toLowerCase() == 'textarea' ? input.value : input.nextElementSibling.textContent);
        console.log('id', student.id);
        await setDoc(doc(db, 'robotics', student.id), {expectations: inputs}, {merge: true})
        robotbody.querySelectorAll('input, select, textarea').forEach(elem => {
            elem.disabled = true;
            elem.toggleAttribute('readonly', true);
        });
        student.insertPaymentDetails();
        e.submitter.classList.remove('clk');
        e.submitter.disabled = false;
        return;
    }
    if (counter === 2) {
        // e.submitter.disabled = false;
        if (!student.file) {
            notify('No file selected.');
            e.submitter.classList.remove('clk');
            e.submitter.disabled = false;
            return;
        } else {
            //store base64 in robotics
            await setDoc(doc(db, 'robotics', student.id), {file: student.file, isAcknowledged: true, dateTime: Date.now()}, {merge: true});
            //display acknowledgement form as show
            robotform.style.display = 'none';
            dialog[0].show();
            return;
            // e.submitter.classList.remove('clk');
            // e.submitter.disabled = false;
        }
    }
    chooseConfig(cfg_no);
    const q1 = query(collection(db, 'robotics'), where('admNo', '==', admission), limit(1));
    const snap1 = await getDocs(q1);
    if (snap1.empty) {
        const q2 = query(collection(db, 'session', session, 'students'), where('admission_no', '==', admission), limit(1));
        const snap2 = await getDocs(q2);
        if (snap2.empty) {
            //error: student not found
            notify('No student found.');
            e.submitter.classList.remove('clk');
            e.submitter.disabled = false;
            return;
        } else {
            const found = snap2.docs[0].data();
            const dob = found.dob ? Intl.DateTimeFormat('en-GB', {dateStyle: 'long'}).format(new Date(found.dob)) : 'unknown';
            student = new Student(
                found.id,
                `${found.last_name} ${found.first_name}`,
                found.admission_no,
                dob,
            );
            await setDoc(doc(db, 'robotics', student.id), {
                admNo: student.admNo,
                fullname: student.name,
                dob: student.dob,
                isAcknowledged: false
            });
            student.insertExpectations();
            e.submitter.classList.remove('clk');
            e.submitter.disabled = false;
        }
    } else {
        const found1 = snap1.docs[0].data();
        const today = Intl.DateTimeFormat('en-GB', {dateStyle: 'full'}).format(Date.now());
        const otherDay = Intl.DateTimeFormat('en-GB', {dateStyle: 'full'}).format(found1.dateTime);
        if (found1?.isAcknowledged) {
            dialog[1].querySelector('p:first-of-type').textContent = `Your payment ${today == otherDay ? 'was submitted earlier today.' : 'was submitted on ' + otherDay + '.'}`;
            robotform.style.display = 'none';
            dialog[1].show();
        } else {
            student = new Student(
                snap1.docs[0].id,
                `${found1.fullname}`,
                found1.admNno,
                found1.dob,
            );
            student.insertExpectations();
            e.submitter.classList.remove('clk');
            e.submitter.disabled = false;
        }
    }

    //if counter = 0, look for student in the backend and discover if he has already made payment
        //if payment, check if confirmed
            //if confirmed, tick e.submitter and display dialog[1]
            //if acknowledged, display dialog[2]
        //go through with the process of form registration
    
});

function notify(msg) {
    notice.textContent = msg;
    notice.classList.add('on');
    const id = setTimeout(() => {
        notice.classList.remove('on');
        clearTimeout(id);
    }, 3000);
}