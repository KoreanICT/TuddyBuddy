//작성자 : 오진석
package kr.co.ictedu.back.group.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.group.dao.MemoDao;
import kr.co.ictedu.back.group.dto.MemoListDTO;
import kr.co.ictedu.back.group.vo.MemoVO;

@Service
public class MemoService {
	@Autowired
	private MemoDao dao;
	
	@Transactional
	public MemoListDTO addMemo(MemoVO memovo, Long memberNum) {
		dao.addMemo(memovo);
		return dao.getMemoById(memovo.getMemo_num(), memberNum);
	}
	
	public List<MemoListDTO> getMemos(Long groupNum, Long memberNum) {
		return dao.getMemos(groupNum, memberNum);
	}
	
	@Transactional
	public void patchMemo(Long memoNum, MemoVO memovo) {
		dao.patchMemo(memoNum, memovo);
	}
	
	@Transactional
	public void deleteMemo(Long memoNum) {
		dao.deleteMemo(memoNum);
	}
}
