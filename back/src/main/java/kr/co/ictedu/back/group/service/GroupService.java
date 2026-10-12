package kr.co.ictedu.back.group.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import kr.co.ictedu.back.group.dao.DiagramDao;
import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.dto.GroupCreateRequest;
import kr.co.ictedu.back.group.vo.DiagramVO;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;

@Service
public class GroupService {

	@Autowired
	private GroupDao dao;

	@Value("${spring.servlet.multipart.location}")
	private String uploadPath;

	public List<TagVO> searchTags(String keyword) {
		if (keyword == null || keyword.trim().isEmpty()) {
			return List.of();
		}

		return dao.searchTags(keyword.trim());
	}

	@Transactional
	public Long addGroup(GroupCreateRequest request, MultipartFile thumbnail) {
		
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
			return "/imgfile/" + savedFilename;
		} catch (Exception e) {
			throw new RuntimeException("썸네일 저장에 실패했습니다.", e);
		}
	}
}
