import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import styles from './notFound.module.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => {
    const index = window.history.state?.idx;
    if (typeof index === 'number' && index > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className={styles.card}>
        <span className={styles.code} aria-hidden="true">404</span>
        <h1 id="not-found-title">페이지를 찾을 수 없습니다.</h1>
        <p>주소가 잘못되었거나 더 이상 제공되지 않는 페이지입니다.<br />홈으로 이동하거나 이전 페이지로 돌아가 주세요.</p>
        <div className={styles.actions}>
          <Link to="/" replace className={styles.homeButton}>
            <Home size={18} aria-hidden="true" /> 홈으로
          </Link>
          <button type="button" onClick={goBack} className={styles.backButton}>
            <ArrowLeft size={18} aria-hidden="true" /> 이전 페이지
          </button>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
