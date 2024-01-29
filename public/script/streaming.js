const liveStartBtn = document.getElementById('liveStartBtn');
const liveEndBtn = document.getElementById('liveEndBtn');
const broadcastBtn = document.querySelector('.broadcastBtn');
const broadcastCloseBtn = document.querySelector('.broadcastCloseBtn');
const channelId = document.querySelector('.channelId').textContent;
console.log('channelId: ', channelId);

const video = document.getElementById('video');

// 방송 시작 버튼 눌렀을때 라이브 등록 처리
liveStartBtn.addEventListener('click', createLive);
liveEndBtn.addEventListener('click', endLive);

// 방송 페이지 벗어나면 방송 종료

async function createLive() {
    let streamingTitle = document.getElementById('streamingTitle').value;
    let streamingDesc = document.getElementById('streamingDesc').value;
    //console.log('streamingTitle: ', streamingTitle);
    //console.log('streamingDesc: ', streamingDesc);

    await axios.post(`/api/live/create/${channelId}`, {
        title: streamingTitle,
        thumbnail: 'test image',
        description: streamingDesc,
    }),
        {
            withCredentials: true,
            headers: {
                authorization: getAccessToken,
            },
        }
            .then(function (response) {
                //console.log('response: ', response);

                const streamKey = response.data.channel.streamKey;
                //console.log('streamKey: ', streamKey);
                broadcastBtn.hidden = true;
                broadcastCloseBtn.hidden = false;

                if (Hls.isSupported()) {
                    1;
                    const hls = new Hls({
                        debug: false,
                    });

                    console.log(`${HLS_URL}/hls/${streamKey}/index.m3u8`);
                    hls.loadSource(`${HLS_URL}/hls/${streamKey}/index.m3u8`);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                        video.muted = true;
                        video.play();
                    });
                }
            })
            .catch(function (error) {
                //console.log(error);
            });
}

async function endLive() {
    await axios
        .post(`/api/live/end/${channelId}`)
        .then(function (response) {
            window.location.href = `/my-page/${channelId}`;
        })
        .catch(function (error) {
            console.log(error);
        });
}

// hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
// When the browser has built-in HLS support (check using canPlayType), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element through the src property.
// This is using the built-in support of the plain video element, without using hls.js.
// else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//     video.src = 'http://localhost:1935/tmp/hls/1234/index.m3u8';
//     video.addEventListener('canplay', function () {
//         video.play();
//     });
//}
