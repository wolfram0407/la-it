axios.defaults.withCredentials = true;
if (!getAccessToken) {
    window.location.href = '/';
} else {
    document.querySelector('.startLiveBtn').addEventListener('click', async function () {
        const myChannelId = await axios
            .get('/streaming', {
                withCredentials: true,
                headers: {
                    authorization: AccessToken,
                },
            })
            .then((response) => {
                return response.data;
            });
        const url = `/streaming/${myChannelId}`;
        window.location.href = url;
    });
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

document.querySelector('.startLiveBtn').addEventListener('click', function () {
    window.location.href = `/streaming/${channelId}`;
});
