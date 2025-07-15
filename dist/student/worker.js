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

// for re-adding user score
// await updateDoc(doc(db,"session",ssn,"students",mois.id,"scores","records"),{
//     "BTEC": {
//         "0": [
//             null,
//             9,
//             null,
//             9.5,
//             null,
//             10,
//             null,
//             64
//         ],
//         "1": [
//             7,
//             null,
//             null,
//             9,
//             null,
//             10,
//             20,
//             35
//         ],
//         "2": [
//             6,
//             null,
//             1.5,
//             5,
//             null,
//             null,
//             null,
//             null
//         ]
//     }
// });