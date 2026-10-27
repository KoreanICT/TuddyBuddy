package kr.co.ictedu.back.notice;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import kr.co.ictedu.back.member.service.MemberService;
import kr.co.ictedu.back.member.vo.MemberVO;
import kr.co.ictedu.back.notice.controller.NoticeController;
import kr.co.ictedu.back.notice.service.NoticeService;
import kr.co.ictedu.back.notice.vo.NoticeVO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

class NoticeImageUploadUnitTest {
    @TempDir Path directory;
    private NoticeController controller;
    private NoticeService notices;
    private Authentication authentication;

    @BeforeEach
    void setup() {
        controller = new NoticeController();
        notices = mock(NoticeService.class);
        MemberService members = mock(MemberService.class);
        MemberVO admin = new MemberVO();
        admin.setMember_num(1L);
        admin.setAuthority("ADMIN");
        when(members.getMemberByEmail("admin")).thenReturn(admin);
        authentication = new UsernamePasswordAuthenticationToken("admin", null, java.util.List.of());
        ReflectionTestUtils.setField(controller, "noticeService", notices);
        ReflectionTestUtils.setField(controller, "memberService", members);
        ReflectionTestUtils.setField(controller, "filePath", directory.toString());
    }

    private NoticeVO upload(byte value) {
        NoticeVO notice = new NoticeVO();
        notice.setNum(1L);
        notice.setMfile(new MockMultipartFile("mfile", "same.png", "image/png", new byte[]{value}));
        return notice;
    }

    @Test
    void sameOriginalFilenameDoesNotOverwriteEitherNoticeOrLegacyFile() throws Exception {
        Files.write(directory.resolve("same.png"), new byte[]{0});
        NoticeVO first = upload((byte) 1);
        NoticeVO second = upload((byte) 2);
        assertEquals(200, controller.upboardAdd(first, null, authentication).getStatusCode().value());
        assertEquals(200, controller.upboardAdd(second, null, authentication).getStatusCode().value());
        assertNotEquals(first.getImgn(), second.getImgn());
        assertTrue(first.getImgn().endsWith(".png"));
        assertArrayEquals(new byte[]{1}, Files.readAllBytes(directory.resolve(first.getImgn())));
        assertArrayEquals(new byte[]{2}, Files.readAllBytes(directory.resolve(second.getImgn())));
        assertArrayEquals(new byte[]{0}, Files.readAllBytes(directory.resolve("same.png")));
    }

    @Test
    void databaseInsertFailureRemovesOnlyNewFile() throws Exception {
        Files.write(directory.resolve("same.png"), new byte[]{0});
        doThrow(new IllegalStateException("database unavailable")).when(notices).add(any());
        assertEquals(500, controller.upboardAdd(upload((byte) 1), null, authentication).getStatusCode().value());
        try (var files = Files.list(directory)) { assertEquals(1, files.count()); }
        assertArrayEquals(new byte[]{0}, Files.readAllBytes(directory.resolve("same.png")));
    }

    @Test
    void replacementPreservesLegacyImagePotentiallySharedByOtherNotices() throws Exception {
        Files.write(directory.resolve("same.png"), new byte[]{0});
        NoticeVO old = new NoticeVO();
        old.setImgn("same.png");
        when(notices.getNotice(1L)).thenReturn(old);
        when(notices.update(any())).thenReturn(1);
        NoticeVO update = upload((byte) 2);
        assertEquals(200, controller.noticeUpdate(update, false, authentication).getStatusCode().value());
        assertNotEquals("same.png", update.getImgn());
        assertArrayEquals(new byte[]{0}, Files.readAllBytes(directory.resolve("same.png")));
        assertArrayEquals(new byte[]{2}, Files.readAllBytes(directory.resolve(update.getImgn())));
    }

    @Test
    void failedUpdateDoesNotOverwriteOrDeleteOriginal() throws Exception {
        Files.write(directory.resolve("same.png"), new byte[]{0});
        NoticeVO old = new NoticeVO();
        old.setImgn("same.png");
        when(notices.getNotice(1L)).thenReturn(old);
        when(notices.update(any())).thenReturn(0);
        assertEquals(404, controller.noticeUpdate(upload((byte) 2), false, authentication).getStatusCode().value());
        try (var files = Files.list(directory)) { assertEquals(1, files.count()); }
        assertArrayEquals(new byte[]{0}, Files.readAllBytes(directory.resolve("same.png")));
    }
}
