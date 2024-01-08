//script.js

console.log('XXXXXXXXXXXXXXXXXXXX(script.js) Start.')

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////エラー（成功）メッセージの欄に動的にパディングを与える。
// 要素の内容が変更された際に呼び出される関数
function handleMutation(mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
            if (mutation.target.textContent.trim().length > 0) {
                mutation.target.classList.add('p-2');
            } else {
                mutation.target.classList.remove('p-2');
            }
        }
    }
}

// Mutation Observerの設定
const observerOptions = {
    childList: true, // 子要素の変更を監視
    characterData: true, // 文字データの変更を監視
    subtree: true // 子孫要素の変更も監視
};

// Observerのインスタンスを作成し、監視を開始
const errorMsgObserver = new MutationObserver(handleMutation);
const successMsgObserver = new MutationObserver(handleMutation);

const errorMsg = document.getElementById('error_msg');
const successMsg = document.getElementById('success_msg');

errorMsgObserver.observe(errorMsg, observerOptions);
successMsgObserver.observe(successMsg, observerOptions);
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
