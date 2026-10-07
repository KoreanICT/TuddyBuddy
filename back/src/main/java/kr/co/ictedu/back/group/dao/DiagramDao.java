package kr.co.ictedu.back.group.dao;

import org.apache.ibatis.annotations.Mapper;

import kr.co.ictedu.back.group.vo.DiagramVO;

@Mapper
public interface DiagramDao {
	public void merge(DiagramVO diagramvo);
	public DiagramVO get(Long groupnum);
	public void put(DiagramVO diagramvo);
	public void del(Long groupnum);
}
