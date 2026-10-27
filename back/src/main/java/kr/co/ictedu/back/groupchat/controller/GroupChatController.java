// back/src/main/java/kr/co/ictedu/back/roomchat/controller/RoomChatController.java

package kr.co.ictedu.back.groupchat.controller;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import kr.co.ictedu.back.groupchat.GroupChatService;
import kr.co.ictedu.back.groupchat.vo.GroupChatVO;
@Controller
public class GroupChatController {

    private final GroupChatService service;

    public GroupChatController(GroupChatService service) {
        this.service = service;
    }

    @MessageMapping("/chat/{groupNum}")
    @SendTo("/topic/group/{groupNum}")
    public GroupChatVO handleChatMessage(
            @DestinationVariable("groupNum") Long groupNum,
            GroupChatVO message,
            Principal principal) {

        return service.saveMessage(groupNum, message, principal);
    }
}