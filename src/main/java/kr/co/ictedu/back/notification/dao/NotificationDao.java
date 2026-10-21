package kr.co.ictedu.back.notification.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.co.ictedu.back.notification.dto.NotificationDTO;

@Mapper
public interface NotificationDao {
	List<NotificationDTO> getNotifications(@Param("member_num") Long memberNum);
	List<NotificationDTO> getUnreadNotifications(@Param("member_num") Long memberNum);
	int readNotification(@Param("member_num") Long memberNum, @Param("notification_num") Long notificationNum);
	int readAll(@Param("member_num") Long memberNum);
	int insertNotification(NotificationDTO dto);
	void deleteNotification(@Param("notification_num") Long notificationNum);
}
