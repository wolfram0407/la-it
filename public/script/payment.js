const chargeform = document.querySelector('.chargeform');

chargeform.addEventListener('submit', paymentRequest);

//하트 충전하기 버튼 누르면 실행될 함수.(결제 요청)
async function paymentRequest(e) {
    e.preventDefault();
    const getAccessToken = getCookie('Authorization');
    const formData = new FormData(this);

    let formDataObj = {};
    for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
    }

    await axios
        .post(
            '/api/payments/charge',
            {
                paymentAmount: formDataObj.paymentAmount,
                paymentType: formDataObj.paymentType,
            },
            {
                headers: {
                    authorization: getAccessToken,
                },
            },
        )
        .then((response) => {
            // console.log('리스펀스', response);
        });
}

//하트 충전하기 버튼 누르면 실행될 함수.(결제 검증)
async function paymentRequestConfirm(paymentAmount, paymentId) {
    await axios(`${URL}/payment/complete`);
}

//공식문서 참고 코드
//async function paymentRequestConfirm(paymentAmount, paymentId) {
//    await axios(`${URL}/payment/complete`);
//}
//// /payment/complete 엔드포인트를 구현해야 합니다. 다음 목차에서 설명합니다.
//const notified = await axios(`${URL}/payment/complete`, {
//    method: 'POST',
//    headers: { 'Content-Type': 'application/json' },
//    // paymentId와 주문 정보를 서버에 전달합니다
//    body: JSON.stringify({
//        paymentId: paymentId,
//        // 주문 정보...
//    }),
//});
