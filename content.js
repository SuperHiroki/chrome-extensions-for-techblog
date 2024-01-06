// content.js

console.log('in content.js RRRRRRRRRRRRRRRRRRRRRRRRR start');

const apiToken = localStorage.getItem('apiToken');

if (apiToken) {
    console.log('in content.js CCCCCCCCCCCCCCCCCCCCCCC  apiToken: ' + apiToken);
    // background.jsにトークンを送信
    chrome.runtime.sendMessage({ token: apiToken });
}
