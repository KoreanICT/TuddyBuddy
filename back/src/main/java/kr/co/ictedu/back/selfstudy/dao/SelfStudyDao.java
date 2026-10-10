package kr.co.ictedu.back.selfstudy.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@Mapper
public interface SelfStudyDao {

	SubjectVO selectSubject(@Param("subjectId") Long subjectId);
    List<CategoryVO> selectCategories();
    
    List<SubjectVO> selectSubjects(
            @Param("categoryId") Long categoryId);


    // Quiz Session
    int insertQuizSession(QuizSessionVO vo);

    List<QuizSessionVO> selectQuizSessions(
            @Param("memberNum") Long memberNum);

    QuizSessionVO selectQuizSession(
            @Param("quizSessionId") Long quizSessionId);


    // Quiz
    int insertQuiz(QuizVO vo);

    List<QuizVO> selectQuizzes(
            @Param("quizSessionId") Long quizSessionId);

    QuizVO selectQuiz(
            @Param("quizId") Long quizId);


    // Result
    int insertSelfStudyResult(SelfStudyResultVO vo);

    SelfStudyResultVO selectResult(
            @Param("resultId") Long resultId);

    List<SelfStudyResultVO> selectResults(
            @Param("memberNum") Long memberNum);

    
    // Response
    int insertQuizResponse(QuizResponseVO vo);

    List<QuizResponseVO> selectQuizResponses(
            @Param("resultId") Long resultId);


    // Delete
    int deleteQuizResponsesBySession(
            @Param("quizSessionId") Long quizSessionId);

    int deleteResultsBySession(
            @Param("quizSessionId") Long quizSessionId);

    int deleteQuizzesBySession(
            @Param("quizSessionId") Long quizSessionId);

    int deleteQuizSession(
            @Param("quizSessionId") Long quizSessionId);
}