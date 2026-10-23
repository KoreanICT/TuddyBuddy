//김진규
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../login/hooks/useAuth';
import { BACKEND_URL } from '../../login/authHttp';
import styles from './productSelector.module.css';

//const apiUrl = process.env.BACKEND_URL;

// 1. 타입 인터페이스 정의
export interface Product {
  id: number;
  porint: number;
  price: number;
  image: string;
  portraitAlt: string;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, porint: 1000, price: 1000, image: '/images/point-products/tuddy-1000.png', portraitAlt: '워싱턴 스타일 터디' },
  { id: 2, porint: 2000, price: 2000, image: '/images/point-products/buddy-2000.png', portraitAlt: '제퍼슨 스타일 버디' },
  { id: 3, porint: 5000, price: 5000, image: '/images/point-products/tuddy-5000.png', portraitAlt: '링컨 스타일 터디' },
  { id: 4, porint: 10000, price: 10000, image: '/images/point-products/buddy-10000.png', portraitAlt: '해밀턴 스타일 버디' },
  { id: 5, porint: 20000, price: 20000, image: '/images/point-products/tuddy-20000.png', portraitAlt: '잭슨 스타일 터디' },
  { id: 6, porint: 50000, price: 50000, image: '/images/point-products/buddy-50000.png', portraitAlt: '그랜트 스타일 버디' },
];

interface ProductSelectorProps {
  onSelectOrder?: (selectedProduct: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ onSelectOrder }) => {
  const { token, memberNum } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<number | null>(null);
  const [pointLoading, setPointLoading] = useState(true);
  const [pointError, setPointError] = useState('');
  const [pointRefreshKey, setPointRefreshKey] = useState(0);

  // 기존 마이페이지 회원 조회 API의 point 값을 사용해 현재 잔액을 확인합니다.
  const loadCurrentPoint = useCallback(async () => {
    if (memberNum == null || !Number.isFinite(memberNum) || memberNum <= 0
      || typeof token !== 'string' || token.trim() === '') {
      setCurrentPoint(null);
      setPointError('로그인 정보를 확인할 수 없습니다. 다시 로그인해 주세요.');
      setPointLoading(false);
      return;
    }

    setPointLoading(true);
    setPointError('');
    try {
      const response = await axios.get<{ member_num: number; point: number | string }>(
        `${BACKEND_URL}/api/member/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const balance = Number(response.data.point);
      if (Number(response.data.member_num) !== memberNum || !Number.isFinite(balance)) {
        throw new Error('회원 포인트 응답을 확인할 수 없습니다.');
      }
      setCurrentPoint(balance);
    } catch (error) {
      console.error('현재 포인트 조회 실패:', error);
      setCurrentPoint(null);
      setPointError('현재 포인트를 불러오지 못했습니다. 다시 확인해 주세요.');
    } finally {
      setPointLoading(false);
    }
  }, [memberNum, token]);

  // 화면 진입·로그인 변경·결제 완료 후 잔액을 자동 조회해 상태와 UI를 갱신합니다.
  useEffect(() => {
    if (document.visibilityState === 'visible') void loadCurrentPoint();
  }, [loadCurrentPoint, pointRefreshKey]);

  // 다른 화면이나 결제창을 다녀와 다시 보일 때 최신 잔액을 조회하도록 useEffect를 재실행합니다.
  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        setPointRefreshKey((key) => key + 1);
      }
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, []);
  
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOrderSubmit = async () => {
    if (!selectedProduct || isLoading) return;
    if (memberNum == null || !Number.isFinite(memberNum) || memberNum <= 0) {
      alert('회원 정보를 확인할 수 없습니다. 다시 로그인해 주세요.');
      return;
    }

    try {
      setIsLoading(true);

      if (typeof token !== 'string' || token.trim() === '') return;

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
      const verifyResponse = await axios.post(`${BACKEND_URL}/api/point/pointAdd`, {
            paymentId: response.paymentId,
            payment: {
              porint: selectedProduct.porint,
              price: selectedProduct.price,
              memberNum,
            },
            description:"포인트 결제",
            point_type:"PAYMENT"
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });

      console.log(verifyResponse);

      if (verifyResponse.status >= 200 && verifyResponse.status < 300) {
        setPointRefreshKey((key) => key + 1);
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
        <div className={styles.balancePanel} aria-live="polite">
          <div>
            <span className={styles.balanceLabel}>현재 보유 포인트</span>
            {pointLoading ? (
              <strong className={styles.balanceStatus}>잔액을 확인하고 있어요…</strong>
            ) : pointError ? (
              <span className={styles.balanceError} role="alert">{pointError}</span>
            ) : (
              <strong className={styles.balanceAmount}>{currentPoint?.toLocaleString('ko-KR')}P</strong>
            )}
          </div>
        </div>
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
                aria-pressed={isSelected}
              >
                <span className={styles.productCopy}>
                  <span className={styles.productName}>{product.porint.toLocaleString('ko-KR')} point</span>
                  <span className={styles.productPrice}>{product.price.toLocaleString('ko-KR')}원</span>
                </span>
                <img className={styles.productPortrait} src={product.image} alt={product.portraitAlt} />
              </button>
            );
          })}
        </div>

        <div className={styles.orderSection}>
          <div className={styles.selectedInfo}>
            {selectedProduct ? (
              <>
                선택한 상품: <strong>{selectedProduct.porint.toLocaleString('ko-KR')}P</strong> (
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
