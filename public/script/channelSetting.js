document.querySelector('#channelManagement').addEventListener('click', writeChannelInfo);

function writeChannelInfo(e) {
    e.preventDefault();

    document.querySelector('.channelInfoContainer').setAttribute('hidden', true);
    document.querySelector('.homeBox').setAttribute('hidden', true);
    document.querySelector('.channelInfoSettingContainer').removeAttribute('hidden');
    document.querySelector('#channelSettingForm').addEventListener('submit', sendChannelInfoData);
}

async function sendChannelInfoData(e) {
    e.preventDefault();

    const getAccessToken = getCookie('Authorization');
    const AccessToken = `Bearer ${getAccessToken}`;
    let saveImageUrlData;
    //이미지 업로드에 먼저 올린 후,
    //주소값 문자로 받은후
    //channelRepository에 올리기.

    let formDataObj = {};
    const formData = new FormData(this);
    for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
    }
    console.log('formDataObj', formDataObj);

    //채널아이디 값 가져오기
    const channelId = window.location.pathname.slice(9);
    //const channelId = 1; // 임시용

    //s3저장소에 이미지 넣기
    await axios
        .post(`http://localhost:3002/api/setting/${channelId}`, formData, {
            withCredentials: true,
            headers: {
                authorization: AccessToken,
            },
        })
        .then((response) => {
            console.log('response', response.data.data);
            return (saveImageUrlData = response.data.data);
        });

    //데이터 channelRepository에 올리기
    await axios
        .put(`http://localhost:3002/api/channel/info/${channelId}`, {
            withCredentials: true,
            headers: {
                authorization: AccessToken,
            },
            data: {
                channelImage: saveImageUrlData,
                channelName: formDataObj.channelName,
                description: formDataObj.channelDescription,
            },
        })
        .then((response) => {
            console.log('response', response);
            //saveImageUrlData = response.data.data;
        });
    document.querySelector('.channelInfoContainer').removeAttribute('hidden');
    document.querySelector('.homeBox').removeAttribute('hidden');
    document.querySelector('.channelInfoSettingContainer').setAttribute('hidden', true);
}
