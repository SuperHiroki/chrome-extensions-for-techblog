// background.js

console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVV(background.js) Start.');

let apiToken = null;

console.log('QQQQQQQQQQQQQQQQQQ(background.js) apiToken: ' + apiToken);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.apiToken) {
        // 「http://techblog.shiroatohiro.com/*」を訪れたときにcontent.jsからAPIトークンを受信する。
        apiToken = message.apiToken;
        console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX(background.js) apiToken: ' + apiToken);
        //ページが切り替わってもAPIトークンを失わないようにストレージに保存する。
        chrome.storage.local.set({ 'apiToken': apiToken }, () => {
            console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHH(background.js) Token saved.');
        });
    } else if (message.request === "getApiToken") {
        //拡張機能のストレージからAPIトークンを取得する。
        chrome.storage.local.get('apiToken', (result) => {
            if (result.apiToken) {
                apiToken = result.apiToken;
                console.log('GGGGGGGGGGGGGGGGGG(background.js) apiToken found: ' + apiToken);
                //popup.jsにトークンを送信する。
                sendResponse({ token: apiToken });
            }
        });
    }
    return true;
});

