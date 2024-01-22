//const socket = io(`ws://localhost:3002/api/live`);
const socket = io({
    auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInRva2VuIjoiQWNjZXNzIiwiaWF0IjoxNzA1OTA0MjUyLCJleHAiOjE3MDU5OTA2NTJ9.348kV0iSreQLY30UXVuLSnO2BnNpvWGTdGs0LmbzH3c',

        //token: '//토큰 넣으면 됩니당',
        //token: getCookie(access_token),
    },
});

function getUserIdByToken(access_token) {}
const chatBox = document.querySelector('#chatBox');
const chatNickname = document.querySelector('#chatNickname');
const chatText = document.querySelector('#chatText');
const oneChat = document.querySelector('#oneChat');
const chatInputEnter = document.querySelector('#chatInput');

const sendChatBtn = document.querySelector('#sendChatBtn');
const chatRecord = document.querySelector('#record');

let roomNum;

//방 선택하면 서버에게 알려주는 애.
document.addEventListener('DOMContentLoaded', function () {
    const liveId = 'first'; //임으로 방 선정
    socket.emit('enter_room', liveId);
    console.log('두둥');
    roomNum = liveId;

    sendChatBtn.addEventListener('click', chatSending);
    chatInputEnter.addEventListener('keydown', (e) => {
        if (e.keyCode === 13 || e.which === 13) {
            chatSending(e);
        }
    });
});

//채팅 메시지 보내기
function chatSending(e) {
    e.preventDefault();
    const chatInput = document.querySelector('#chatInput');
    console.log('chatInput', chatInput.value, roomNum);
    socket.emit('new_message', chatInput.value, roomNum);
}

//메세지 받아오기
socket.on('sending_message', (msg, nickname) => {
    console.log('받은거', msg, nickname);
    addMessage(msg, nickname);
});

//채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
function getAllChatByLiveId(e) {
    e.preventDefault();
    const liveId = e.target.id;
    return socket.emit('get_all_chat_by_liveId', liveId);
}

//메세지 그리기
function addMessage(msg, nickname) {
    console.log('==>', msg, nickname);
    const temp = `<div><span class="chatNickname">${nickname}</span> ${msg}</div>`;
    chatBox.insertAdjacentHTML('beforeend', temp);
    chatInput.value = '';
}

//토큰 가져오는 함수
function getCookie(access_token) {
    const cookieArr = document.cookie.split(';');
    const getToken = cookieArr.filter((e) => {
        if (e.split('=')[0] === 'access_token') {
            return e.split('=')[1];
        }
    });
    return getToken;
}
