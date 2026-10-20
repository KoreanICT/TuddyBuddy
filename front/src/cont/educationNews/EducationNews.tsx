import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Newspaper, RotateCw, Search } from 'lucide-react';
import { BACKEND_URL } from '../../login/authHttp';
import styles from './educationNews.module.css';

interface EducationArticle {
  url: string;
  title: string;
  publishedAt: string;
  domain: string;
}

const PAGE_SIZE = 5;

const timeRanges = [
  { value: '1d', label: '오늘' },
  { value: '7d', label: '최근 7일' },
  { value: '30d', label: '최근 30일' },
];

const parseNewsDate = (value: string): Date | null => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  const date = match
    ? new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const EducationNews: React.FC = () => {
  const [articles, setArticles] = useState<EducationArticle[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(`${BACKEND_URL}/api/education-news?range=${encodeURIComponent(timeRange)}`, {
      signal: controller.signal,
      credentials: 'omit',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`교육 뉴스를 불러오지 못했습니다. (${response.status})`);
        return response.json() as Promise<EducationArticle[]>;
      })
      .then((loadedArticles) => {
        const seen = new Set<string>();
        setArticles(loadedArticles.filter((article) => {
          if (!article.url?.startsWith('https://') || !article.title || seen.has(article.url)) return false;
          seen.add(article.url);
          return true;
        }));
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        setArticles([]);
        setError(requestError instanceof Error ? requestError.message : '교육 뉴스를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [timeRange, revision]);

  const filteredArticles = useMemo(() => {
    const keyword = searchText.trim().toLocaleLowerCase('ko-KR');
    if (!keyword) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.domain}`.toLocaleLowerCase('ko-KR').includes(keyword)
    );
  }, [articles, searchText]);
  const totalPages = Math.ceil(filteredArticles.length / PAGE_SIZE);
  const pageArticles = filteredArticles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const formatDate = (value: string) => {
    const date = parseNewsDate(value);
    return date
      ? new Intl.DateTimeFormat('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      : '날짜 정보 없음';
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>TUDDYBUDDY · LEARNING NEWS</span>
          <div className={styles.headingRow}>
            <div>
              <h1 className={styles.title}>교육 뉴스</h1>
              <p className={styles.description}>
                국내 교육 현장의 최신 기사와 소식을 확인해보세요.
              </p>
            </div>
            <div className={styles.headerIcon} aria-hidden="true">
              <Newspaper size={27} />
            </div>
          </div>
        </header>

        <section className={styles.toolbar} aria-label="뉴스 검색 및 기간 설정">
          <label className={styles.searchBox}>
            <Search size={18} aria-hidden="true" />
            <span className={styles.visuallyHidden}>기사 제목 또는 언론사 검색</span>
            <input
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="기사 제목이나 언론사 검색"
            />
          </label>
          <div className={styles.toolbarActions}>
            <div className={styles.rangeGroup} aria-label="조회 기간">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  className={timeRange === range.value ? styles.rangeActive : styles.rangeButton}
                  aria-pressed={timeRange === range.value}
                  onClick={() => {
                    setTimeRange(range.value);
                    setCurrentPage(1);
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={() => {
                setCurrentPage(1);
                setRevision((value) => value + 1);
              }}
              disabled={loading}
              aria-label="뉴스 새로고침"
            >
              <RotateCw size={17} aria-hidden="true" />
              새로고침
            </button>
          </div>
        </section>

        <section className={styles.results} aria-labelledby="news-results-title" aria-busy={loading}>
          <div className={styles.resultsHeading}>
            <div>
              <h2 id="news-results-title">최신 기사</h2>
              <p>기사 제목과 출처를 보여드려요. 기사를 누르면 원문으로 이동합니다.</p>
            </div>
            {!loading && !error && (
              <span className={styles.resultCount}>{filteredArticles.length}건</span>
            )}
          </div>

          {loading ? (
            <div className={styles.message} role="status">
              <span className={styles.spinner} aria-hidden="true" />
              최신 교육 기사를 찾고 있습니다...
            </div>
          ) : error ? (
            <div className={styles.message} role="alert">
              <p>{error}</p>
              <button type="button" className={styles.retryButton} onClick={() => {
                setCurrentPage(1);
                setRevision((value) => value + 1);
              }}>
                다시 불러오기
              </button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className={styles.message}>
              {searchText ? '검색 결과가 없습니다.' : '선택한 기간에 표시할 기사가 없습니다.'}
            </div>
          ) : (
            <div className={styles.articleList}>
              {pageArticles.map((article) => (
                <article key={article.url} className={styles.articleCard}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.articleLink}>
                    <div className={styles.articleMeta}>
                      <span className={styles.source}>{article.domain}</span>
                      <time dateTime={parseNewsDate(article.publishedAt)?.toISOString()}>
                        {formatDate(article.publishedAt)}
                      </time>
                    </div>
                    <h3>{article.title}</h3>
                    <span className={styles.readMore}>
                      원문 보기 <ExternalLink size={15} aria-hidden="true" />
                    </span>
                  </a>
                </article>
              ))}
            </div>
          )}
          {!loading && !error && totalPages > 1 && (
            <nav className={styles.pagination} aria-label="교육 뉴스 페이지 이동">
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                이전
              </button>
              <span className={styles.pageIndicator} aria-live="polite">
                {currentPage} / {totalPages} 페이지
              </span>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
              >
                다음
              </button>
            </nav>
          )}
        </section>

        <footer className={styles.sourceNote}>
          뉴스 검색: Google 뉴스 RSS · 국내 한국어 교육 관련 기사
        </footer>
      </div>
    </main>
  );
};

export default EducationNews;
