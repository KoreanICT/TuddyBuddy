package kr.co.ictedu.back.admin.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;
import kr.co.ictedu.back.admin.dao.StudyAdminDao;
import kr.co.ictedu.back.notification.dao.NotificationDao;
import kr.co.ictedu.back.notification.dto.NotificationDTO;
import kr.co.ictedu.back.notification.service.NotificationService;

@Service
public class StudyAdminService {
    private static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(StudyAdminService.class);
    private final StudyAdminDao dao;
    private final NotificationDao notifications;
    private final NotificationService sender;
    private final Path documentsRoot;
    private final Path thumbnailsRoot;

    public StudyAdminService(StudyAdminDao dao, NotificationDao notifications, NotificationService sender,
            @Value("${spring.servlet.multipart.location}") String documentsRoot,
            @Value("${file.upload.group-thumbnail}") String thumbnailsRoot) {
        this.dao = dao; this.notifications = notifications; this.sender = sender;
        this.documentsRoot = Path.of(documentsRoot).toAbsolutePath().normalize();
        this.thumbnailsRoot = Path.of(thumbnailsRoot).toAbsolutePath().normalize();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(int page, String keyword) {
        if (page < 1 || keyword.length() > 100)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "검색어는 100자 이내, 페이지는 1 이상이어야 합니다.");
        keyword = keyword.trim();
        int total = dao.count(keyword);
        int pages = (int) Math.ceil(total / 10.0);
        int current = Math.min(page, Math.max(1, pages));
        return Map.of("data", dao.list(keyword, (current - 1) * 10 + 1, current * 10),
                "totalItems", total, "totalPages", pages, "currentPage", current);
    }

    @Transactional
    public void delete(Long num) {
        if (num == null || num <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "스터디 번호를 확인해주세요.");
        var group = dao.lockGroup(num);
        if (group == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미 삭제되었거나 존재하지 않는 스터디입니다.");
        var recipients = dao.memberNums(num);
        var paths = dao.documentPaths(num);
        var saved = new ArrayList<NotificationDTO>();
        // Save in the SAME transaction: failed notification persistence must roll back deletion.
        String title = group.getGroup_title() == null ? "스터디" : group.getGroup_title();
        for (Long memberNum : recipients) {
            var dto = new NotificationDTO();
            dto.setMember_num(memberNum); dto.setCategory("STUDY_DELETED");
            dto.setTitle("참여 중인 스터디가 삭제되었습니다");
            dto.setMessage("관리자가 ‘" + title + "’ 스터디를 삭제했습니다. (스터디 #" + num + ")");
            dto.setTarget_url("/group"); dto.setIs_checked(0);
            if (notifications.insertNotification(dto) != 1)
                throw new IllegalStateException("삭제 알림을 저장하지 못했습니다.");
            var persisted = notifications.getNotification(memberNum, dto.getNotification_num());
            if (persisted == null) throw new IllegalStateException("삭제 알림을 확인하지 못했습니다.");
            saved.add(persisted);
        }
        try {
            if (dao.tableExists("GROUP_CHAT") > 0) dao.deleteChat(num);
            dao.deleteMemos(num); dao.deleteSchedules(num); dao.deleteTdls(num);
            dao.deleteDiagrams(num); dao.deleteDocuments(num); dao.deleteTags(num);
            dao.deleteJoinRequests(num); dao.deleteMembers(num);
            if (dao.deleteGroup(num) != 1) throw new IllegalStateException("스터디 삭제에 실패했습니다.");
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "연결된 데이터가 남아 삭제하지 못했습니다. 데이터 관계를 확인해주세요.", e);
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                for (var dto : saved) {
                    try { sender.send(dto.getMember_num(), dto); }
                    catch (RuntimeException e) { LOG.warn("Study deletion notification is stored but live delivery failed", e); }
                }
                for (String path : paths) deleteFile(path, documentsRoot);
                if (group.getGroup_thumbnail() != null)
                    deleteFile(thumbnailsRoot.resolve(group.getGroup_thumbnail()).toString(), thumbnailsRoot);
            }
        });
    }

    private void deleteFile(String filename, Path root) {
        if (filename == null || filename.isBlank()) return;
        try {
            Path path = Path.of(filename).toAbsolutePath().normalize();
            if (path.startsWith(root) && !path.equals(root) && !Files.isDirectory(path)) Files.deleteIfExists(path);
            else LOG.warn("Skipped study file outside its configured upload directory");
        } catch (Exception e) { LOG.warn("Study deleted; uploaded file cleanup requires retry", e); }
    }
}
