package kr.co.ictedu.back.selfstudy.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.QuizResponseVO;
import kr.co.ictedu.back.selfstudy.vo.QuizSessionVO;
import kr.co.ictedu.back.selfstudy.vo.QuizVO;
import kr.co.ictedu.back.selfstudy.vo.SelfStudyResultVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;

@Service
public class SelfStudyService {
	
    @Autowired
    private SelfStudyDao selfStudyDao;

    public List<CategoryVO> getCategories() {
        return selfStudyDao.getCategories();
    }

    public List<SubjectVO> getSubjects(Long categoryId) {
        return selfStudyDao.getSubjects(categoryId);
    }

    public List<QuizSessionVO> getSessions() {
        return selfStudyDao.getSessions();
    }

    public QuizSessionVO getSession(Long quizSessionId) {
        return selfStudyDao.getSession(quizSessionId);
    }

	public List<QuizVO> getQuizzes(Long quizSessionId) {
		return selfStudyDao.getQuizzes(quizSessionId);
	}
	public List<SelfStudyResultVO> getResults() {
	    return selfStudyDao.getResults();
	}
	public SelfStudyResultVO getResult(Long resultId) {
	    return selfStudyDao.getResult(resultId);
	}
	public void deleteSession(Long quizSessionId) {
	    selfStudyDao.deleteQuizSession(quizSessionId);
	}
	public List<QuizResponseVO> getResponses(Long resultId) {
	    return selfStudyDao.getResponses(resultId);
	}
	public void insertResult(SelfStudyResultVO vo) {
	    selfStudyDao.insertResult(vo);
	}
	public void insertQuizResponse(QuizResponseVO vo) {
	    selfStudyDao.insertQuizResponse(vo);
	}
	public void insertQuizSession(QuizSessionVO vo) {
	    selfStudyDao.insertQuizSession(vo);
	}

	public void insertQuiz(QuizVO vo) {
	    selfStudyDao.insertQuiz(vo);
	}
	
}

