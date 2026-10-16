//김진규
package kr.co.ictedu.back.statistics.dto;

import java.util.List;

public class LlmFeedbackResponseDTO {
    private String mentorComment;
    private List<String> weaknesses;
    private List<String> consultingPath;

    // Getters and Setters
    public String getMentorComment() { return mentorComment; }
    public void setMentorComment(String mentorComment) { this.mentorComment = mentorComment; }
    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    public List<String> getConsultingPath() { return consultingPath; }
    public void setConsultingPath(List<String> consultingPath) { this.consultingPath = consultingPath; }
}
