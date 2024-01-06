// popup.js

console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG(popup.js) Start.');

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////サブ関数
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
            const error = new Error(responseData.message || 'API request failed.');
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
                reject('User token not found. Please login.');
            }
        });
    });
}

//現在のタブのURLを取得
function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length === 0) {
                reject('No current tab.');
            } else {
                resolve(tabs[0].url);
            }
        });
    });
}

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////ボタンを押したときに発火する関数
//いいね（ブックマーク、アーカイブ）をつけるリクエストを飛ばすメイン関数
async function handleAction(actionType) {
    try {
        //methodを取得
        let method;
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
        const response = await sendApiRequest(method, apiUrl, apiToken);
        //画面に反映する
        document.getElementById("success_msg").textContent = response.message;
        updateButtonsVisibilityFromActionType(actionType);
    } catch (error) {
        document.getElementById("error_msg").textContent = error;
        console.error('BBBBBBBBBB(popup.js) Caught error: ', error);
    }
}

//いいね（ブックマーク、アーカイブ）をつけたり外したりしたら下記を実行して表示・非表示を切り替える。
function updateButtonsVisibilityFromActionType(actionType) {
    let actionTypeReversed;
    if (actionType.startsWith('un')) {
        actionTypeReversed = actionType.substring(2); // 'un'を取り除く
    } else {
        actionTypeReversed = 'un' + actionType; // 'un'を追加する
    }
    document.getElementById(actionTypeReversed).style.display = "block";
    document.getElementById(actionType).style.display = "none";
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ページを読み込んだ時に発火する関数
// メイン関数
document.addEventListener('DOMContentLoaded', async () => {
    //ログインしていないものとして表示する
    console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH(popup.js) ');
    changeVisibilityFromIsLoggedIn(false);
    //ボタンにイベントを設置
    setActionToButton();
    try {
        //いいね（ブックマーク、アーカイブ）の状態を取得
        const response = await getArticleState();
        console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW(popup.js) response: ', response, ' DDDDDDDD');
        //ユーザ情報を取得
        const responseUserData = await getUserInfo();
        console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHH(popup.js) responseUserData: ', responseUserData, ' CCCCCCCC');
        //画面に反映する
        changeVisibilityFromIsLoggedIn(true);
        updateButtonsVisibility(response);
        document.getElementById("success_msg").textContent = response.message;
        document.getElementById("userName").textContent = responseUserData.name;
    } catch (error) {
        document.getElementById("error_msg").textContent = error;
        console.error('EEEEEEEEEEEEEEEEEEEEEEEEE(popup.js) Caught error: ', error);
    }
});

// ボタンにイベントリスナーを設定
function setActionToButton(){
    document.getElementById("like").addEventListener("click", () => handleAction('like'));
    document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
    document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
    document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
    document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
    document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));
}

// 現在の記事のいいね、ブックマーク、アーカイブの状態を取得
async function getArticleState() {
    try {
        const articleUrl = await getCurrentTabUrl();
        console.log('DDDDDDDDDDDDDDDDDD(popup.js) Current Article URL: ' + articleUrl);

        const apiToken = await getApiToken();//rejectされたときにcatchで捕捉されない？マジで疑問です。
        const apiUrl = `http://techblog.shiroatohiro.com/api/get-state?articleUrl=${encodeURIComponent(articleUrl)}`;
        console.log('SSSSSSSSSS(popup.js) apiToken: ' + apiToken);

        const response = await sendApiRequest('GET', apiUrl, apiToken);
        console.log('XXXXXXXXXXXXXXXXXXX(popup.js) Article State: ', response);
        return response;
    } catch (error) {
        throw error;
    }
}

//ログインできているかどうかで表示・非表示を切り替える。
function changeVisibilityFromIsLoggedIn(isLoggedIn = false) {
    if(isLoggedIn==true){
        document.getElementById("isLoggedIn").style.display = "block";
        document.getElementById("notIsLoggedIn").style.display = "none";
    }else{
        document.getElementById("isLoggedIn").style.display = "none";
        document.getElementById("notIsLoggedIn").style.display = "block";
    }
}

// ボタンの表示を更新する関数
function updateButtonsVisibility(response) {
    // likeの状態に基づいてボタンを表示・非表示
    if (response.like) {
        document.getElementById("like").style.display = "none";
        document.getElementById("unlike").style.display = "block";
    } else {
        document.getElementById("like").style.display = "block";
        document.getElementById("unlike").style.display = "none";
    }

    // bookmarkの状態に基づいてボタンを表示・非表示
    if (response.bookmark) {
        document.getElementById("bookmark").style.display = "none";
        document.getElementById("unbookmark").style.display = "block";
    } else {
        document.getElementById("bookmark").style.display = "block";
        document.getElementById("unbookmark").style.display = "none";
    }

    // archiveの状態に基づいてボタンを表示・非表示
    if (response.archive) {
        document.getElementById("archive").style.display = "none";
        document.getElementById("unarchive").style.display = "block";
    } else {
        document.getElementById("archive").style.display = "block";
        document.getElementById("unarchive").style.display = "none";
    }
}

//ユーザ情報を取得する。
async function getUserInfo() {
    try {
        const apiToken = await getApiToken();
        const apiUrl = 'http://techblog.shiroatohiro.com/api/user';
        const response = await sendApiRequest('GET', apiUrl, apiToken);
        console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWW User Info:', response);
        return response;
    } catch (error) {
        throw error;
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
