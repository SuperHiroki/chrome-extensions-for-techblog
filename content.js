// content.js
//manifest.jsonに定義されているが、「http://techblog.shiroatohiro.com/*」を訪れたときに発火する。

console.log('RRRRRRRRRRRRRRRRRRRRRRRRR(content.js) Start.');

const apiToken = localStorage.getItem('apiToken');
if (apiToken) {
    console.log('CCCCCCCCCCCCCCCCCCCCCCC(content.js)  apiToken: ' + apiToken);
    // background.jsにトークンを送信
    chrome.runtime.sendMessage({ apiToken: apiToken });
}