//nav tabs
document.querySelectorAll('.tab').forEach(tab => tab.onclick = function(){
    this.closest('nav').classList.toggle('opn');
});
/*cbt script*/
//tst event listener
const pop_code = document.getElementById('pop_code');
const input_code = pop_code.querySelector('input#cde');
function open_test(){
    document.querySelectorAll('.tst').forEach((tst, tsx) => {
        tst.addEventListener('click', (e) => {
            input_code.setAttribute('placeholder', `Enter Code for #${tsx+1}`);
            pop_code.showPopover();
        });
    });
}
open_test();