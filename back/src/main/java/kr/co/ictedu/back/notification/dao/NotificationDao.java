package kr.co.ictedu.back.notification.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.co.ictedu.back.notification.dto.NotificationDTO;

@Mapper
public interface NotificationDao {

    NotificationDTO getNotification(@Param("member_num") Long memberNum, @Param("notification_num") Long notificationNum);
    List<NotificationDTO> getNotifications(@Param("member_num") Long memberNum);
    List<NotificationDTO> getUnreadNotifications(@Param("member_num") Long memberNum);
    int insertNotification(NotificationDTO dto);
    int readNotification(@Param("member_num") Long memberNum, @Param("notification_num") Long notificationNum);
    int readAll( @Param("member_num") Long memberNum);
    int deleteNotification(@Param("member_num") Long memberNum, @Param("notification_num") Long notificationNum);
    int countJoinRequest(@Param("target_url") String targetUrl);
    NotificationDTO getJoinNotification(@Param("member_num") Long memberNum, @Param("notification_num") Long notificationNum);
    int answerJoin(@Param("member_num") Long memberNum, @Param("notification_num") Long notificationNum, @Param("category") String category);
}