//작성자 : 오진석
package kr.co.ictedu.back.group.service;

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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import kr.co.ictedu.back.group.dao.GroupDao;
import kr.co.ictedu.back.group.dto.GroupCreateRequest;
import kr.co.ictedu.back.group.dto.GroupListDTO;
import kr.co.ictedu.back.group.dto.GroupTagDTO;
import kr.co.ictedu.back.group.dto.PublicGroupListDTO;
import kr.co.ictedu.back.group.vo.GroupMemberVO;
import kr.co.ictedu.back.group.vo.GroupVO;
import kr.co.ictedu.back.group.vo.TagVO;
import kr.co.ictedu.back.notification.NotificationPublisher;
import kr.co.ictedu.back.notification.NotificationEvent.Category;
import kr.co.ictedu.back.notification.dao.NotificationDao;
import kr.co.ictedu.back.notification.dto.NotificationDTO;

@Service
public class GroupService {

	@Autowired
	private GroupDao dao;

	@Autowired
	private NotificationPublisher notificationPublisher;

	@Autowired
	private NotificationDao notificationDao;
	
	@Value("${file.upload.group-thumbnail}")
	private String uploadPath;

	public List<TagVO> searchTags(String keyword) {
		if (keyword == null || keyword.trim().isEmpty()) {
			return List.of();
		}

		return dao.searchTags(keyword.trim());
	}

