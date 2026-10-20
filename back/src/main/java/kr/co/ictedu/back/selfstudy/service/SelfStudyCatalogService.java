package kr.co.ictedu.back.selfstudy.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.selfstudy.dao.SelfStudyDao;
import kr.co.ictedu.back.selfstudy.vo.CategoryVO;
import kr.co.ictedu.back.selfstudy.vo.SubjectVO;
//카테고리·과목 및 AI 분류 목록 조회
@Service
@Transactional(readOnly = true)
public class SelfStudyCatalogService {
    private final SelfStudyDao selfStudyDao;

    public SelfStudyCatalogService(SelfStudyDao selfStudyDao) {
        this.selfStudyDao = selfStudyDao;
    }

    public List<CategoryVO> getCategories() {
        return selfStudyDao.selectCategories();
    }

    public List<SubjectVO> getSubjects(Long categoryId) {
        if (categoryId == null) {
            throw new IllegalArgumentException("카테고리 정보가 없습니다.");
        }
        return selfStudyDao.selectSubjects(categoryId);
    }

    public List<Map<String, Object>> getAiCatalog() {
        return selfStudyDao.selectCategories().stream()
                .map(category -> Map.<String, Object>of(
                        "categoryId", category.getCategory_id(),
                        "categoryName", category.getCategory_name(),
                        "subjects", selfStudyDao.selectSubjects(category.getCategory_id()).stream()
                                .map(subject -> Map.of(
                                        "subjectId", subject.getSubject_id(),
                                        "subjectName", subject.getSubject_name()))
                                .toList()))
                .toList();
    }
}