// content.js

console.log('RRRRRRRRRRRRRRRRRRRRRRRRR(content.js) Start.');

const apiToken = localStorage.getItem('apiToken');

if (apiToken) {
    console.log('CCCCCCCCCCCCCCCCCCCCCCC(content.js)  apiToken: ' + apiToken);
    // background.jsにトークンを送信
    chrome.runtime.sendMessage({ token: apiToken });
}
