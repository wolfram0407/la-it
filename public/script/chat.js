const path = window.location.pathname;

const socket = io({
    auth: {
        token: `${getCookie('Authorization')}`,
    },
    //transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity, // 재연결 시도 횟수 (무한)
    reconnectionDelay: 1000, // 초기 재연결 지연 시간 (밀리초)
    reconnectionDelayMax: 5000, // 최대 재연결 지연 시간 (밀리초)
    pingInterval: 2000, // 60초마다 ping->2초
    pingTimeout: 60000, // 60초 동안 응답 없으면 연결 종료->10분으로 늘림
    //pingTimeout: 6000000, // 60초 동안 응답 없으면 연결 종료->10분으로 늘림 __> 1000분
    upgradeTimeout: 60000, // 연결 업그레이드 시간 제한
});

console.log('path확인', path);

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
        roomNum = channelId;
        //만약 유저가 새로고침이 되어 다시 들어온거라면?
        //유저 시간. 유저
        endChat.addEventListener('click', endLive);

        startLiveChat.addEventListener('click', (e) => {
            e.preventDefault();
            const createRoom = socket.emit('create_room', channelId);
        });

        sendChatBtnStreamerPage.addEventListener('click', chatSending);
        chatInputText.addEventListener('keydown', (e) => {
            if ((e.keyCode === 13) | (e.which === 13)) {
                chatSending(e);
            }
        });
        1;
    });
} else if (path.includes('channel')) {
    const sendChatBtn = document.querySelector('#sendChat');

    //방 선택하면 서버에게 알려주는 애.
    document.addEventListener('DOMContentLoaded', function () {
        const channelId = window.location.pathname.slice(9);
        console.log('채널아이디', channelId);
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

// 연결 시작
socket.on('connect', () => {
    console.log('연결 시작~~~');
});

//ping 테스트
socket.io.on('ping', () => {
    console.log('핑이벤트 감지되었다');
});

//reconnect 테스트
socket.io.on('reconnect', (attempt) => {
    console.log('리커넥트 이벤트 실행중', attempt);
});

// 연결 해제될때 이유 보기
socket.on('disconnect', (reason) => {
    console.log('연결해제 이유', reason); //연결해제 이유 transport close
});

//재연결 시도가 시작될때
socket.io.on('reconnect_attempt', async (attempt) => {
    console.log('리커넥트 어템프으');
    await socket.emit('reconnect', { attempt: attempt });
});

//혹시몰라 실패할때 재연결
socket.io.on('reconnect_failed', () => {
    console.log('리커넥트 실패한 경우 일어나는 이벤트');
});

//재연결 에러날 경우 사용되는 이벤트
socket.io.on('reconnect_error', (error) => {
    console.log('리커넥트 에러에러에러 경우 일어나는 이벤트');
});

//재연결 시도중일 때
socket.on('reconnecting', async (attemptNumber) => {
    Logger.log('리커넥팅!! 실행중', attemptNumber);
    console.log('리커넥팅!! 실행중', attemptNumber);

    await socket.emit('reconnect', { attemptNumber: attemptNumber });
});

//연결 에러날때
socket.on('connect_error', (err) => {
    console.log(err.message); //에러 이유
    console.log(err.description);
    console.log(err.context);
});

//이건 되는지 테스트
socket.on('test', (value, nickname) => {
    console.log('테스트가 되나요? new_message에서 이게 작동 되게 하나요?', value, nickname);
});

//이건 되는지 테스트2
socket.on('test2', () => {
    console.log('테스트가 되나요22222? new_message에서 이게 작동 되게 하나요?');
});

//이건 되는지 테스트3
socket.on('test3', () => {
    console.log('테스트가 되나요3333 클라이언트아이디. new_message에서 이게 작동 되게 하나요?');
});

//스트리머 방송 종료
async function endLive(e) {
    e.preventDefault();
    const url = '/?s=true';
    await socket.emit('stop_live', channelId);
    await socket.emit('exit_room', channelId);
    //await axios
    //    .post(`/api/live/end/${channelId}`, {
    //        withCredentials: true,
    //        headers: {
    //            authorization: `${getCookie('Authorization')}`,
    //        },
    //    })
    //    .then((response) => {
    //        console.log('response', response.data.data);
    //        return response.data.data;
    //    });

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
            console.log('catch err 로그인 에러', err);
            if (err.message === 'Network Error') return alert('500 잠시 후 다시 시도해 주세요.');
            return alert('로그인 후 이용 가능합니다.');
        });
    const chatInput = document.querySelector('.chatInputText');
    console.log('인풋값', chatInput.value);
    if (chatInput.value.trim().length < 1) {
        return;
    } else {
        console.log('룸넘버 채팅방 채널아이디 확인', roomNum);
        socket.emit('new_message', chatInput.value, roomNum);
        chatInputText.value = '';
    }
}

//메세지 받아오기
socket.on('sending_message', (msg, nickname) => {
    console.log('sending_message 받은거~~', msg, nickname);
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

////서버 연결 불안정시 disconnect 되면 새로고침
//socket.on('reload', () => {
//    //const url = '/';
//    return window.location.reload(true);
//});

//채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
function getAllChatByChannelId(e) {
    e.preventDefault();
    const channelId = e.target.id;
    return socket.emit('get_all_chat_by_channelId', channelId);
}

//메세지 그리기
function addMessage(msg, nickname) {
    console.log('addMessage ==>', msg, nickname);
    const chatListDiv = document.createElement('div');
    chatListDiv.classList.add('chatList');

    const nicknameSpan = document.createElement('span');
    nicknameSpan.classList.add('chatNickname');
    nicknameSpan.textContent = nickname + ' ';
    const messageText = document.createTextNode(msg);

    chatListDiv.appendChild(nicknameSpan);
    chatListDiv.appendChild(messageText);
    chatBox.appendChild(chatListDiv);

    //const temp = ` <div class="chatList"><span class="chatNickname">${nickname}</span> ${msg}</div>`;
    //chatBox.insertAdjacentHTML('beforeend', temp);
    chatScroll();
    return;
}

//스크롤
function chatScroll() {
    return (chatBox.scrollTop = chatBox.scrollHeight);
}
