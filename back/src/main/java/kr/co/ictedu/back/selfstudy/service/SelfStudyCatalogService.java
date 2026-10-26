package kr.co.ictedu.back.selfstudy.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
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
        Map<Long, Map<String, Object>> catalogByCategory = new LinkedHashMap<>();
        for (Map<String, Object> row : selfStudyDao.selectAiCatalogRows()) {
            Long categoryId = ((Number) row.get("categoryId")).longValue();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subjects = (List<Map<String, Object>>) catalogByCategory
                    .computeIfAbsent(categoryId, id -> {
                        Map<String, Object> category = new LinkedHashMap<>();
                        category.put("categoryId", id);
                        category.put("categoryName", row.get("categoryName"));
                        category.put("subjects", new ArrayList<Map<String, Object>>());
                        return category;
                    }).get("subjects");

            if (row.get("subjectId") != null) {
                Map<String, Object> subject = new LinkedHashMap<>();
                subject.put("subjectId", ((Number) row.get("subjectId")).longValue());
                subject.put("subjectName", row.get("subjectName"));
                subjects.add(subject);
            }
        }
        return new ArrayList<>(catalogByCategory.values());
    }
}
