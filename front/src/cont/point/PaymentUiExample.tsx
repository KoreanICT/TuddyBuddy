import React from 'react';

export default function PaymentUiExample() {
  const handleOpenPaymentUi = async () => {
    try {
      const PortOne = await import('@portone/browser-sdk/v2');

      // 결제창 UI 호출 (실제 결제가 이뤄지지 않는 테스트용 요청)
      const response = await PortOne.requestPayment({
        // 포트원 테스트 상점 ID 및 테스트 채널 키 지정
        storeId: 'store-82a1768d-e009-4623-a55e-089c1f6d90a1', 
        channelKey: 'channel-key-16629f6d-31eb-47eb-ba6a-54cf176211ff', 
        
        paymentId: `test-order-${crypto.randomUUID()}`,
        orderName: '[UI 테스트] 개발자 연동 테스트 상품',
        totalAmount: 1000,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD', // 카카오페이, 네이버페이, 카드 등 결제수단 선택 가능
        
        customer: {
          fullName: '테스터',
          phoneNumber: '010-0000-0000',
          email: 'test@example.com',
        },
      });

      if (!response) return;

      // 테스트 환경이므로 창을 닫거나 취소했을 때의 예외 처리
      if ('code' in response) {
        console.log('UI 창 닫힘 또는 취소:', response.message);
        alert(`결제창이 닫혔습니다: ${response.message}`);
        return;
      }

      // 테스트 결제 성공 시
      alert('테스트 결제창 흐름 완료! (실제 출금은 되지 않았습니다)');
      console.log('테스트 Payment ID:', response.paymentId);

    } catch (error) {
      console.error('결제 UI 호출 오류:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>포트원 결제 UI 시연</h3>
      <button 
        onClick={handleOpenPaymentUi}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3182f6',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        결제창 UI 띄우기 (실 결제 X)
      </button>
    </div>
  );
}