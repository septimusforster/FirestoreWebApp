import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDocs, query, where, serverTimestamp, onSnapshot } from "firebase/firestore";
import pk from "../src/JSON/upass.json" assert {type: 'json'};
const firebaseConfig = {    
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
// initialize firebase app
initializeApp(firebaseConfig)
// init services
const db = getFirestore()
// collection refs
const staffCollectionRef = collection(db, "staffCollection");

let cfp, classroomsTaught = [], subjectsTaught = [], avatar = "", code;
const signUpForm = document.forms.signup;
const passwords = signUpForm.querySelectorAll(".passwords");
passwords.forEach((password, index) => {
    password.addEventListener('change', (e) => {
        if(passwords[Math.abs(index - 1)].value == "") return;
        if (passwords[Math.abs(index - 1)].value == e.target.value) {
            cfp = e.target.value;
            e.target.classList.remove('validate-password');
            passwords[Math.abs(index - 1)].classList.remove('validate-password');
        } else {
            cfp = undefined;
            e.target.classList.toggle('validate-password');
        }
        // console.log(passwords[index].value)
    })
})
const emailField = signUpForm.querySelector('#email');
const dialogInfo = document.querySelector('dialog#info');
emailField.addEventListener('blur', (e) => {
    //checking email animation
    if(e.target.value === '') {
        return
    } else {
        dialogInfo.querySelector('output').textContent = 'Verifying if user exists...';
        dialogInfo.showModal();
        
        setTimeout(async function () {
            const emailQuery = query(staffCollectionRef, where("username", "==", e.target.value));
            const docSnap = await getDocs(emailQuery);
            if(docSnap.empty) {
                dialogInfo.querySelector('output').textContent = 'All done.';
                setTimeout(() => {
                    dialogInfo.close();
                    signUpForm.querySelectorAll("input[type='password']").forEach(input => {
                        input.classList.toggle('deactivate');
                        input.disabled = false;
                    })
                }, 1000);
            } else {
                setTimeout(() => {
                    dialogInfo.close();
                }, 3000)
                dialogInfo.querySelector('output').textContent = "User already exists.";
            }
        }, 3000);
    }
    /*
    const timerID1 = setTimeout(function () {
        console.log("Found result.", timerID)
        clearTimeout(timerID)
    }, 10000)*/
})
const addSpans = document.querySelectorAll('.add');
const removeSpans = document.querySelectorAll('.remove');
const textAreas = document.querySelectorAll('textarea');
addSpans.forEach((addSpan, index) => {
    addSpan.addEventListener('click', (e) => {
        let abbr = e.target.nextElementSibling.value;
        let txt = e.target.nextElementSibling.selectedOptions[0].text;
        
        if(textAreas[index].textContent.length == 0) {
            textAreas[index].textContent = txt;
        } else if (!textAreas[index].textContent.includes(txt)) {
            textAreas[index].textContent += "," + txt;
        }
        if (addSpan.nextElementSibling.id == "classrooms") {
            classroomsTaught = textAreas[index].textContent.split(",");
        } else {
            const obj1 = {
                [abbr]: txt,
            }
            if (!subjectsTaught.filter(a => a.hasOwnProperty(abbr)).length) {
                subjectsTaught.push(obj1)
            }
        }
    })
})
removeSpans.forEach((removeSpan, index) => {
    removeSpan.addEventListener('click', (e) => {
        let abbr = e.target.previousElementSibling.value;
        let txt = e.target.previousElementSibling.selectedOptions[0].text;

        let areaVal = textAreas[index].textContent.split(',');
        textAreas[index].textContent = areaVal.filter(a => a != txt);
        if (removeSpan.previousElementSibling.id == "classrooms") {
            classroomsTaught = classroomsTaught.filter(a => a != txt)
        } else {
            subjectsTaught = subjectsTaught.filter(a => !a.hasOwnProperty(abbr));
        }
    })
})
const preview = document.querySelector('#preview');
const photoPicker = document.getElementById('photo-picker');
photoPicker.addEventListener('change', (e) => {
    if (e.target.files[0].size > 400000) {
        window.alert("File size exceeded.")
    } else {
        const fr = new FileReader();
        fr.onload = () => {
            avatar = fr.result;
        }
        fr.readAsDataURL(e.target.files[0])
        preview.src = URL.createObjectURL(e.target.files[0])
    }
})
const inputCode = document.querySelector('input#code');
inputCode.addEventListener('keyup', (e) => {
    if (e.target.value.length == 6 && pk.includes(e.target.value)) {
        code = e.target.value;
        e.target.disabled = true;
        document.querySelector('strong').style.display = 'flex';
    }
})
signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dialogNotice = document.querySelector('#dialog-notice');
    const dialogSuccess = document.querySelector('#dialog-success');
    // dialogDiv ? dialogDiv.remove() : false;
    if (cfp && code) {
        e.submitter.disabled = true;
        e.submitter.style.cursor = 'not-allowed';
        
        addDoc(staffCollectionRef, {
            fullName: document.getElementById('fullName').value.trim(),
            username: document.getElementById('email').value.trim(),
            password: cfp,
            code,
            classroomsTaught,
            subjectsTaught,
            avatar,
            createdAt: serverTimestamp()
        })
        .then(() => {
            signUpForm.reset();
            dialogSuccess.querySelector('h1').textContent = "Registration Successful";
            dialogSuccess.querySelector('button').focus();
            dialogSuccess.querySelector('button').onclick = () => location.reload();
            dialogSuccess.style.display = 'flex';
        })
    } else {
        dialogNotice.querySelector('output').innerHTML = "The form is not properly filled.<br>Make sure the Password, Classrooms, Subjects, and Code fields are all entered.</div>";
        dialogNotice.showModal();
    }
})
const loginForm = document.forms.signin;
const inputs = loginForm.querySelectorAll('input');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    const dialogNotice = document.querySelector('#dialog-notice');
    const q = query(staffCollectionRef, where("username", "==", inputs[0].value), where("password", "==", inputs[1].value));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty) {
        dialogNotice.querySelector('output').innerHTML = "The username/password is incorrect.";
        dialogNotice.showModal();
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    } else {
        loginForm.reset();
        querySnapshot.docs.forEach(doc => sessionStorage.setItem('snapshotId', JSON.stringify({id: doc.id, data: doc.data()})));
        location.href = 'index.html';
    }
})
const loginForm2 = document.forms.signin2;
const inputs2 = loginForm2.querySelectorAll('input');
loginForm2.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    const dialogNotice = document.querySelector('#dialog-notice');
    const q = query(staffCollectionRef, where("code", "==", "USADEY"), where("username", "==", inputs2[0].value), where("password", "==", inputs2[1].value));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty) {
        dialogNotice.querySelector('output').innerHTML = "The username/password is incorrect.";
        dialogNotice.showModal();
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    } else {
        // querySnapshot.docs.forEach(doc => sessionStorage.setItem('snapshotId', doc.id));
        loginForm2.reset();
        location.href = '../../USADEYZHluYW1heAib.html';
    }
})

// server: smtp.elasticemail.com
// port: 2525