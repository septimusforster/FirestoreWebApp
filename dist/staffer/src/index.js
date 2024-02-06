import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
//declare all const and var
const uploadForm = document.querySelectorAll('form')[0];
const documentsWrapper = document.querySelector('#documents-wrapper div:nth-of-type(2)');
const evenSpans = document.querySelectorAll('.profile span:nth-of-type(even)');
const photo = document.querySelector('#avatar img');
const runBtn = document.querySelector('#documents-wrapper button');
const commentOK = ["It's alright.","I get it.","Fine.","Okay."];
const commentYES = ["Yes, go on.","Of course.","Yes, please."];
const commentNO = ["No, I don't wanna.","No, sorry.","No, don't."];
// var authorId = document.querySelector('#upload-wrapper input[type="hidden"]');
var fields = {};
const fileRef = "fileCollection";

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
const fileCollectionRef = collection(db, fileRef);
const staffCollectionRef = doc(db, "staffCollection", sessionStorage.getItem('snapshotId'));

//load member profile
const getSingleDoc = async () => {
    try {
        // const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(staffCollectionRef);

        if (docSnapshot.exists()) {
            const documentData = docSnapshot.data();
            return {data: documentData, id: docSnapshot.id};
        } else {
            console.log(`Document with ID ${documentId} does not exist in collection ${collectionName}.`);
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
};
getSingleDoc()
    .then((res) => {
        if(res) {
            // authorId.value = res.id;
            if(res.data.avatar) {
                photo.src = res.data.avatar;
            }
            evenSpans[0].textContent = res.data.fullName;
            evenSpans[1].textContent = res.data.username;
            
            res.data.classroomsTaught.forEach(classroom => {
                evenSpans[2].insertAdjacentHTML('afterbegin', `${classroom}<br>`)
                //Enter these values also for the select element for classrooms
                let option = new Option(classroom, classroom);
                document.querySelector('select#theClassroomId').insertAdjacentElement('beforeend', option);
            })
            res.data.subjectsTaught.forEach(subject => {
                evenSpans[3].insertAdjacentHTML('afterbegin', `${subject}<br>`);
                let option = new Option(subject, subject);
                document.querySelector('select#theSubjectId').insertAdjacentElement('beforeend', option);
            })
            
            document.querySelector('#profile-wrapper').children[2].style.display = 'flex';
            // getDataOnValue();
        }
    })
    
//on form change
uploadForm.addEventListener('change', (e) => {
    e.preventDefault();
    if(e.target.id == "fileId") {
        //get file, filename
        const file = e.target.files[0];
        const fileName = file.name;
        if(file.size > 1048487) {
            document.querySelector('#file-selected').innerText = "";
            document.querySelector('dialog#to-delete output').textContent = "The selected file has exceeded the maximum size of 1 MiB.";
            document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
            document.querySelector('dialog#to-delete').showModal();
            return;
        } else {
            //create base64 value
            const fr = new FileReader();
            fr.onload = function(event){
                fields["theFileName"] = fileName;
                fields["theFileEncoding"] = event.target.result;
            }
            fr.readAsDataURL(file);
        }
    } else {
        fields[e.target.name] = e.target.value;
    }
})

//on form submit
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    let theDateCreated = Intl.DateTimeFormat('en-us', {dateStyle: "medium"}).format(new Date());
    //get authorId
    // const theAuthorId = document.querySelector('input[type="hidden"]').value;
    addDoc(fileCollectionRef, {...fields, theDateCreated})
        .then(() => {
            // reset fields
            fields = {};
            document.querySelector('dialog#to-delete output').textContent = "Document upload successful.";
            document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
            document.querySelector('dialog#to-delete').showModal();
            document.querySelector('#file-selected').innerText = "";
            uploadForm.reset();
            e.submitter.disabled = false;
            e.submitter.style.cursor = 'pointer';
            // getDataOnValue();
        })
})
//function to retrieve newly inserted data
function getDataOnValue() {
    const q = query(fileCollectionRef, where("theAuthorId", "==", authorId.value));
    onSnapshot(q, (snapshot) => {
        documentsWrapper.innerHTML = '';
        snapshot.docs.forEach(doc => {
            let data = doc.data();
            // insert docs into Document page
            documentsWrapper.insertAdjacentHTML('beforeend',`
                <label class="radio-container">${data.theFileName}
                    <input type="radio" name="rd" id="${doc.id}" value="${data.theFileEncoding}">
                    <span class="checkmark"></span>
                </label>
            `)
        })
    })
}
runBtn.onclick = (e) => {
    // if(e.target.value == "delete") {
        let fileId, fileLink, fileName;
     let radioList = document.querySelectorAll("input[type='radio']");
     let checked = false;
     radioList.forEach(radio => {
        if (radio.checked) {
            checked = true;
            fileId = radio.id;
            fileLink = radio.value;
            fileName = radio.parentElement.innerText;
            return;
        }
     });
     if (checked && e.target.value == "download") {
        document.querySelector('dialog#to-download output').textContent = "Download " + fileName;
        document.querySelector('dialog#to-download a:nth-of-type(2)').href = fileLink;
        document.querySelector('dialog#to-download a:nth-of-type(2)').download = fileName;
        document.querySelector('dialog#to-download a:nth-of-type(1)').textContent = commentNO[Math.floor(Math.random()*3)];
        document.querySelector('dialog#to-download a:nth-of-type(2)').textContent = commentYES[Math.floor(Math.random()*3)];
        document.querySelector('dialog#to-download').showModal();
     } else if (checked && e.target.value == "delete") {
        if (confirm("Delete  " + fileName)) {
            const ref = doc(db, fileRef, fileId)
            deleteDoc(ref)
            .then(() => {
               document.querySelector('dialog#to-delete output').textContent = "Document deleted.";
               document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
               document.querySelector('dialog#to-delete').showModal();
            })
        }
     } else {
        //showModal for nULL
        document.querySelector('dialog#to-delete output').textContent = "Please, first select a document.";
        document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
        document.querySelector('dialog#to-delete').showModal();
     }
}
// onSnapshot(fileCollectionRef,)

/*
import firebase from 'firebase/app'
import 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
//Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Get a reference to Firebase storage
const storage = firebase.storage();

//File input element
const fileInput = document.getElementById('file-job');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const storageRef = storage.ref('pdfs/' + file.name);
    const uploadTask = storageRef.put(file);
    //monitor upload progress
    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytesTransferred) * 100;
        console.log('Upload is ' + progress + ' done.')
    },
        (error) => {
            console.log(error)
        },
        () => {
            console.log("File uploaded successfully.")
        }
    );
})
*/


/*
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const storageRef = ref(storage, 'images/rivers.jpg');

const uploadTask = uploadBytesResumable(storageRef, file);

// Register three observers:
// 1. 'state_changed' observer, called any time the state changes
// 2. Error observer, called on failure
// 3. Completion observer, called on successful completion
uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
  }, 
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
    });
  }
);
*/