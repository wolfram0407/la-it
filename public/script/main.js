const videoBoxes = document.querySelectorAll('.videoBox');

videoBoxes.forEach(function (videoBox) {
    videoBox.addEventListener('click', function () {
        const liveId = videoBox.querySelector('#liveId');
        window.location.href = `/live/${liveId.textContent}`;
    });
});
