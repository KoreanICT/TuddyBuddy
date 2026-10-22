// 허승표

package kr.co.ictedu.back.activity.dto;

import java.util.List;

import kr.co.ictedu.back.activity.vo.ActivityLogVO;
import kr.co.ictedu.back.common.vo.PageVO;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActivityLogListResponse {

	private List<ActivityLogVO> logs;
	private PageVO page;
}
