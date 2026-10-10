package kr.co.ictedu.back.group.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.dto.GroupCreateRequest;
import kr.co.ictedu.back.group.dto.GroupListDTO;
import kr.co.ictedu.back.group.dto.GroupTagDTO;
import kr.co.ictedu.back.group.vo.DiagramVO;
import kr.co.ictedu.back.group.vo.GroupMemberVO;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Service
public class GroupService {

	@Autowired
	private GroupDao dao;

	@Value("${file.upload.group-thumbnail}")
	private String uploadPath;

	public List<TagVO> searchTags(String keyword) {
		if (keyword == null || keyword.trim().isEmpty()) {
			return List.of();
		}

		return dao.searchTags(keyword.trim());
	}

	@Transactional
	public Long addGroup(GroupCreateRequest request, MultipartFile thumbnail, Long memberNum) {
		if (request == null || request.getGroup() == null) {
			throw new IllegalArgumentException("스터디 그룹 정보가 없습니다.");
		}

		GroupVO group = request.getGroup();

		if (thumbnail != null && !thumbnail.isEmpty()) {

			String thumbnailUrl = saveThumbnail(thumbnail);
			group.setGroup_thumbnail(thumbnailUrl);
		}

		dao.addGroup(group);

		Long groupNum = group.getGroup_num();

		GroupMemberVO leader = new GroupMemberVO();

		leader.setGroup_num(groupNum);
		leader.setMember_num(memberNum);

		leader.setIs_leader(1);

		dao.addGroupMember(leader);

		List<TagVO> tags = request.getTags();

		if (tags == null || tags.isEmpty()) {
			return groupNum;
		}

		Set<Long> connectedTags = new HashSet<>();

		for (TagVO tag : tags) {
			if (tag == null) {
				continue;
			}

			Long tagNum = tag.getTag_num();

			if (tagNum == null) {
				String tagName = tag.getTag_name();

				if (tagName == null || tagName.trim().isEmpty()) {
					continue;
				}
				tagName = tagName.trim();

				TagVO existingTag = dao.findTagByName(tagName);

				if (existingTag != null) {
					tagNum = existingTag.getTag_num();
				} else {
					tag.setTag_name(tagName);
					dao.addTag(tag);
					tagNum = tag.getTag_num();
				}
			}
			if (!connectedTags.add(tagNum)) {
				continue;
			}
			dao.addGroupTag(groupNum, tagNum);
		}
		return groupNum;
	}

	public List<GroupListDTO> getGroups(Long memberNum) {
		List<GroupListDTO> list = dao.getGroups(memberNum);
		return list;
	}

	public List<GroupListDTO> getMyGroups(Long memberNum) {
		Map<String, Object> params = new HashMap<>();
		params.put("member_num", memberNum);
		dao.getMyGroupsProc(params);
		//제너릭을 사용하더라도 params가 object type으로 오기 때문에 type safe관련 경고문이 출력되는 것을 방지하기 위해 @SuppressWarnings를 사용
		@SuppressWarnings("unchecked") List<GroupListDTO> groups = (List<GroupListDTO>) params.get("group_cursor");
		@SuppressWarnings("unchecked") List<GroupTagDTO> tags = (List<GroupTagDTO>) params.get("tag_cursor");
		
		Map<Long, List<TagVO>> tagMap =
		        new HashMap<>();
		    for (GroupTagDTO tag : tags) {
		        TagVO tagVO = new TagVO();
		        tagVO.setTag_num(tag.getTag_num());
		        tagVO.setTag_name(tag.getTag_name());
		        tagVO.setTag_color(tag.getTag_color());
		        tagMap.computeIfAbsent(tag.getGroup_num(),key -> new ArrayList<>()).add(tagVO);
		    }
		    for (GroupListDTO group : groups) {
		        group.setTags(tagMap.getOrDefault(group.getGroup_num(),new ArrayList<>()));
		    }
		    return groups;
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

	@PostConstruct
	public void checkUploadPath() {
		System.out.println("===== 실제 uploadPath =====");
		System.out.println(uploadPath);
		System.out.println("==========================");
	}
}
