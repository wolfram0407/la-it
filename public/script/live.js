const liveStartBtn = document.getElementById('liveStartBtn');
const liveEndBtn = document.getElementById('liveEndBtn');
const broadcastBtn = document.querySelector('.broadcastBtn');
const broadcastCloseBtn = document.querySelector('.broadcastCloseBtn');

async function createLive() {
    await axios
        .post('/api/live/create', {
            title: '라이브 등록 테스트',
            thumbnail: 'test image',
            userName: 'test user',
            userImage: 'test userImage',
        })
        .then(function (response) {
            broadcastBtn.hidden = true;
            broadcastCloseBtn.hidden = false;
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function endLive() {
    window.location.href = '/my-page';
}

// 방송 시작 버튼 눌렀을때 라이브 등록 처리
liveStartBtn.addEventListener('click', createLive);
liveEndBtn.addEventListener('click', endLive);

const video = document.getElementById('video');
if (Hls.isSupported()) {
    1;
    const hls = new Hls({
        debug: true,
    });
    hls.loadSource('http://localhost:8080/hls/test/index.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        video.muted = true;
        video.play();
    });
}
// hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
// When the browser has built-in HLS support (check using canPlayType), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the src property.
// This is using the built-in support of the plain video element, without using hls.js.
else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'http://localhost:1935/tmp/hls/1234/index.m3u8';
    video.addEventListener('canplay', function () {
        video.play();
    });
}
