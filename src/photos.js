import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import configs from "../src/JSON/configurations.json" assert {type: "json"};

const cls = new URL(location.href).searchParams.get('cls');
const arm = new URL(location.href).searchParams.get('arm');

document.title = cls + ": " + arm;
let configIndex = configs[7].indexOf(cls);
var app = initializeApp(configs[configIndex]);
var db = getFirestore();
// GETTING DATA
const  ss = JSON.parse(sessionStorage.getItem('preview'));
const tbody = document.querySelector('table tbody');

let tableData = '';
// 
// document.addEventListener('DOMContentLoaded', function () {
    ss.forEach((person, index) => {
        tableData += `
            <tr id="${person.id}" data-img-url="${person.photo_src || ''}">
                <td>${index+1}</td>
                <td>${person.id}</td>
                <td>${person.last_name} ${person.first_name} ${person.other_name}</td>
                <td>${person.password}</td>
                <td>${person.admission_no}</td>
            </tr>
        `
    })
    // console.log(tableData)
    tbody.innerHTML = tableData;
// })
let rowIndex = 0;
const imageViewer = document.getElementById('imageViewer');
let tableRow = tbody.querySelectorAll('tr');
tableRow.forEach(tr => {
    tr.onclick = function () {
        for (const row of tableRow) {
            if (row.classList.contains('active')) {
                row.classList.remove('active');
            }
        }
        tr.classList.add('active');
        imageViewer.style.backgroundImage = 'none';
        if (tr.dataset.imgUrl) {
            imageViewer.style.backgroundImage = `url(${tr.dataset.imgUrl})`;
        } else {
            imageViewer.style.backgroundImage = `url('../img/user.png')`;
        }
        rowIndex = tr.sectionRowIndex;
    }
})
let base64;
const fileInput = document.querySelector('input#photo');
fileInput.addEventListener('change', (e) => {
    const fr = new FileReader();
    fr.onloadend = function () {
        base64 = fr.result;
        imageViewer.style.backgroundImage = `url(${fr.result})`;
        // tableRow[rowIndex].dataset.imgUrl = fr.result;
    }
    fr.readAsDataURL(e.target.files[0]);
})

const storage = getStorage();
const photoForm = document.forms.chgPhoto;
photoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = false;
    e.submitter.style.cursor = 'not-allowed';

    const formData = new FormData(photoForm);
    const file = formData.get('photo_src');
    const uid = tableRow[rowIndex].id;
    let imgUrl = tableRow[rowIndex].dataset.imgUrl;

    // delete old file from firestorage, if it exists; use => new RegExp() ::OPTIONAL::
    // const re1 = new RegExp(/^https*$|^data:*$/);
    const re1 = new RegExp(/\/img.+\?/);
    const imgPath = re1.test(imgUrl);
    if (imgPath) {
        const oldImageRef = ref(storage, decodeURIComponent(re1.exec(imgUrl)[0]).slice(0,-1));
        // console.log(oldImageRef)
        // replace it with new one;
        await uploadBytes(oldImageRef, file).then(async res => {
            await getDownloadURL(res.ref).then(async url => {
                // change row image location to "url"
                ss[rowIndex]["photo_src"] = url;
                imgUrl = url;
                await updateDoc(doc(db, "students", uid), { photo_src: url }).then(() => {
                    window.alert("Student with ID " + uid + ", has photo updated.");
                    e.submitter.disabled = false;
                    e.submitter.style.cursor = 'pointer';
                })
            })
        })
    } else {
        const fileType = file.type;
        const fileExt = fileType.slice(fileType.indexOf('/')+1);
        // console.log(fileExt);
        
        const newImageRef = ref(storage, `/img/${cls}/${uid}.${fileExt}`)
        await uploadBytes(newImageRef, file).then(async res => {
            await getDownloadURL(res.ref).then(async url => {
                // change row image location to "url"
                ss[rowIndex]["photo_src"] = url;
                imgUrl = url;
                await updateDoc(doc(db, "students", uid), { photo_src: url }).then(() => {
                    window.alert("Student with ID " + uid + ", has photo updated.");
                    e.submitter.disabled = false;
                    e.submitter.style.cursor = 'pointer';
                })
            })
        })
    }
    
    // then, send url to the affected student
    // update imageViewer backgroundImage with the newly uploaded file
    // const re = new RegExp(/\/img.+\?/);
    // const oldImageRef = decodeURIComponent(re.exec(urlString)[0]);
    // console.log(oldImageRef);
    // tableRow[rowIndex].dataset.imgUrl = base64;
    // console.log(file);
})

// DELETE FILE FROM STORAGE
// const storage = getStorage();
// const fileRef = ref(storage, "/img/SSS 3/the name of the file.pdf");

