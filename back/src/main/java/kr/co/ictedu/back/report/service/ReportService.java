// 주용현

package kr.co.ictedu.back.report.service;

import kr.co.ictedu.back.notification.NotificationPublisher;
import kr.co.ictedu.back.notification.NotificationEvent.Category;
import kr.co.ictedu.back.member.dao.MemberDAO;

import java.util.List;
import java.util.Map;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.report.dao.ReportDao;
import kr.co.ictedu.back.report.dao.ReportReplyDao;
import kr.co.ictedu.back.report.vo.ReportVO;
import kr.co.ictedu.back.report.vo.ReportCountVO;

@Service
public class ReportService {
    @Autowired
    private NotificationPublisher notifications;
    @Autowired
    private MemberDAO members;
	private static final int REPORT_REASON_MAX_BYTES = 50;
	
	@Autowired
	private ReportDao reportDao;

	@Autowired
	private ReportReplyDao reportReplyDao;
	
	@Transactional
	public void add(ReportVO vo) {
		validateAdd(vo);
		reportDao.add(vo);
        for (Long managerNum : members.findManagerNums()) {
            notifications.send(managerNum, Category.REPORT,
                    "새 신고가 접수되었습니다", "신고 #" + vo.getNum() + "의 내용을 확인해주세요.",
                    "/admin/reportDetail/" + vo.getNum());
        }
	}

	private void validateAdd(ReportVO vo) {
		String type = vo.getType();
		Long targetNum = vo.getTarget_num();
		if (type == null || !List.of("report", "community", "user", "study", "document").contains(type)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 신고 유형을 선택해주세요.");
		}
		if ("report".equals(type)) {
			if (targetNum == null || targetNum != 0L) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "서비스 신고의 대상 번호는 0이어야 합니다.");
			}
		} else if (targetNum == null || targetNum <= 0L || targetNum > 9007199254740991L) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "신고 대상 번호는 올바른 양의 정수여야 합니다.");
		}
		validateContent(vo);
		if (!"report".equals(type) && reportDao.targetExists(type, targetNum) == 0) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "신고 대상을 찾을 수 없습니다.");
		}
	}

	private void validateContent(ReportVO vo) {
		if (vo.getCategory() == null || vo.getCategory().isBlank()
				|| vo.getCategory().trim().getBytes(StandardCharsets.UTF_8).length > REPORT_REASON_MAX_BYTES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "신고 사유를 50바이트 이내로 입력해주세요. 한글은 보통 한 글자당 3바이트입니다.");
		}
		if (vo.getContent() == null || vo.getContent().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상세 내용을 입력해주세요.");
		}
		vo.setCategory(vo.getCategory().trim());
		vo.setContent(vo.getContent().trim());
	}
	
	// 회원별 신고 목록
	public List<ReportVO> myList(Map<String, String> map) {
	    return reportDao.myList(map);
	}

	// 회원별 신고 개수
	public int myTotalCount(Map<String, String> map) {
	    return reportDao.myTotalCount(map);
	}
	
    public List<ReportVO> list(Map<String, String> map) {
        return reportDao.list(map);
    }

    public int totalCount(Map<String, String> map) {
        return reportDao.totalCount(map);
    }

    public Map<String, Object> statistics(String status) {
        if (status != null && !List.of("PENDING", "REVIEWING", "COMPLETED", "REJECTED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 신고 처리 상태를 선택해주세요.");
        }
        Map<String, Long> types = new java.util.TreeMap<>();
        Map<String, Long> reasons = new java.util.TreeMap<>();
        long total = 0;
        for (ReportCountVO group : reportDao.countGroups(status)) {
            String type = group.getType() == null ? "unknown" : group.getType();
            String reason = group.getCategory() == null || group.getCategory().isBlank()
                    ? "기타" : group.getCategory().trim();
            types.merge(type, group.getCount(), Long::sum);
            reasons.merge(reason, group.getCount(), Long::sum);
            total += group.getCount();
        }
        return Map.of("total", total,
                "typeCounts", types.entrySet().stream()
                        .map(entry -> Map.of("name", entry.getKey(), "count", entry.getValue())).toList(),
                "reasonCounts", reasons.entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                        .map(entry -> Map.of("name", entry.getKey(), "value", entry.getValue())).toList());
    }

    public ReportVO detail(Long num) {
        ReportVO report = reportDao.detail(num);
        if (report == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "신고를 찾을 수 없습니다.");
        }
        return report;
    }

    private ReportVO lockReport(Long num) {
        ReportVO report = reportDao.lockDetail(num);
        if (report == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "신고를 찾을 수 없습니다.");
        }
        return report;
    }

    public Map<String, Object> targetDetail(Long reportNum) {
        ReportVO report = detail(reportNum);
        if ("report".equals(report.getType())) return Map.of("available", true, "general", true);
        Map<String, Object> target = reportDao.targetDetail(report.getType(), report.getTarget_num());
        if (target == null) return Map.of("available", false);
        Map<String, Object> result = new java.util.HashMap<>(target);
        result.put("available", true);
        return result;
    }

    @Transactional
    public void del(Long num) {
        lockReport(num);
        reportReplyDao.deleteByReport(num);
        if (reportDao.del(num) != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "신고 삭제에 실패했습니다.");
        }
    }

    @Transactional
    public int update(ReportVO vo) {
        ReportVO report = lockReport(vo.getNum());
        if (!"PENDING".equals(report.getStatus()) || reportReplyDao.countByReport(report.getNum()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "접수 상태이며 답변이 없는 신고만 수정할 수 있습니다.");
        }
        validateContent(vo);
        vo.setType(report.getType());
        vo.setTarget_num(report.getTarget_num());
        if (reportDao.update(vo) != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "신고 수정에 실패했습니다.");
        }
        return 1;
    }

    @Transactional
    public int updateStatus(ReportVO vo) {
        ReportVO report = lockReport(vo.getNum());
        validateTransition(report.getStatus(), vo.getStatus());
        if (report.getStatus().equals(vo.getStatus())) {
            return 1;
        }
        if (reportDao.updateStatus(vo) != 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "신고 상태 변경에 실패했습니다.");
        }
        notifications.send(report.getMember_num(), Category.REPORT,
                "신고 처리 상태가 변경되었습니다", "신고 #" + report.getNum() + "의 상태: " + statusLabel(vo.getStatus()),
                "/report/replyDetail/" + report.getNum());
        return 1;
    }

    private String statusLabel(String status) {
        return switch (status) {
            case "REVIEWING" -> "검토 중";
            case "COMPLETED" -> "처리 완료";
            case "REJECTED" -> "반려";
            default -> "접수";
        };
    }

    public void validateTransition(String current, String next) {
        if (next == null || !List.of("PENDING", "REVIEWING", "COMPLETED", "REJECTED").contains(next)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 신고 처리 상태를 선택해주세요.");
        }
        if (next.equals(current)) {
            return;
        }
        if ("PENDING".equals(current)
                && List.of("REVIEWING", "COMPLETED", "REJECTED").contains(next)) {
            return;
        }
        if ("REVIEWING".equals(current) && List.of("COMPLETED", "REJECTED").contains(next)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "현재 상태에서 해당 상태로 변경할 수 없습니다.");
    }
}
