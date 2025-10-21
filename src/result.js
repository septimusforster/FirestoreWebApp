import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where, and, getDocs, collectionGroup, orderBy } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};

// initialize firebase app
var app;// = initializeApp();
// init services
var db;
// db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
const MONTH = new Date().getMonth();
let session = MONTH >= 8 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());

let term = function(n){
    if(n <= 3) return 1; //second term
    if(n <= 7) return 2; //third term
    return 0; //first term
}(MONTH);
//add sessions
if(document.querySelector('select#snn'))
    for (let sn = 2024; sn <= Number(session); sn++) document.querySelector('select#snn').insertAdjacentHTML('beforeend', `<option value="${sn}">${sn-1}/${sn}</option>`);
const ss = JSON.parse(sessionStorage.getItem('snapshotId'));
if(ss && ('masterOfForm' in ss.data || ss.data.isAdmin)){
    const master = ss.data?.masterOfForm ? Object.entries(ss.data.masterOfForm)[0] : 'blah!';
    let FORM = master[0];
    let ARM = master[1];
    const percent = document.getElementById('percent');
    let fullName;
    let eotData, percentile, offd;
    // let myclass = configs[7].indexOf(FORM);
    let size = '', daysOpen = '';
    
    const dialog = document.querySelector('dialog');
    const loadbar = dialog.querySelector('#loadbar');

    const theadFirstRow = document.querySelector("#section-grade table:nth-child(1) thead tr:first-child th");
    const tbodyScores = document.querySelector('#section-grade table:nth-child(1) tbody');
    const tfootTerm = document.querySelector('#section-grade table:nth-child(1) tfoot');
    const tbodyTerm = document.querySelector('#section-grade > table:nth-of-type(2) tbody');
    const tfootCumm = document.querySelector('#section-grade > table:nth-of-type(2) tfoot');

    let pt = 7;
    function loaded(ld) {
        pt += ld;
        loadbar.querySelector('i').style.width = pt + '%';
    }
    
    document.querySelector('select#res').addEventListener('change', (e) => {
        if(e.target.selectedIndex === 3){
            e.target.nextElementSibling.setAttribute('required','');
            e.target.nextElementSibling.disabled = false;
        }else{
            e.target.nextElementSibling.removeAttribute('required');
            e.target.nextElementSibling.disabled = true;
        }
    });
    let eotReadyStatus,
        core = {MTH:0, ENG:0, LIT:0, CIV:0, GOV:0, PHY:0, CHEM:0, ACCT:0, COMM:0},
        core_lower = 0;

    await eot();
    let page = 0;
    let studentIDs = [], studentData;

    function computeData(page){
        document.querySelector('footer span').innerHTML = `<i>${page+1}</i> of ${size}`;
        const {
            admission_no, last_name, first_name, other_name='', gender, dob,
            days_present, record
        } = studentData[page];

        fullName = `${last_name} ${first_name} ${other_name}`;
        for(let el = 1; el <= 4; el++)
            document.querySelectorAll(`#section-bio table:nth-child(1) tr td:nth-child(2)`)[el-1].textContent = [admission_no, fullName, 'Male Female'.split(' ').filter(x => x.startsWith(gender))[0], new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970][el-1];
        for(let el = 1; el <= 5; el++)
            document.querySelectorAll(`#section-bio table:nth-child(2) tr td:nth-child(2)`)[el-1].textContent = [`${configs[7].indexOf(FORM) + 7}th Grade ${ARM}`, size, daysOpen, days_present[term], daysOpen - days_present[term]][el-1];
        for(let el = 1; el <= 3; el++)
            document.querySelectorAll(`#section-bio table:nth-child(3) tr td:nth-child(2)`)[el-1].textContent = [['First', 'Second', 'Third'][term], `${session-1}/${session}`, percentile < 100 ? '' : eotData?.next_term?.[term] || ''][el-1];
        
        if (percentile < 100) {
            theadFirstRow.innerText = "Progressive Report";
            document.querySelector('#status').style.display = 'none';
            //hide cumulative table
            document.querySelector('#section-grade > table:nth-child(2)').style.display = 'none';
        }
        let total = 0, i;
        let graderObject = {
            "A": 80/100*percentile, //consider using toFixed() to trim fractional part;
            "B": 65/100*percentile, //but these grades are fine because they return integers
            "C": 50/100*percentile,
            "D": 40/100*percentile,
            "E": 30/100*percentile,
            "F": 0/100*percentile,
        }
        tbodyScores.innerHTML = '', tbodyTerm.innerHTML = '', tfootTerm.innerHTML = '';
        const ME = Object.entries(record).sort((a, b) => offd[a[0]].localeCompare(offd[b[0]]));
        for (i = 0; i < ME.length; i++) {
            var td = `<td>${i+1}</td><td>${offd[ME[i][0]]}</td>`;
            if (!ME[i][1][term]) continue;
            let [...test] = ME[i][1][term];
            let subtotal = test.reduce((a,c) => a + c);
            switch (test.length) {
                case 4: //normal
                    td += `
                        <td>${test[0] || ''}</td>
                        <td>${test[1] || ''}</td>
                        <td>${test[2] || ''}</td>
                        <td>${test[3] || ''}</td>
                    `;
                    break;
                case 5:
                    td += `
                        <td>${test[0] || ''}</td>
                        <td>${test[1] || ''}</td>
                        <td>${test[2] || ''}</td>
                        <td>${test[3] + test[4] || ''}</td>
                    `;
                    break;
                case 8:
                    td += `
                        <td>${(test[0] + test[1]) || ''}</td>
                        <td>${(test[2] + test[3]) || ''}</td>
                        <td>${(test[4] + test[5]) || ''}</td>
                        <td>${(test[6] + (test[7] || null)).toFixed(1) || ''}</td>
                    `;
                    break;
            }
            td += `<td>${!subtotal ? '' : subtotal.toFixed(1)}</td>`;

            switch (true) {
                case subtotal >= graderObject.A:
                    td += '<td>A</td><td>Excellent</td>';
                    break;
                case subtotal >= graderObject.B:
                    td += '<td>B</td><td>Very Good</td>';
                    break;
                case subtotal >= graderObject.C:
                    td += '<td>C</td><td>Good</td>';
                    break;
                case subtotal >= graderObject.D:
                    td += '<td>D</td><td>Satisfactory</td>';
                    break;
                case subtotal >= graderObject.E:
                    td += '<td>E</td><td>Pass</td>';
                    break;
                case subtotal > graderObject.F:
                    td += '<td>F</td><td>Fail</td>';
                    break;
                default:
                    td += '<td></td><td></td>';
                    break;
            }

            total += subtotal;
            let summation = [];
            for (let j = 0; j < studentData.length; j++) {
                if (studentData[j]['record']?.[ME[i][0]]?.[term] === undefined) continue;
                let all = studentData[j]['record'][ME[i][0]][term].reduce((a, c) => a + c);
                if (!all) continue;
                summation.push(all);
                // if (studentData[j]?.[ME[i][0]]?.[term] === undefined) continue;
                // let all = 0;
                // studentData[j][ME[i][0]][term].forEach(n => all += n);
                // if (!all) continue;
                // summation.push(all);
            };
            const bool = summation.length;
            let max = bool ? Math.max(...summation).toFixed(1) : '';
            let min = bool ? Math.min(...summation).toFixed(1) : '';
        
            td += `
                <td>${max}</td>
                <td>${min}</td>
            `;
            tbodyScores.insertAdjacentHTML('beforeend', `
                <tr>${td}</tr>
            `);
            let sc = Object.values(ME[i][1]);
            let cumm_td = Array(3).fill(0), cumm = 0, count = term < sc.length ? 0 : term/sc.length, txt = '';

            for (const x of sc) {
                if (!x) continue;
                let t = x.reduce((a, c) => a + c, 0);
                cumm += t;
                cumm_td.splice(count,1,t.toFixed(1));
                count++;
            }
            let m = cumm_td.map((mp, ix) => ix <= term ? mp : '-');
            let how_many_terms  = 0;
            for (const c of m) {
                txt += `<td>${c}</td>`;
                c > 0.9 ? how_many_terms++ : false;
            }
            //search out core subjects
            how_many_terms = (cumm/how_many_terms).toFixed(1);
            if(ME[i][0] in core) core[ME[i][0]] = how_many_terms;
            tbodyTerm.insertAdjacentHTML('beforeend', `
                <tr>
                    ${txt}
                    <td>${term < 2 || percentile < 100 ? '-' : how_many_terms}</td>
                </tr>
            `);
        }

        const ME_AVERAGE = (total / (ME.length)).toFixed(1);
        let subAverage = [], overall = [];
   
        studentData.forEach(({record}, rx) => {
            let elem = 0, factor = 0;
            for (const x of Object.values(record)) {
                if (!x[term]) continue;
                elem += x[term].reduce((acc, val) => acc + val,0);
                factor++;
            }
            const yy = elem/factor;
            yy ? subAverage.push(yy) : false;
        });

        const xx = subAverage.reduce((acc, cur) => acc + cur,0);
        const CLS_AVERAGE = (xx/size).toFixed(1);
        // get principal data
        const princDiv = document.getElementById('principal');
        princDiv.querySelector('p').textContent = principal.name;
        let term_grade;
        switch (true) {
            case ME_AVERAGE >= graderObject.A:
                princDiv.querySelector('blockquote').textContent = principal?.comments?.A || '';
                term_grade = 'A';
                break;
            case ME_AVERAGE >= graderObject.B:
                princDiv.querySelector('blockquote').textContent = principal?.comments?.B || '';
                term_grade = 'B';
                break;
            case ME_AVERAGE >= graderObject.C:
                princDiv.querySelector('blockquote').textContent = principal?.comments?.C || '';
                term_grade = 'C';
                break;
            case ME_AVERAGE >= graderObject.D:
                princDiv.querySelector('blockquote').textContent = principal?.comments?.D || '';
                term_grade = 'D';
                break;
            case ME_AVERAGE >= graderObject.E:
                princDiv.querySelector('blockquote').textContent = principal?.comments?.E || '';
                term_grade = 'E';
                break;
            case ME_AVERAGE >= graderObject.F:
                princDiv.querySelector('blockquote').textContent = principal?.comments?.F || '';
                term_grade = 'F';
                break;
        }
        //add term total and term grade
        const cspan = Number(tbodyScores.dataset.totHeader);
        tfootTerm.insertAdjacentHTML('beforeend', `
            <tr>
                <td colspan="${cspan}">Total/Grade</td>
                <td>${total.toFixed(1)}</td>
                <td>${term_grade}</td>
                <td></td>
            </tr>
            <tr>
                <td colspan="${cspan}">Student Average/Class Average</td>
                <td>${ME_AVERAGE}</td>
                <td>${CLS_AVERAGE}</td>
            </tr>
        `);
        for (let colNum = 0; colNum < 4; colNum++) { //less than 4 because there are 4 cols in table 2
            let ft = 0;
            const tds = tbodyTerm.querySelectorAll(`tr td:nth-child(${colNum + 1}`);
            tds.forEach(td => {
                if(!(td.innerText == '-' || td.innerText == undefined)) ft += Number(td.innerText);
            });
            core_lower = colNum == 3 ? (ft/ME.length).toFixed(1) : ft.toFixed(1) || '';
            tfootCumm.querySelector('tr').insertAdjacentHTML('beforeend', `
                <td>${core_lower}</td>
            `);
        }
        isPromoted();
    }
    //page navigation
    document.querySelectorAll('button.chev').forEach((btn, btx) => {
        btn.addEventListener('click', (e) => {
            btn.disabled = true;
            if(btx && page < size){
                page++;
            }else if(page >= 1){
                page--;
            }
            computeData(page);
            btn.disabled = false;
        })
    });
    //jump-to btn
    document.querySelector('button.jump-to').onclick = function(){this.classList.toggle('on')};
    document.querySelector('input#jump-to').addEventListener('change', (e) => {
        const val = Number(e.target.value);
        if(val !== '' && typeof val === 'number' && (val > 0 && val < size)) {
            page = val-1;
            computeData(page);
        }
    });
    document.forms.namedItem('rez_fom').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (eotReadyStatus) {
    
            e.submitter.disabled = true;
            loadbar.showPopover();
            const fd = new FormData(e.target);
            
            session = fd.get('snn') || session;
            FORM = fd.get('cls') || FORM;
            ARM = fd.get('arm') || ARM;
            term = fd.get('term') || term;
            percentile = Number(fd.get('res')) ? Number(fd.get('res')) : Number(fd.get('oth'));

            document.querySelector('dialog').hidePopover();
            // console.log(session, FORM, ARM, term, percentile, oth);
            chooseConfig(6);
            const sbjs = await getDoc(FORM.startsWith('JS') ? doc(db, 'reserved/2aOQTzkCdD24EX8Yy518') : doc(db, 'reserved/eWfgh8PXIEid5xMVPkoq'));
            offd = sbjs.data();
            try {
                chooseConfig(configs[7].indexOf(FORM))
                loaded(30);
                const principal = eotData.princ;    //eotData.principal[term]
                
                const studentsRef = collection(db, 'session', session, 'students');
                const studentsQuery = ARM == "ENTRANCE" ? query(studentsRef, and(where("admission_year", ">=", new Date().getFullYear()), where("arm", "==", "ENTRANCE"))) : query(studentsRef, where("arm", "==", ARM), orderBy('last_name'));
                loaded(40);
                const studentsSnapshot = await getDocs(studentsQuery);
                //second width
                const DCA = 'DCA';
                studentData = [];
                studentsSnapshot.docs.forEach(d => {
                    if (d.data().admission_no.toUpperCase().includes(DCA) && 'record' in d.data()) {
                        studentData.push(d.data());
                    }
                });
                page = 0;
                size = studentData.length;
                //compute and insert entire data
                computeData(page);
            } catch (err) {
                console.error(err.message);
                loadbar.hidePopover();
                dialog.hidePopover();
                pt = 7;
                loaded(0);
                e.submitter.disabled = false;
            } finally {
                loaded(1);
                loadbar.hidePopover();
                dialog.hidePopover();
                e.submitter.disabled = false;
                pt = 7;
                loaded(0);
            }
        }
    });
    // set teacher's name and comment
    const teacherDiv = document.getElementById('teacher');
    const teacherName = ss.formMaster;
    document.querySelector('select#trm').onchange = (e) => {
        term = Number(e.target.value);
        const comment = typeof ss.comment == "object" ? ss.comment?.[term] || '' : ss.comment;
        teacherDiv.querySelector('p').textContent = teacherName;
        teacherDiv.querySelector('blockquote').textContent = comment;
    }
    
    async function eot() {
        app = initializeApp(configs[6]);
        db = getFirestore(app);
        // chooseConfig(6);
        const eotRef = doc(db, 'EOT', session);
        await getDoc(eotRef).then(async (res) => {
            eotReadyStatus = 'ok';
            document.forms[0].querySelector('button').style.opacity = 1;
            // chooseConfig(configs[7].indexOf(FORM));
            // store dates in eotDates
            eotData = res.data();
            
            const stamp = '../img/24_25/stamp03.png';
            const photo = "../img/user.png" || ss.photo_src;
    
            //load photo
            document.images[1].src = photo;
            // load stamp
            document.querySelector("img[alt='stamp']").src = stamp;
        });
    }
    const pdfBtn = document.getElementById('pdf-btn');
    function generatePDF () {
        const main = document.querySelector('main');
        const dw = main.clientLeft * 4 + main.clientWidth;
        const dh = main.clientTop * 4 + main.clientHeight;
        var opt = {
            margin: 1,
            filename: fullName + '.pdf',
            html2canvas: { scale: 3 },
            jsPDF: { unit: 'px', format: [dw, dh], orientation: 'portrait', hotfixes: ['px_scaling'] }
        }
    
        html2pdf().set(opt).from(main).save();
    }
    pdfBtn.addEventListener('click', generatePDF);
    function isPromoted(){
        if(term == 2) {
            if(/^JSS/.test(ss.cls)){ //JSS class
                if(core_lower <= 49.4){
                    return percent.textContent = 'Not promoted.';
                }else if(core_lower >= 49.5 && core_lower <= 54.5){
                    return percent.textContent = 'Probation.';
                }else{
                    return percent.textContent = 'Promoted.';
                }
            }
            if(ss.cls.startsWith('SSS')){ //SSS class
                const promo = studentIDs.find(({sid}) => sid == ss.id).promo;
                if(promo !== null) {
                    percent.textContent = promo;
                }else{
                    for(const s in core) if(core[s] < 1) delete core[s];
                     const {MTH, ENG, ...others} = core;
                    if(MTH >= 50 && ENG >= 50 && Object.values(others).some(n => n >= 50)){
                        percent.textContent = 'Promoted.';
                    }else if((MTH >= 50 || ENG >= 50) && Object.values(core).filter(n => n >= 50).length >= 2){
                        percent.textContent = 'Probation';
                    }else if(Object.values(core).every(n => n < 50) || (MTH < 50 && ENG < 50)){
                        percent.textContent = 'Not promoted.';
                    }
                }
            }
        }else{
            // console.log(core_lower);
            const criteria = [80,65,50,40,30,0,];
            const status = ['A','B','C','D','E','F'].indexOf(criteria.findIndex(c => c <= core_lower));
            percent.textContent = status == -1 ? 'N/A' : status;
        }
    }
}