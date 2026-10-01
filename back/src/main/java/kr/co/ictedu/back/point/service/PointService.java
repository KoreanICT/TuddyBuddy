package kr.co.ictedu.back.point.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.ictedu.back.point.dao.PointDao;

@Service
public class PointService {
	
	@Autowired
	private PointDao dao;
	
	
}
