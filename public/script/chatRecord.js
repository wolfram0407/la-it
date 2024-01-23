const socket = io({
    auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInRva2VuIjoiQWNjZXNzIiwiaWF0IjoxNzA1NzQ3Njc0LCJleHAiOjE3MDU4MzQwNzR9.MT_ClHuevF0DolsnzJryPHFxQleJGmVFRyGAmurGk9Q',
        //token: getCookie(access_token),
    },
});

const chatRecord = document.querySelector('.record');

let roomNum;

//방 선택하면 서버에게 알려주는 애.
document.addEventListener('DOMContentLoaded', function () {
    chatRecord.addEventListener('click', getAllChatByLiveId);
});

//채팅 전체 메세지 받아오기 _ 추후 방송별 채팅 메세지 받아오기 버튼 추가(유저 채널 쪽에)
function getAllChatByLiveId(e) {
    e.preventDefault();
    const liveId = e.target.id;
    console.log('채널메세지 가져오기 아이디', liveId);
    return socket.emit('get_all_chat_by_liveId', liveId);
}
