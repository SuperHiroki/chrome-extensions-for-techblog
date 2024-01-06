// popup.js

console.log('in popup.js GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG start');

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
            const error = new Error(responseData.message || 'in popup.js AAAAAAAAA API request failed');
            error.status = response.status;
            throw error;
        }
        return await responseData;
    } catch (error) {
        console.error('in popup.js CCCCCCCCCCCCCCCCCCCCC error.message: ', error.message, ' YYYYYYYYYYY error.status: ', error.status);
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
                reject('in popup.js UUUUUUUUUUU User token not found. Please login.');
            }
        });
    });
}

//現在のタブのURLを取得
function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                reject('in popup.js CCCCCCCCCCC no current tab.');
            } else {
                resolve(tabs[0].url);
            }
        });
    });
}

//
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
        let apiUrl = `http://techblog.shiroatohiro.com/api/${actionType}-article?articleUrl=${encodeURIComponent(articleUrl)}`;
        //apiTokenを取得
        const apiToken = await getApiToken();
        //APIへリクエスト
        const response_json = await sendApiRequest(method, apiUrl, apiToken);
        if(response_json && response_json.message) {
            document.getElementById("msg").textContent = response_json.message;
        }
    } catch (error) {
        console.error('in popup.js BBBBBBBBBB: ', error);
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
            console.log('in popup.js FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF apiToken: ' + apiToken);
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
            console.error('in popup.js VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV User token not found. Please login.');
        }
    });
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////