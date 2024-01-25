axios.defaults.withCredentials = true;
// const getAccessToken = getCookie('Authorization');
// const AccessToken = `Bearer ${getAccessToken}`;
if (!getAccessToken) {
    window.location.href = `http://localhost:3002`;
} else {
    document.querySelector('.startLiveBtn').addEventListener('click', async function () {
        const myChannelId = await axios
            .get('/streaming', {
                withCredentials: true,
                headers: {
                    authorization: AccessToken,
                },
            })
            .then((respones) => {
                return respones.data;
            });
        const url = `http://localhost:3002/streaming/${myChannelId}`;
        window.location.href = url;
    });
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

document.querySelector('.startLiveBtn').addEventListener('click', function () {
    window.location.href = '/streaming/:channelId';
});
