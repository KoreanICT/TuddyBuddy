package kr.co.ictedu.back.selfstudy.service;

import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
//기록 조회·소유권 확인·세션 삭제
@Service
@Transactional(readOnly = true)
public class SelfStudyHistoryService {
    private final SelfStudyDao selfStudyDao;

    public SelfStudyHistoryService(SelfStudyDao selfStudyDao) {
        this.selfStudyDao = selfStudyDao;
    }
    public void requireSessionOwner(
            Long sessionId,
            Long memberNum) 
    {

        if (!Objects.equals(
                getSession(sessionId).getMember_num(),
                memberNum
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "본인의 학습 세션만 사용할 수 있습니다."
            );
        }
    }

    // =========================================================
    // 3. 학습 결과 소유자 검증
    // =========================================================

    public void requireResultOwner(
            Long resultId,
            Long memberNum
    ) {

        if (!Objects.equals(
                getResult(resultId).getMember_num(),
                memberNum
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "본인의 학습 결과만 사용할 수 있습니다."
            );
        }
    }

    public List<QuizSessionVO> getSessions(
            Long memberNum
    ) {

        if (memberNum == null) {

            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        List<QuizSessionVO> sessions = selfStudyDao.selectQuizSessions(memberNum);
        return sessions == null ? List.of() : sessions;
    }

    // =========================================================
    // 9. 학습 세션 상세
    // =========================================================

    public QuizSessionVO getSession(
            Long quizSessionId
    ) {

        if (quizSessionId == null) {

            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        QuizSessionVO session =
                selfStudyDao.selectQuizSession(quizSessionId);

        if (session == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 학습 세션입니다."
            );
        }

        return session;
    }

    // =========================================================
    // 10. 학습 세션의 문제 목록
    // =========================================================

    public List<QuizVO> getQuizzes(
            Long quizSessionId
    ) {

        if (quizSessionId == null) {

            throw new IllegalArgumentException(
                    "퀴즈 세션 정보가 없습니다."
            );
        }

        return selfStudyDao.selectQuizzes(quizSessionId);
    }

    public List<SelfStudyResultVO> getResults(
            Long memberNum
    ) {

        if (memberNum == null) {

            throw new IllegalArgumentException(
                    "회원 정보가 없습니다."
            );
        }

        List<SelfStudyResultVO> results = selfStudyDao.selectResults(memberNum);
        return results == null ? List.of() : results;
    }

    // =========================================================
    // 13. 학습 결과 상세
    // =========================================================

    public SelfStudyResultVO getResult(
            Long resultId
    ) {

        if (resultId == null) {

            throw new IllegalArgumentException(
                    "결과 정보가 없습니다."
            );
        }

        SelfStudyResultVO result =
                selfStudyDao.selectResult(resultId);

        if (result == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 결과입니다."
            );
        }

        return result;
    }

    // =========================================================
    // 14. 학습 결과별 답안 조회
    // =========================================================

    public List<QuizResponseVO> getResponses(
            Long resultId
    ) {

        if (resultId == null) {

            throw new IllegalArgumentException(
                    "결과 정보가 없습니다."
            );
        }

        return selfStudyDao.selectQuizResponses(resultId);
    }

    @Transactional
    public void deleteSession(
            Long quizSessionId
    ) {

        QuizSessionVO session =
                selfStudyDao.selectQuizSession(quizSessionId);

        if (session == null) {

            throw new IllegalArgumentException(
                    "존재하지 않는 학습 세션입니다."
            );
        }

        // 1. 사용자 답안 삭제
        selfStudyDao.deleteQuizResponsesBySession(
                quizSessionId
        );

        // 2. 학습 결과 삭제
        selfStudyDao.deleteResultsBySession(
                quizSessionId
        );

        // 3. 문제 삭제
        selfStudyDao.deleteQuizzesBySession(
                quizSessionId
        );

        // 4. 세션 삭제
        int deleteResult =
                selfStudyDao.deleteQuizSession(
                        quizSessionId
                );

        if (deleteResult != 1) {

            throw new IllegalStateException(
                    "학습 세션 삭제에 실패했습니다."
            );
        }
    }
}
