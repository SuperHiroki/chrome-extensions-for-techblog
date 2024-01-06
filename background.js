// background.js

console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVV(background.js) Start.');

let apiToken = null;

console.log('QQQQQQQQQQQQQQQQQQ(background.js) apiToken: ' + apiToken);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.token) {
        // content.jsからトークンを受信する。
        apiToken = message.token;
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX(background.js) apiToken: ' + apiToken);
    } else if (message.request === "getApiToken") {
        //popup.jsにトークンを送信する。
        console.log('YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY(background.js) apiToken: ' + apiToken);
        sendResponse({ token: apiToken });
    }
    return true;
});

