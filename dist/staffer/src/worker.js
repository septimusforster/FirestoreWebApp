import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

let app = initializeApp(configs[6]); //FirebasePro config
let db = getFirestore(app);

self.addEventListener('message', async ({data}) => {
    const snap = await getDoc(doc(db,"EOT", data))    //data is session
    postMessage(snap.data());
});