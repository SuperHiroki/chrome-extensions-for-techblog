// popup.js

console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG(popup.js) Start.');

//APIリクエスト
async function sendApiRequest(method, url, apiToken, body = null) {
    const options = {
        method: method,
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        const responseData = await response.json(); 
        if (!response.ok) {
            const error = new Error(responseData.message || 'AAAAAAAAA(popup.js) API request failed.');
            error.status = response.status;
            console.log('CCCCCCCCCCCCCCCCCCCCC(popup.js) error.message: ', error.message, ' YYYYYYYYYYY(popup.js) error.status: ', error.status);
            throw error;
        }
        return await responseData;
    } catch (error) {
        throw error;
    }
}

//APIトークンを取得
function getApiToken() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ request: "getApiToken" }, function(response) {
            if (response && response.token) {
                resolve(response.token);
            } else {
                reject('UUUUUUUUUUU(popup.js) User token not found. Please login.');
            }
        });
    });
}

//現在のタブのURLを取得
function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                reject('CCCCCCCCCCC(popup.js) No current tab.');
            } else {
                resolve(tabs[0].url);
            }
        });
    });
}

//メインの関数
async function handleAction(actionType) {
    try {
        //methodを取得
        let method = 'GET';
        if(actionType == 'like'||actionType == 'bookmark'||actionType == 'archive'){
            method ='POST';
        }else if(actionType == 'unlike'||actionType == 'unbookmark'||actionType == 'unarchive'){
            method ='DELETE';
        }
        //apiUrlを取得
        const articleUrl = await getCurrentTabUrl();
        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA(popup.js) articleUrl: ' + articleUrl);
        let apiUrl = `http://techblog.shiroatohiro.com/api/${actionType}-article?articleUrl=${encodeURIComponent(articleUrl)}`;
        //apiTokenを取得
        const apiToken = await getApiToken();
        //APIへリクエスト
        const response_json = await sendApiRequest(method, apiUrl, apiToken);
        if(response_json && response_json.message) {
            document.getElementById("msg").textContent = response_json.message;
        }
    } catch (error) {
        console.error('BBBBBBBBBB(popup.js) catch error: ', error);
    }
}
// ボタンにイベントリスナーを設定
document.getElementById("like").addEventListener("click", () => handleAction('like'));
document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////テスト
document.getElementById("test").addEventListener("click", () => handleAction_test());

function handleAction_test() {
    // ここでbackground.jsからトークンを取得する
    chrome.runtime.sendMessage({ request: "getApiToken" }, async function(response) {
        if (response && response.token) {
            const apiToken = response.token;
            console.log('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF(popup.js) apiToken: ' + apiToken);
            // 現在のタブのURLを取得
            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                var currentTab = tabs[0];
                if (currentTab) {
                    const articleUrl = encodeURIComponent(currentTab.url);
                    const apiUrl = `http://techblog.shiroatohiro.com/api/test`;
                    // 非同期リクエストを実行して応答を待つ
                    const response_json = await sendApiRequest('GET', apiUrl, apiToken);
                    document.getElementById("msg").textContent = response_json.message;
                }
            });
        } else {
            console.error('VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV(popup.js) User token not found. Please login.');
        }
    });
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////