	public void joinGroup(Long groupNum, Long memberNum) {
	    throw new org.springframework.web.server.ResponseStatusException(
	        org.springframework.http.HttpStatus.CONFLICT,
	        "가입 신청 후 방장 승인이 필요합니다."
	    );
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

	@Transactional
	public Long joinByInviteCode(String inviteCode, Long memberNum) {
		if (inviteCode == null || inviteCode.trim().isEmpty()) {
			throw new IllegalArgumentException("초대코드를 입력해주세요.");
		}
		GroupVO group = dao.findGroupByInviteCode(inviteCode.trim());
		
		if (group == null) {
			throw new IllegalArgumentException("존재하지 않는 초대코드입니다.");
		}
		Long groupNum = group.getGroup_num();
		
		int memberExists = dao.countGroupMember(groupNum, memberNum);
		
		if (memberExists > 0) {
			throw new IllegalStateException("이미 가입한 스터디룸입니다.");
		};
		
		int currentMembers = dao.countGroupMembers(groupNum);
		
		if (currentMembers >= group.getGroup_maxMembers()) {
			throw new IllegalStateException("스터디룸 정원이 가득 찼습니다.");
		}
		
		GroupMemberVO groupMember = new GroupMemberVO();
		groupMember.setGroup_num(groupNum);
		groupMember.setMember_num(memberNum);
		groupMember.setIs_leader(0);
		
		dao.addGroupMember(groupMember);
		
		return groupNum;
	}


	public List<GroupListDTO> getMyGroups(Long memberNum) {
		Map<String, Object> params = new HashMap<>();
		params.put("member_num", memberNum);
		dao.getMyGroupsProc(params);
		//제너릭을 사용하더라도 params가 object type으로 오기 때문에 type safe관련 경고문이 출력되는 것을 방지하기 위해 @SuppressWarnings를 사용
		@SuppressWarnings("unchecked") List<GroupListDTO> groups = (List<GroupListDTO>) params.get("group_cursor");
		@SuppressWarnings("unchecked") List<GroupTagDTO> tags = (List<GroupTagDTO>) params.get("tag_cursor");
		
		Map<Long, List<TagVO>> tagMap = new HashMap<>();
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

	public List<PublicGroupListDTO> getPublicGroups(Long memberNum) {
		Map<String, Object> params = new HashMap<>();
		params.put("member_num", memberNum);
		dao.getPublicGroupsProc(params);
		//제너릭을 사용하더라도 params가 object type으로 오기 때문에 type safe관련 경고문이 출력되는 것을 방지하기 위해 @SuppressWarnings를 사용
		@SuppressWarnings("unchecked") List<PublicGroupListDTO> groups = (List<PublicGroupListDTO>) params.get("group_cursor");
		@SuppressWarnings("unchecked") List<GroupTagDTO> tags = (List<GroupTagDTO>) params.get("tag_cursor");
		
		Map<Long, List<TagVO>> tagMap = new HashMap<>();
		    for (GroupTagDTO tag : tags) {
		        TagVO tagVO = new TagVO();
		        tagVO.setTag_num(tag.getTag_num());
		        tagVO.setTag_name(tag.getTag_name());
		        tagVO.setTag_color(tag.getTag_color());
		        tagMap.computeIfAbsent(tag.getGroup_num(),key -> new ArrayList<>()).add(tagVO);
		    }
		    for (PublicGroupListDTO group : groups) {
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
	@Transactional
	public void requestJoin(Long groupNum, Long memberNum) {
	    GroupVO group = dao.getJoinGroup(groupNum);

	    if (group == null) {
	        throw new ResponseStatusException(
	            HttpStatus.NOT_FOUND, "스터디가 없습니다."
	        );
	    }
	    
	    if (dao.countGroupMember(groupNum, memberNum) > 0) {
	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT, "이미 가입한 회원입니다."
	        );
	    }

	    Long leaderNum = dao.getGroupLeader(groupNum);

	    if (leaderNum == null) {
	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT, "방장이 없습니다."
	        );
	    }

	    String targetUrl = "/group/" + groupNum + "/join-requests?applicant=" + memberNum;

	    if (notificationDao.countJoinRequest(targetUrl) > 0) {
	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT, "이미 참여 요청을 보냈습니다."
	        );
	    }

	    String memberNick = dao.getMemberNick(memberNum);

	    // 다른 알림 기능과 동일한 발행 방식
	    notificationPublisher.send(leaderNum,Category.JOIN,"스터디룸 참여 요청",
	        memberNick + "님이 "
	            + group.getGroup_title()
	            + " 스터디룸에 참여를 희망하였습니다.",targetUrl);
	}
	@Transactional
	public String answerJoin(Long memberNum,Long notificationNum,boolean accept) {

	    NotificationDTO notification =notificationDao.getJoinNotification(memberNum, notificationNum);

	    if (notification == null
	            || !"JOIN".equals(notification.getCategory())) {
	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT, "처리할 참여 요청이 없습니다."
	        );
	    }

	    // 저장된 알림에서 스터디 번호와 신청자 번호 확인
	    java.util.regex.Matcher matcher =
	        java.util.regex.Pattern.compile(
	            "^/group/([1-9][0-9]*)/join-requests\\?applicant=([1-9][0-9]*)$"
	        ).matcher(
	            notification.getTarget_url() == null
	                ? ""
	                : notification.getTarget_url()
	        );

	    if (!matcher.matches()) {
	        throw new ResponseStatusException(
	            HttpStatus.BAD_REQUEST, "참여 요청 정보가 올바르지 않습니다."
	        );
	    }

	    Long groupNum;
	    Long applicantNum;

	    try {
	        groupNum = Long.valueOf(matcher.group(1));
	        applicantNum = Long.valueOf(matcher.group(2));
	    } catch (NumberFormatException e) {
	        throw new ResponseStatusException(
	            HttpStatus.BAD_REQUEST, "참여 요청 번호가 올바르지 않습니다."
	        );
	    }

	    GroupVO group = dao.getJoinGroup(groupNum);

	    if (group == null) {
	        throw new ResponseStatusException(
	            HttpStatus.NOT_FOUND, "스터디가 없습니다."
	        );
	    }

	    if (!memberNum.equals(dao.getGroupLeader(groupNum))) {
	        throw new ResponseStatusException(
	            HttpStatus.FORBIDDEN, "방장만 처리할 수 있습니다."
	        );
	    }

	    if (accept) {
	        if (dao.countGroupMember(groupNum, applicantNum) > 0) {
	            throw new ResponseStatusException(
	                HttpStatus.CONFLICT, "이미 가입한 회원입니다."
	            );
	        }

	        if (dao.countGroupMembers(groupNum)
	                >= group.getGroup_maxMembers()) {
	            throw new ResponseStatusException(
	                HttpStatus.CONFLICT, "정원이 가득 찼습니다."
	            );
	        }
	    }

	    String category = accept
	        ? Category.JOIN_APPROVED.name()
	        : Category.JOIN_REJECTED.name();

	    int updated = notificationDao.answerJoin(memberNum, notificationNum, category);

	    if (updated == 0) {
	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT, "이미 처리된 요청입니다."
	        );
	    }

	    if (accept) {
	        dao.joinGroup(groupNum, applicantNum);
	    }

	    return category;
	}
}
