// 주용현

package kr.co.ictedu.back.report;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
public class ReportListDataTest {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	private static final String TEST_MARKER = "[REPORT_LIST_TEST]";

	// 신고 목록 시각화 테스트 데이터 등록
	@Test
	void insertReportListTestData() {

		Integer memberNum = jdbcTemplate.queryForObject("SELECT MIN(member_num) FROM member", Integer.class);

		assertNotNull(memberNum, "회원 데이터가 없습니다. 회원을 먼저 등록해주세요.");

		Integer existingCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM report WHERE content LIKE ?",
				Integer.class, TEST_MARKER + "%");

		if (existingCount != null && existingCount > 0) {
			System.out.println("신고 테스트 데이터가 이미 존재합니다. 추가 등록하지 않습니다.");
			return;
		}

		String[][] testData = { { "community", "SPAM", "PENDING", "15" }, { "report", "ABUSE", "PENDING", "0" },
				{ "user", "HARASSMENT", "REVIEWING", "7" }, { "study", "SPAM", "COMPLETED", "10" },
				{ "community", "ABUSE", "REJECTED", "21" }, { "report", "SPAM", "PENDING", "0" },
				{ "user", "ABUSE", "REVIEWING", "15" }, { "document", "FALSE_INFO", "COMPLETED", "30" },
				{ "study", "SPAM", "PENDING", "12" }, { "user", "HARASSMENT", "REJECTED", "22" },
				{ "report", "ABUSE", "COMPLETED", "0" }, { "community", "FALSE_INFO", "PENDING", "40" },
				{ "user", "SPAM", "REVIEWING", "30" }, { "study", "ABUSE", "COMPLETED", "18" },
				{ "community", "SPAM", "PENDING", "55" }, { "report", "HARASSMENT", "REJECTED", "0" },
				{ "user", "FALSE_INFO", "PENDING", "33" }, { "study", "SPAM", "REVIEWING", "25" },
				{ "document", "ABUSE", "COMPLETED", "70" }, { "report", "SPAM", "PENDING", "0" } };

		int inserted = 0;

		for (int i = 0; i < testData.length; i++) {
			String[] data = testData[i];

			int result = jdbcTemplate.update(
					"INSERT INTO report "
							+ "(num, member_num, type, category, content, status, created_date, target_num) "
							+ "VALUES (report_seq.NEXTVAL, ?, ?, ?, ?, ?, SYSDATE, ?)",
					memberNum, data[0], data[1], TEST_MARKER + " 신고 목록 시각화 테스트 " + (i + 1), data[2],
					Long.parseLong(data[3]));

			inserted += result;
		}

		assertEquals(20, inserted);

		System.out.println("신고 테스트 데이터 " + inserted + "건 등록 완료");
	}

	// 신고 데이터 등록 결과 확인
	@Test
	void checkReportListTestData() {

		Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM report WHERE content LIKE ?", Integer.class,
				TEST_MARKER + "%");

		System.out.println("등록된 신고 테스트 데이터: " + count + "건");

		List<String> results = jdbcTemplate
				.queryForList(
						"SELECT type || ' / ' || category || ' / ' || status || ' / 대상번호: ' || target_num "
								+ "FROM report WHERE content LIKE ? ORDER BY num DESC",
						String.class, TEST_MARKER + "%");

		results.forEach(System.out::println);
	}

	// =========================
	// 신고 테스트 데이터 삭제
	// 필요할 때만 개별 실행
	// =========================
	// @Test
	void deleteReportListTestData() {

		int deleted = jdbcTemplate.update("DELETE FROM report WHERE content LIKE ?", TEST_MARKER + "%");

		System.out.println("신고 테스트 데이터 " + deleted + "건 삭제 완료");
	}
}
