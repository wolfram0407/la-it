const getAccessToken = getCookie('Authorization');

const chargeBtn = document.querySelector('.chargeBtn');

chargeBtn.addEventListener('click', paymentRequest);
//하트 충전하기 버튼 누르면 실행될 함수.(결제 요청)
async function paymentRequest(paymentAmount, paymentType) {
    const paymentReqSend = await axios.post(
        '/api/payments/charge',
        { paymentAmount, paymentType },
        {
            //withCredentials: true,
            headers: {
                authorization: getAccessToken,
            },
        },
    );
    const result = await paymentReqSend.json();
    console.log('result  페이먼트 프론트', result);
}
paymentRequest(20000, 'CARD');
//하트 충전하기 버튼 누르면 실행될 함수.(결제 검증)
async function paymentRequestConfirm(paymentAmount, paymentId) {
    await axios(`${URL}/payment/complete`);
}

const { chargeHeart, paymentAmount, paymentType, refundAmount, refundAccount } = addHeartDto;

async function paymentRequestConfirm(paymentAmount, paymentId) {
    await axios(`${URL}/payment/complete`);
}
// /payment/complete 엔드포인트를 구현해야 합니다. 다음 목차에서 설명합니다.
const notified = await axios(`${URL}/payment/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // paymentId와 주문 정보를 서버에 전달합니다
    body: JSON.stringify({
        paymentId: paymentId,
        // 주문 정보...
    }),
});
