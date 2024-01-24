// popup.js

console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG(popup.js) Start.');
const baseUrl = "https://techblog.shiroatohiro.com/api";

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////サブ関数
//APIリクエスト
async function sendApiRequest(method, apiToken, url, body = null) {

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
        const responseStateMsg = response.status + ": " + response.statusText;
        const responseData = await response.json(); 
        if (!response.ok) {
            const error = new Error(responseData.message || responseStateMsg);
            throw error;
        }
        return responseData;
    } catch (error) {
        throw error;
    }
}

//APIトークンを取得
function getApiToken() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ request: "getApiToken" }, function(response) {
            if (response && response.apiToken) {
                resolve(response.apiToken);
            } else {
                reject('User apiToken not found. Please login.');
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

//成功メッセージとエラーメッセージの表示
const error_msg = document.getElementById("error_msg");
const success_msg = document.getElementById("success_msg");

function errorOrSuccessMsg(errorOrSuccess = "error", msg = ""){
    if(errorOrSuccess == "error"){
        error_msg.textContent = msg;
        error_msg.style.display ="block";
        success_msg.textContent = "";
        success_msg.style.display ="none";
    }else if(errorOrSuccess == "success"){
        error_msg.textContent = "";
        error_msg.style.display ="none";
        success_msg.textContent = msg;
        success_msg.style.display ="block";
    }
}

//アクションタイプからPOSTなどのメソッドを取得する。
function getMethod(actionType){
    let method;
    if(actionType == 'like'||actionType == 'bookmark'||actionType == 'archive'||actionType == 'trash'){
        method ='POST';
    }else if(actionType == 'unlike'||actionType == 'unbookmark'||actionType == 'unarchive'||actionType == 'untrash'){
        method ='DELETE';
    }
    return method;
}

//アクションタイプを反転する。
function reverseType(actionType){
    let actionTypeReversed;
    if (actionType.startsWith('un')) {
        actionTypeReversed = actionType.substring(2);
    } else {
        actionTypeReversed = 'un' + actionType;
    }
    return actionTypeReversed;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ボタンを押したときに発火する関数を設定。
document.addEventListener('DOMContentLoaded', async () => {
    setActionToButton();
});

// ボタンにイベントリスナーを設定
function setActionToButton(){
    //いいね（ブックマーク、アーカイブ）に対して。
    document.getElementById("like").addEventListener("click", () => handleAction('like'));
    document.getElementById("unlike").addEventListener("click", () => handleAction('unlike'));
    document.getElementById("bookmark").addEventListener("click", () => handleAction('bookmark'));
    document.getElementById("unbookmark").addEventListener("click", () => handleAction('unbookmark'));
    document.getElementById("archive").addEventListener("click", () => handleAction('archive'));
    document.getElementById("unarchive").addEventListener("click", () => handleAction('unarchive'));
    document.getElementById("trash").addEventListener("click", () => handleAction('trash'));
    document.getElementById("untrash").addEventListener("click", () => handleAction('untrash'));
    //ログインボタン
    document.getElementById('loginForm').addEventListener('submit', login);
}

//いいね（ブックマーク、アーカイブ、ゴミ箱）をつけるリクエストを飛ばすメイン関数
async function handleAction(actionType) {
    try {
        const apiToken = await getApiToken();
        const method = getMethod(actionType);
        const articleUrl = await getCurrentTabUrl();
        let apiUrl = baseUrl + `/${actionType}-article?articleUrl=${encodeURIComponent(articleUrl)}`;
        const response = await sendApiRequest(method, apiToken, apiUrl);
        //画面に反映する
        errorOrSuccessMsg("success", response.message);
        updateButtonsVisibilityFromActionType(actionType);
    } catch (error) {
        errorOrSuccessMsg("error", error);
    }
}

//いいね（ブックマーク、アーカイブ）をつけたり外したりしたら下記を実行して表示・非表示を切り替える。
function updateButtonsVisibilityFromActionType(actionType) {
    const actionTypeReversed = reverseType(actionType);
    document.getElementById(actionTypeReversed).style.display = "block";
    document.getElementById(actionType).style.display = "none";
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ユーザ情報、ユーザのいいね（ブックマーク、アーカイブ）の状態を取得する。
// ページを読み込んだ時に発火する関数
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await updateUserState();
    } catch (error) {
        errorOrSuccessMsg("error", error);
    }
});

//ユーザ情報やいいね（ブックマーク、アーカイブ）の状態を取得して表示する。
async function updateUserState(){
    try{
        //ユーザ情報を取得
        const responseUserData = await getUserInfo();
        changeVisibilityFromIsLoggedIn(true);
        showUserState(responseUserData);
        //いいね（ブックマーク、アーカイブ）の状態を取得
        const response = await getUserStateToArticle();
        updateButtonsVisibility(response);
        //フラッシュ
        errorOrSuccessMsg("success", response.message);
    }catch (error) {
        throw error;
    }
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////ユーザ情報を取得
//ユーザ情報を取得する。
async function getUserInfo() {
    try {
        const apiToken = await getApiToken();
        const apiUrl = baseUrl + '/user';
        const response = await sendApiRequest('GET', apiToken, apiUrl);
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

//ユーザ情報を表示する。
function showUserState(responseUserData){
    document.getElementById("userName").textContent = responseUserData.name;
}

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////ユーザのいいね（ブックマーク、アーカイブ）の状態を取得する。
// 現在の記事のいいね、ブックマーク、アーカイブの状態を取得
async function getUserStateToArticle() {
    try {
        const articleUrl = await getCurrentTabUrl();
        const apiToken = await getApiToken();//rejectされたときにcatchで捕捉されない？マジで疑問です。
        const apiUrl = baseUrl + `/get-state?articleUrl=${encodeURIComponent(articleUrl)}`;
        const response = await sendApiRequest('GET', apiToken, apiUrl);
        return response;
    } catch (error) {
        throw error;
    }
}

// ボタンの表示を更新する関数
function updateButtonsVisibility(response) {
    //全体のボタンに適用する
    document.getElementById("allButtons").style.display = "block";

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

    //trashについて
    if (response.trash) {
        document.getElementById("trash").style.display = "none";
        document.getElementById("untrash").style.display = "block";
    } else {
        document.getElementById("trash").style.display = "block";
        document.getElementById("untrash").style.display = "none";
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////ログインの処理
//ログインボタンを押すと発火する。
async function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await sendApiRequest('POST', null, baseUrl + '/login', { 'email': email, 'password': password });
        if (response.apiToken) {
            // トークンをストレージに保存
            const apiToken = response.apiToken;
            chrome.runtime.sendMessage({ apiToken: apiToken });
            //画面を更新
            updateUserState();
        } else {
            throw new Error('Login failed.');
        }
    } catch (error) {
        errorOrSuccessMsg("error", error);
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////