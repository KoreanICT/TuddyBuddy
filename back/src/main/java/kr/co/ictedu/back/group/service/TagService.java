package kr.co.ictedu.back.group.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.group.dao.TagDao;
import kr.co.ictedu.back.group.vo.TagVO;

@Service
public class TagService {
	
	@Autowired
	private TagDao dao;
	
	public List<TagVO> searchTags(String keyword) {
		List<TagVO> list = dao.searchTags(keyword);
		return list;
	}
}
