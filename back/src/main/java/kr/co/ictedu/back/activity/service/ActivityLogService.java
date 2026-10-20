// 허승표

package kr.co.ictedu.back.activity.service;

import java.time.ZoneOffset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.activity.dao.ActivityLogDAO;
import kr.co.ictedu.back.activity.vo.ActivityLogVO;

@Service
public class ActivityLogService {

	private static final Logger log = LoggerFactory.getLogger(ActivityLogService.class);
	
	@Autowired
	private ActivityLogDAO activityLogDAO;
	
	// 별도 스레드에서 로그 저장
	@Async("activityLogExecutor")
	public void save(ActivityLogVO vo) {
		try {
			validate(vo);
			
			ActivityLogVO saved = new ActivityLogVO();
			
			saved.setMember_num(vo.getMember_num());
			
			saved.setActivity_occurred_at(
					vo.getActivity_occurred_at()
						.withOffsetSameInstant(ZoneOffset.UTC)
			);
			
			saved.setActivity_category(
					vo.getActivity_category()
			);
			
			saved.setActivity_action(
					vo.getActivity_action()
			);
			
			saved.setActivity_result(
					vo.getActivity_result()
			);
			
			int count = activityLogDAO.insertActivityLog(saved);
			
			if (count != 1) {
				throw new IllegalStateException(
						"활동 로그 저장에 실패했습니다."
				);
			}
			
		} catch (Exception e) {
			// 로그 실패가 원래 업무에 영향을 주지 않도록 처리
			// 개인정보와 DB 예외 메시지는 출력하지 않음
			log.error(
					"활동 로그 저장 실패. errorType={}",
					e.getClass().getSimpleName()
			);
		}
	}

	private void validate(ActivityLogVO vo) {
		if (vo == null
				|| vo.getMember_num() == null
				|| vo.getMember_num() <= 0
				|| vo.getActivity_occurred_at() == null) {
			throw new IllegalArgumentException(
					"회원 번호와 발생 시각이 필요합니다."
			);
		}
		
		if (!validCode(vo.getActivity_category(), 40)
				|| !validCode(vo.getActivity_action(), 60)) {
			throw new IllegalArgumentException(
					"활동 코드가 올바르지 않습니다."
			);
		}
		
		String result = vo.getActivity_result();
		
		if (!"SUCCESS".equals(result)
				&& !"FAILURE".equals(result)) {
			throw new IllegalArgumentException(
					"활동 결과가 올바르지 않습니다."
			);
		}
	}

	private boolean validCode(String value, int maxLength) {
		return value != null
				&& value.length() <= maxLength
				&& value.matches("[A-Z][A-Z0-9_]*");
	}
}
