const path = window.location.pathname;

const socket = io({
    auth: {
        token: `${getCookie('Authorization')}`,
    },
    reconnection: true,
    reconnectionAttempts: Infinity, // 재연결 시도 횟수 (무한)
    reconnectionDelay: 1000, // 초기 재연결 지연 시간 (밀리초)
    reconnectionDelayMax: 5000, // 최대 재연결 지연 시간 (밀리초)
    pingInterval: 2000, // 60초마다 ping->2초
    pingTimeout: 6000, // 60초 동안 응답 없으면 연결 종료->10분으로 늘림
    upgradeTimeout: 60000, // 연결 업그레이드 시간 제한
});

const chatBox = document.querySelector('#chatBox');
const chatNickname = document.querySelector('#chatNickname');
const chatText = document.querySelector('#chatText');
const oneChat = document.querySelector('#oneChat');
const chatInputText = document.querySelector('.chatInputText');
const chatInputWrap = document.querySelector('.chatInputWrap');
const notification1 = document.querySelector('.notification1');
let roomNum;

if (path.includes('streaming')) {
    //방송 시작
    const startLiveChat = document.querySelector('#liveStartBtn');

    //방송종료
    const endChat = document.querySelector('#liveEndBtn');
    const sendChatBtnStreamerPage = document.querySelector('#sendChatBtnStreamerPage');

    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(11);
        roomNum = channelId;

        endChat.addEventListener('click', endLive);

        startLiveChat.addEventListener('click', (e) => {
            e.preventDefault();
            notification1.hidden = true;
            chatInputWrap.hidden = false;
            const createRoom = socket.emit('create_room', channelId);
        });

        sendChatBtnStreamerPage.addEventListener('click', chatSending);
        chatInputText.addEventListener('keydown', (e) => {
            if ((e.keyCode === 13) | (e.which === 13)) {
                chatSending(e);
            }
        });
        //스트리머가 유저 채팅 금지시키기
        chatBox.addEventListener('click', function (e) {
            e.preventDefault();
            if (+e.target.id >= 0 && e.target.classList.value === 'chatNickname') {
                const block = confirm(`"${e.target.innerText}" 유저를 차단하시겠습니까?`);
                if (block) socket.emit('block_user', roomNum, e.target.id, e.target.innerText);
            }
        });
    });
} else if (path.includes('channel')) {
    const sendChatBtn = document.querySelector('#sendChat');

    //방 선택하면 서버에게 알려주는 애.
    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(9);
        const enterRoom = socket.emit('enter_room', channelId);
        roomNum = channelId;

        chatInputText.onpaste = (e) => {
            //붙여 넣기 막기
            e.preventDefault();
            return false;
        };

        sendChatBtn.addEventListener('click', chatSending);
        chatInputText.addEventListener('keydown', (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                chatSending(e);
            }
        });
    });
}

//스트리머 방송 종료
async function endLive(e) {
    e.preventDefault();
    const url = '/?s=true';
    await socket.emit('stop_live', channelId);
    await socket.emit('exit_room', channelId);
    return (window.location.href = url);
}

//채팅 메시지 보내기
async function chatSending(e) {
    e.preventDefault();
    await axios
        .get('/api/user/authCheck', {
            withCredentials: true,
            headers: {
                authorization: `${getCookie('Authorization')}`,
            },
        })
        .then((res) => {})
        .catch((err) => {
            if (err.message === 'Network Error') return alert('500 잠시 후 다시 시도해 주세요.');
            return alert('로그인 후 이용 가능합니다.');
        });
    const chatInput = document.querySelector('.chatInputText');
    if (chatInput.value.trim().length < 1) {
        return;
    } else {
        socket.emit('new_message', chatInput.value, roomNum);
        chatInputText.value = '';
    }
}

//메세지 받아오기
socket.on('sending_message', (msg, nickname, userId) => {
    addMessage(msg, nickname, userId);
});

//금칙어_ 허용하지 않는 단어입니다.
socket.on('alert', (msg) => {
    alert(msg);
});

//에러메세지
socket.on('error_message', (msg) => {
    const getMessage = JSON.parse(msg);
    if (getMessage.error.message) {
        alert(getMessage.error.message);
    }
});

//방송 종료시 알림.경로 이동
socket.on('bye', () => {
    alert('방송이 종료되었습니다.');
    const url = '/';
    return (window.location.href = url);
});

//스트리머 연결 끊기면 방송 종료 버튼 안보이게
socket.on('streamer_reload_end', () => {
    const url = '/streaming/:roomNum';
    return (window.location.href = url);
});

//채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
function getAllChatByChannelId(e) {
    e.preventDefault();
    const channelId = e.target.id;
    return socket.emit('get_all_chat_by_channelId', channelId);
}

//메세지 그리기
function addMessage(msg, nickname, userId) {
    const chatListDiv = document.createElement('div');
    chatListDiv.classList.add('chatList');

    const nicknameSpan = document.createElement('span');
    nicknameSpan.classList.add('chatNickname');
    nicknameSpan.id = userId;

    if (+userId > 0) {
        chatListDiv.id = userId;
        nicknameSpan.textContent = nickname + ' ';
    }
    if (+userId < 0 || nickname === '스트리머') {
        chatListDiv.style.color = '#2af23a';
        nicknameSpan.style.color = '#2af23a';
        nicknameSpan.textContent = '스트리머' + ' ';
    }

    const messageText = document.createTextNode(msg);

    chatListDiv.appendChild(nicknameSpan);
    chatListDiv.appendChild(messageText);
    chatBox.appendChild(chatListDiv);

    chatScroll();
    return;
}

//스크롤
function chatScroll() {
    return (chatBox.scrollTop = chatBox.scrollHeight);
}
