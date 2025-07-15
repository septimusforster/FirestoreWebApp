import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, query, where, and, or } from "firebase/firestore";
import configs from "../../src/JSON/configurations.json" assert {type: 'json'};

var app, db;
function useApp(n){
    if (app) deleteApp(app);
    app = initializeApp(configs[n]);
    db = getFirestore(app);
}
self.addEventListener('message', async ({ data }) => {
    useApp(data.mois.cls);
    const scoreRef = doc(db,'session', data.ssn, 'students', data.mois.id, 'scores', 'records');
    try{
        const my_ca = await getDoc(scoreRef);
        if(my_ca.exists) {
            self.postMessage(my_ca.data());
        }
    }catch(err){
        self.postMessage("Worker-based Error.");
    }
});