document.querySelector('.startLiveBtn').addEventListener('click', function () {
    window.location.href = '/streaming/:channelId';
});

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
    let formObject = {};
    for (let [key, value] of formData.entries()) {
        formObject[key] = value;
    }
    console.log('formObject', formObject);
    //formData.append('imgFile', imgFile.current);

    //채널아이디 값 가져오기
    //const channelId = window.location.pathname.slice(9);
    const channelId = 1; // 임시용
    console.log('channelId', channelId);

    //s3저장소에 이미지 넣기
    //const saveImage = await fetch(`http://localhost:3002/api/image`, {
    //    method: 'POST',
    //    body: formData,
    //});
    const saveImage = await axios.post(`http://localhost:3002/api/setting/${channelId}`, formData);
    console.log(saveImage);
    const responseData = await saveImage.json();
    console.log('responseData', responseData);
}
//채널이름, 채널 이미지, 디스크립션,
//회원가입 하면 같이 만들어짐. _ 렌덤함수돌림._ 가져오기만 하면됨. 로직에서 끍어와서 보여주기 스트림키(로직에서 _받아오는거)
