//작성자 : 오진석
package kr.co.ictedu.back.group.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import kr.co.ictedu.back.group.dao.GroupDetailDao;
import kr.co.ictedu.back.group.dto.GroupDetailHeaderDTO;
import kr.co.ictedu.back.group.dto.GroupUpdateDTO;
import kr.co.ictedu.back.group.dto.MemberDataDTO;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Service
public class GroupDetailService {
	@Value("${file.upload.group-thumbnail}")
	private String uploadPath;

	@Autowired
	private GroupDetailDao dao;
	
	public GroupDetailHeaderDTO getHeader(Long memberNum, Long groupNum) {
		GroupDetailHeaderDTO groupdetailheaderdto = dao.getHeader(memberNum, groupNum);
		return groupdetailheaderdto;
	}
	
	public GroupUpdateDTO getUpdateData(Long groupNum) {
		GroupVO group = dao.getDetail(groupNum);
		
		if(group == null) {
			throw new IllegalArgumentException("존재하지 않는 스터디룸입니다.");
		}
		
		List<TagVO> tags = dao.getDetailTags(groupNum);
		
		GroupUpdateDTO dto = new GroupUpdateDTO();
		
		dto.setGroup_title(group.getGroup_title());
		dto.setGroup_desc(group.getGroup_desc());
		dto.setGroup_thumbnail(group.getGroup_thumbnail());
		dto.setGroup_invitecode(group.getGroup_invitecode());
		dto.setTags(tags);
		
		return dto;
	}
	@Transactional
	public void updateGroup(Long groupNum, GroupUpdateDTO request, MultipartFile thumbnail) {
		if (thumbnail != null && !thumbnail.isEmpty()) {
			String thumbnailName = saveThumbnail(thumbnail);
			request.setGroup_thumbnail(thumbnailName);
		}
		dao.updateGroup(groupNum, request);
		dao.deleteGroupTags(groupNum);
		if (request.getTags() != null) {
			for (TagVO tag: request.getTags()) {
				TagVO targetTag = tag;
				if (tag.getTag_num() == null) {
					TagVO existing = dao.findTagByName(tag.getTag_name());
					if (existing != null) {
						targetTag = existing;
					} else {
						dao.addTag(tag);
						targetTag = tag;
					}
				}
				dao.addGroupTag(groupNum, targetTag.getTag_num());
			}
		}
	}
	public Map<String,Object> getMembers(Long groupNum, Long memberNum) {
		boolean isMeLeader = false;
		
		int isMeLeaderNum = dao.getIsMeLeader(groupNum, memberNum);
		if (isMeLeaderNum == 1) {
			isMeLeader = true;
		}
		
		List<MemberDataDTO> list = dao.getMembers(groupNum);
		Map<String, Object> memberMap = new HashMap<>();
		memberMap.put("isMeLeader", isMeLeader);
		memberMap.put("members", list);
		
		return memberMap;
	}
	
	@Transactional
	public void kickMember(Long groupNum, Long currentMemberNum, Long targetMemberNum) {
		int result = dao.kickMember(groupNum, currentMemberNum, targetMemberNum);
		if (result == 0) {
			throw new IllegalStateException("대상을 강퇴할 권한이 없습니다.");
		}
	}
	
	@Transactional
	public void transferLeader(Long groupNum, Long currentMemberNum, Long targetMemberNum) {
		int removed = dao.removeLeader(groupNum, currentMemberNum);
		if (removed == 0) {
			throw new IllegalStateException("방장 권한이 없습니다.");
		}
		int granted = dao.grantLeader(groupNum, targetMemberNum);
		if (granted == 0) {
			throw new IllegalStateException("위임 대상이 유효하지 않습니다.");
		}
	}
	
	private String saveThumbnail(MultipartFile thumbnail) {
		try {
			// 업로드 디렉토리
			Path uploadDir = Paths.get(uploadPath);

			// 폴더가 없다면 생성
			Files.createDirectories(uploadDir);

			String originalFilename = thumbnail.getOriginalFilename();

			String extension = "";
			if (originalFilename != null && originalFilename.contains(".")) {
				extension = originalFilename.substring(originalFilename.lastIndexOf("."));
			}
			// 파일명 중복 방지
			String savedFilename = UUID.randomUUID().toString() + extension;
			Path savePath = uploadDir.resolve(savedFilename);

			// 실제 파일 저장
			thumbnail.transferTo(savePath.toFile());

			/*
			 * DB에는 실제 물리 경로가 아니라 웹에서 접근할 경로를 저장
			 */
			return savedFilename;
		} catch (Exception e) {
			throw new RuntimeException("썸네일 저장에 실패했습니다.", e);
		}
	}
	
	public void groupQuit(Long groupNum, Long memberNum) {
		dao.groupQuit(groupNum, memberNum);
	}
	
	public void deleteGroup(Long groupNum, Long memberNum) {
		int isMeLeader = dao.getIsMeLeader(groupNum, memberNum);
		if (isMeLeader == 1) {
			dao.deleteGroup(groupNum);
		} else {
			throw new IllegalStateException("방장 권한이 없습니다.");
		}
	}
}
