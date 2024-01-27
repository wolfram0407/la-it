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

    //이미지 업로드에 먼저 올린 후,
    //주소값 문자로 받은후
    //channelRepository에 올리기.

    const formData = new FormData(this);

    //채널아이디 값 가져오기
    const channelId = window.location.pathname.slice(9);
    console.log('channelId: ', channelId);
    // const channelId = 1; // 임시용

    //s3저장소에 이미지 넣기
    const saveImage = await axios.post(`${URL}/api/setting/${channelId}`, formData);
    //const responseData = await saveImage.json();

    document.querySelector('.channelInfoContainer').removeAttribute('hidden');
    document.querySelector('.homeBox').removeAttribute('hidden');
    document.querySelector('.channelInfoSettingContainer').setAttribute('hidden', true);
}
