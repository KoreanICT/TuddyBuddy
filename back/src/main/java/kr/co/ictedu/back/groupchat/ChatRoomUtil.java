package kr.co.ictedu.back.groupchat;

public class ChatRoomUtil {

    public static Long getGroupNum(String destination, String prefix) {
        if (destination == null || !destination.startsWith(prefix)) {
            throw new IllegalArgumentException("허용되지 않은 채팅 경로입니다.");
        }

        String groupNum = destination.substring(prefix.length());

        if (!groupNum.matches("[1-9][0-9]*")) {
            throw new IllegalArgumentException("올바르지 않은 스터디룸 번호입니다.");
        }

        return Long.valueOf(groupNum);
    }
}