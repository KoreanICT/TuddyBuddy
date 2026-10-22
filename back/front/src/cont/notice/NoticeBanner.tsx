import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, Pause, Play } from 'lucide-react';
import styles from './noticeBanner.module.css';

interface NoticeBannerProps {
  notices: { num: number; title: string; created_date?: string }[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}

const LazyNoticeBanner = React.lazy(async () => {
  const [{ Swiper, SwiperSlide }, { A11y, Autoplay }] = await Promise.all([
    import('swiper/react'),
    import('swiper/modules'),
  ]);
  type SwiperInstance = Parameters<NonNullable<React.ComponentProps<typeof Swiper>['onSwiper']>>[0];

  const NoticeBannerContent: React.FC<NoticeBannerProps> = ({ notices, loading, error, onRetry }) => {
    const swiperRef = useRef<SwiperInstance | null>(null);
    const focusWithinRef = useRef(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const multiple = notices.length > 1;

    useEffect(() => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReducedMotion(media.matches);
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
      const swiper = swiperRef.current;
      if (!swiper || swiper.destroyed) return;
      if (paused || reducedMotion || !multiple || focusWithinRef.current) swiper.autoplay.stop();
      else swiper.autoplay.start();
    }, [paused, reducedMotion, multiple, loading, error]);

    return (
      <section className={styles.banner} aria-label="최신 공지 슬라이드"
        onFocusCapture={() => { focusWithinRef.current = true; swiperRef.current?.autoplay.stop(); }}
        onBlurCapture={event => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          focusWithinRef.current = false;
          if (multiple && !paused && !reducedMotion) swiperRef.current?.autoplay.start();
        }}>
        <header className={styles.header}>
          <span className={styles.label}><Megaphone size={18} aria-hidden="true" /> 최신 공지</span>
          <Link className={styles.more} to="/notice">전체 보기 <ArrowRight size={15} aria-hidden="true" /></Link>
        </header>
        {loading ? <p className={styles.message} role="status">공지사항을 불러오는 중입니다.</p>
          : error ? <div className={styles.message} role="alert"><span>{error}</span><button type="button" onClick={onRetry}>다시 시도</button></div>
            : notices.length === 0 ? <p className={styles.message}>등록된 공지사항이 없습니다.</p>
              : <>
                <Swiper key={notices.map(notice => notice.num).join('-')} className={styles.slider}
                  modules={[A11y, Autoplay]} slidesPerView={1} rewind={multiple} nested
                  speed={reducedMotion ? 0 : 450}
                  autoplay={multiple && !reducedMotion ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
                  a11y={{ enabled: true, containerRoleDescriptionMessage: '공지 슬라이드', slideLabelMessage: '{{index}} / {{slidesLength}}' }}
                  onSwiper={swiper => {
                    swiperRef.current = swiper;
                    setActiveIndex(0);
                    if (paused || reducedMotion || focusWithinRef.current) swiper.autoplay.stop();
                  }}
                  onBeforeDestroy={() => { swiperRef.current = null; }}
                  onSlideChange={swiper => setActiveIndex(swiper.realIndex)}>
                  {notices.map((notice, index) => <SwiperSlide key={notice.num}>
                    <Link className={styles.noticeLink} to={`/notice/${notice.num}`} tabIndex={activeIndex === index ? 0 : -1}>
                      <strong>{notice.title}</strong>
                      <span>{notice.created_date?.slice(0, 10) || '공지사항'}</span>
                    </Link>
                  </SwiperSlide>)}
                </Swiper>
                {multiple && <div className={styles.controls}>
                  <button type="button" aria-label="이전 공지" onClick={() => swiperRef.current?.slidePrev()}><ChevronLeft size={17} /></button>
                  <span className={styles.counter}>{activeIndex + 1} / {notices.length}</span>
                  <button type="button" aria-label="다음 공지" onClick={() => swiperRef.current?.slideNext()}><ChevronRight size={17} /></button>
                  {!reducedMotion && <button type="button" aria-label={paused ? '공지 자동 넘김 시작' : '공지 자동 넘김 정지'}
                    aria-pressed={paused} onClick={() => setPaused(value => !value)}>
                    {paused ? <Play size={15} /> : <Pause size={15} />}
                  </button>}
                </div>}
              </>}
      </section>
    );
  };

  return { default: NoticeBannerContent };
});

const NoticeBanner: React.FC<NoticeBannerProps> = props => (
  <React.Suspense fallback={<p className={styles.message} role="status">공지사항을 불러오는 중입니다.</p>}>
    <LazyNoticeBanner {...props} />
  </React.Suspense>
);

export default NoticeBanner;
