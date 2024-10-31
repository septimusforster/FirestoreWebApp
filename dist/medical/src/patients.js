//set page title
const title = document.head.querySelector('title');
const parentTitle = parent.document.head.querySelector('title');
const APP = {
    init() {
        parent.document.head.replaceChild(title, parentTitle);
    }
}

document.addEventListener('DOMContentLoaded', APP.init);

const selectMonthBtn = document.querySelector('select#month');
selectMonthBtn.addEventListener('change', (e) => {
    selectMonthBtn.disabled = true;
    console.log(Number(e.target.value));
    selectMonthBtn.parentElement.nextElementSibling.classList.add('slct');
});