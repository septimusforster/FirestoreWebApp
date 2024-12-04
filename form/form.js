import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where, getDocs, collectionGroup } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};

//form elements
const admNo = document.getElementById('#admission_no');
const clsName = document.getElementById('#class_name');

const month = new Date().getMonth();
const session = month >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear();
let counter = 0;

const notice = document.querySelector('.notice');
const robotform = document.forms.namedItem('robotform');
const robotbody = robotform.querySelector('.body');

class Student {
    constructor(_id, _name, _admNo, _dob) {
        this.id = _id,
        this.name = _name,
        this.admNo = _admNo,
        this.dob = _dob
    }
    
    insertExpectations () {
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
        console.log(counter);
    }

}

robotform.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.classList.add('clk');
    
    const q1 = query(collection(db, 'robotics'), where('admNo', '==', admNo.value), limit(1));
    const snap1 = await getDocs(q1);
    if (snap1.empty) {
        const q2 = query(collection(db, 'session', String(session), 'student'), where('admission_no', '==', admNo.value), limit(1));
        const snap2 = await getDocs(q2);
        if (snap2.empty) {
            //error: student not found
            notify('No student found.');
            e.submitter.classList.remove('clk');
            e.submitter.disabled = false;
            return;
        } else {
            const student = new Student(
                snap2.docs[0].id,
                snap2.docs[0].admission_no,
                `${snap2.docs[0].last_name} ${snap2.docs[0].first_name}`,
                Intl.DateTimeFormat('en-GB', {dateStyle: 'long'}).format(new Date(snap2.docs[0].dob)),
            );
            // await setDoc(doc(db, 'robotics', student.id), {
            //     admNo: student.admNo,
            //     fullname: student.name,
            // });
            robotform.querySelectorAll('input, select, textarea').forEach(elem => {
                elem.disabled = true;
                elem.toggleAttribute('readonly', true);
            });
            student.insertExpectations();
        }
    } else {
        // snap1.docs[0].data
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
//HTML TO BE USED IN JS
/*
<!--input type="text" placeholder="Lord Chesterfield" disabled>
<input type="text" placeholder="Born 12 / 09 / 1978" disabled>
<div class="fmgp">
    <div id="expectations">What are your expectations for your child?</div>
    <label for="cb1">
        <input type="checkbox" name="cb" id="cb1" disabled><span>Expectation 1 a very long expectation One Really Very long</span>
    </label>
    <label for="cb2">
        <input type="checkbox" name="cb" id="cb2" disabled><span>Expectation 2</span>
    </label>
    <label for="cb3">
        <input type="checkbox" name="cb" id="cb3" disabled><span>Expectation 3</span>
    </label>
    <textarea name="cb" id="other" placeholder="Others" readonly></textarea>
</div>
<div class="fmgp">
    <div id="pop">Payment Details</div>
    <div>
        <small>Account Name</small><strong>Destiny Christian Academy</strong>
        <small>Bank Name</small><strong>Zenith Bank</strong>
        <small>Account Number</small><strong>1012766749</strong>
    </div>
    <div>
        <label for="uploadpop">Upload Receipt</label>
        <input type="file" name="uploadpop" id="uploadpop">
        <output></output>
    </div>
</div>
</div-->
*/