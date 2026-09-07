import React, { useState } from 'react';
import styles from './productSelector.module.css';

// 1. 타입 인터페이스 정의
export interface Product {
  id: number;
  name: string;
  price: number;
}

// 2. 더미 데이터 상수 선언
export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: '상품 1', price: 1000 },
  { id: 2, name: '상품 2', price: 2000 },
  { id: 3, name: '상품 3', price: 3000 },
  { id: 4, name: '상품 4', price: 4000 },
  { id: 5, name: '상품 5', price: 5000 },
  { id: 6, name: '상품 6', price: 6000 },
  { id: 7, name: '상품 7', price: 7000 },
  { id: 8, name: '상품 8', price: 8000 },
];

interface ProductSelectorProps {
  onSelectOrder?: (selectedProduct: Product) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ onSelectOrder }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOrderSubmit = () => {
    if (!selectedProduct) return;

    if (onSelectOrder) {
      onSelectOrder(selectedProduct);
    } else {
      console.log('주문 요청 상품 데이터:', selectedProduct);
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
                <span className={styles.productName}>{product.name}</span>
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
                선택한 상품: <strong>{selectedProduct.name}</strong> (
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