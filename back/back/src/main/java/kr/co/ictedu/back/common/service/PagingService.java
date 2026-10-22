package kr.co.ictedu.back.common.service;

import org.springframework.stereotype.Component;

import kr.co.ictedu.back.common.vo.PageVO;


@Component
public class PagingService {

	public PageVO makePage(int totalCnt, String cPage) {

		PageVO pageVO = new PageVO();

		pageVO.setTotalRecord(totalCnt);

		int nowPage = 1;
		if (cPage != null && !cPage.isBlank()) {
			nowPage = Integer.parseInt(cPage);
		}
		pageVO.setNowPage(nowPage);

		int totalPage = (int) Math.ceil(totalCnt / (double) pageVO.getNumPerPage());
		pageVO.setTotalPage(totalPage);

		int totalBlock = (int) Math.ceil(totalPage / (double) pageVO.getPagePerBlock());
		pageVO.setTotalBlock(totalBlock);

		int begin = (nowPage - 1) * pageVO.getNumPerPage() + 1;
		int end = begin + pageVO.getNumPerPage() - 1;

		pageVO.setBeginPerPage(begin);
		pageVO.setEndPerPage(end);

		int startPage = ((nowPage - 1) / pageVO.getPagePerBlock()) * pageVO.getPagePerBlock() + 1;
		int endPage = startPage + pageVO.getPagePerBlock() - 1;

		if (endPage > totalPage) {
			endPage = totalPage;
		}

		pageVO.setStartPage(startPage);
		pageVO.setEndPage(endPage);

		return pageVO;
	}
}

