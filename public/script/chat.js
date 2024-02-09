const path = window.location.pathname;

const socket = io({
    auth: {
        token: `${getCookie('Authorization')}`,
    },
});

console.log('path확인', path);
console.log('소켓 연결 확인', socket);

const chatBox = document.querySelector('#chatBox');
const chatNickname = document.querySelector('#chatNickname');
const chatText = document.querySelector('#chatText');
const oneChat = document.querySelector('#oneChat');
const chatInputText = document.querySelector('.chatInputText');

let roomNum;

if (path.includes('streaming')) {
    //방송 시작
    const startLiveChat = document.querySelector('#liveStartBtn');

    //방송종료
    const endChat = document.querySelector('#liveEndBtn');
    const sendChatBtnStreamerPage = document.querySelector('#sendChatBtnStreamerPage');

    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(11);
        //만약 유저가 새로고침이 되어 다시 들어온거라면?
        //유저 시간. 유저
        endChat.addEventListener('click', endLive);

        startLiveChat.addEventListener('click', (e) => {
            e.preventDefault();
            const createRoom = socket.emit('create_room', channelId);
            roomNum = channelId;
        });

        sendChatBtnStreamerPage.addEventListener('click', chatSending);
        chatInputText.addEventListener('keydown', (e) => {
            if ((e.keyCode === 13) | (e.which === 13)) {
                chatSending(e);
            }
        });
    });
} else if (path.includes('channel')) {
    const sendChatBtn = document.querySelector('#sendChat');
    //const chatRecord = document.querySelector('#record');

    //방 선택하면 서버에게 알려주는 애.
    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(9);
        const enterRoom = socket.emit('enter_room', channelId);
        console.log('두둥', enterRoom, '---');
        roomNum = channelId;
        console.log('라이브 아이디', roomNum);

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
    socket.emit('stop_live', channelId);
    //chat.disconnect가 정상적으로 연결끊김 문제 및 에러가 해결되면 이건 지우거.
    await axios
        .post(`/api/live/end/${channelId}`, {
            withCredentials: true,
            headers: {
                authorization: `${getCookie('Authorization')}`,
            },
        })
        .then((response) => {
            console.log('response', response.data.data);
            return response.data.data;
        });

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
        .then((res) => {
            console.log('res', res);
        })
        .catch((err) => {
            console.log('catch err', err);
            return alert('로그인 후 이용 가능합니다.');
        });
    const chatInput = document.querySelector('.chatInputText');
    console.log('~~~> ', chatInput.value);
    if (chatInput.value.trim().length < 1) {
        return;
    } else {
        socket.emit('new_message', chatInput.value, roomNum);
    }
}

//메세지 받아오기
socket.on('sending_message', (msg, nickname) => {
    console.log('받은거', msg, nickname);
    addMessage(msg, nickname);
});

//금칙어_ 허용하지 않는 단어입니다.
socket.on('alert', (msg) => {
    console.log('받은거', msg);
    alert(msg);
    //addMessage(msg, nickname);
});

//에러메세지
socket.on('error_message', (msg) => {
    console.log('받은거', msg);
    const getMessage = JSON.parse(msg);
    if (getMessage.error.message) {
        alert(getMessage.error.message);
    }
});

//방송 종료시 알림.경로 이동
socket.on('bye', () => {
    console.log('종료 bye 실행중');
    alert('방송이 종료되었습니다.');
    const url = '/';
    return (window.location.href = url);
});

//채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
function getAllChatByChannelId(e) {
    e.preventDefault();
    const channelId = e.target.id;
    return socket.emit('get_all_chat_by_channelId', channelId);
}

//메세지 그리기
function addMessage(msg, nickname) {
    console.log('==>', msg, nickname);
    const temp = ` <div class="chatList" id="oneChat"><span class="chatNickname">${nickname}</span> ${msg}</div>`;
    chatBox.insertAdjacentHTML('beforeend', temp);
    chatScroll();
    return (chatInputText.value = '');
}

//스크롤
function chatScroll() {
    return (chatBox.scrollTop = chatBox.scrollHeight);
}
