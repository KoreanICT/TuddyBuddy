package kr.co.ictedu.back.notice.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.notice.vo.NoticeVO;

@Mapper
public interface NoticeDao {
	void add(NoticeVO vo);
	List<NoticeVO> list(Map<String, String> map);
	int totalCount(Map<String, String> map);
	void hit(int num);
	NoticeVO detail(Long num);
	void del(Long num);
	int update(NoticeVO vo);
}
