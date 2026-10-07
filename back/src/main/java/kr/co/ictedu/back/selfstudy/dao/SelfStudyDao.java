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

    List<CategoryVO> getCategories();

    List<SubjectVO> getSubjects(@Param("categoryId") Long categoryId);

    int insertQuizSession(QuizSessionVO vo);

    int insertQuiz(QuizVO vo);

    int insertQuizResponse(QuizResponseVO vo);

    int insertResult(SelfStudyResultVO vo);

    List<QuizSessionVO> getSessions();

    QuizSessionVO getSession(@Param("quizSessionId") Long quizSessionId);

    List<QuizVO> getQuizzes(@Param("quizSessionId") Long quizSessionId);

    List<QuizResponseVO> getResponses(
            @Param("selfstudyResultsId") Long selfstudyResultsId);

    List<SelfStudyResultVO> getResults();

    int updateQuizSession(QuizSessionVO vo);

    int updateQuizResponse(QuizResponseVO vo);

    int deleteQuizSession(@Param("quizSessionId") Long quizSessionId);

    SelfStudyResultVO getResult(@Param("resultId") Long resultId);
}