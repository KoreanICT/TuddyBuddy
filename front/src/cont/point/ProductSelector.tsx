import React, { useState } from 'react';
import styles from './productSelector.module.css';

//const apiUrl = process.env.BACKEND_URL;

// 1. 타입 인터페이스 정의
export interface Product {
  id: number;
  porint: number;
  price: number;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, porint: 1000, price: 1000 },
  { id: 2, porint: 2000, price: 2000 },
  { id: 3, porint: 3000, price: 3000 },
  { id: 4, porint: 4000, price: 4000 },
  { id: 5, porint: 5000, price: 5000 },
  { id: 6, porint: 10000, price: 10000 },
  // { id: 7, name: '상품 7', price: 7000 },
  // { id: 8, name: '상품 8', price: 8000 },
];

interface ProductSelectorProps {
  onSelectOrder?: (selectedProduct: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ onSelectOrder }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOrderSubmit = async () => {
    if (!selectedProduct || isLoading) return;

    try {
      setIsLoading(true);

      const paymentId = `pay_${crypto.randomUUID()}`;

      // 2. 포트원 결제창 호출 (현재 화면 위에 팝업/모달로 뜸)
      const PortOne = await import('@portone/browser-sdk/v2');

      const response = await PortOne.requestPayment({
        storeId: 'store-7546d629-17dd-4a8f-b414-9ccfb6deda0e', // 포트원 가맹점 Store ID
        channelKey: 'channel-key-7a9d14d3-eb51-47bf-9558-a0bdfed2fee4', // 채널 키
        paymentId: paymentId,
        orderName: `${selectedProduct.porint}`,
        totalAmount: selectedProduct.price,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
      });

      // 결제 오류/취소 처리
      if (!response || response.code !== undefined) {
        alert(`결제 실패: ${response?.message || '결제가 취소되었거나 응답이 없습니다.'}`);
        return;
      }

      // 3. 백엔드 사후 검증 호출
      const verifyResponse = await fetch(`http://192.168.0.44/back/api/point/pointAdd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            paymentId: response.paymentId,
            payment:selectedProduct,
            description:"포인트 결제",
            point_type:"PAYMENT"
        }),
      });

      console.log(verifyResponse);

      if (verifyResponse.ok) {
        alert('결제가 완료되었습니다!');
      } else {
        alert('결제 검증에 실패했습니다.');
      }

    } catch (error) {
      console.error('결제 중 오류 발생:', error);
      alert('결제 처리 중 오류가 발생했습니다.');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.wrapper}`}>
      <div className={styles.card}>
        <h2 className={styles.title}>상품 선택</h2>

        <div className={styles.grid}>
          {MOCK_PRODUCTS.map((product) => {
            const isSelected = selectedProduct?.id === product.id;
            return (
              <button
                key={product.id}
                type="button"
                className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleSelectProduct(product)}
              >
                <span className={styles.productName}>{product.porint} point</span>
                <span className={styles.productPrice}>
                  {product.price.toLocaleString()}원
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.orderSection}>
          <div className={styles.selectedInfo}>
            {selectedProduct ? (
              <>
                선택한 상품: <strong>{selectedProduct.porint}</strong> (
                {selectedProduct.price.toLocaleString()}원)
              </>
            ) : (
              '상품을 선택해 주세요.'
            )}
          </div>

          <button
            type="button"
            className={styles.orderButton}
            disabled={!selectedProduct}
            onClick={handleOrderSubmit}
          >
            상품 주문하기
          </button>
        </div>
      </div>
    </div>
  );
};