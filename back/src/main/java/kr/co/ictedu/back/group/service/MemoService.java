//작성자 : 오진석
package kr.co.ictedu.back.group.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.ictedu.back.group.dao.MemoDao;
import kr.co.ictedu.back.group.vo.MemoVO;

@Service
public class MemoService {
	@Autowired
	private MemoDao dao;
	
	@Transactional
	public void addMemo(MemoVO memovo) {
		dao.addMemo(memovo);
	}
}
