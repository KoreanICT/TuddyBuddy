package kr.co.ictedu.back.notification;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Repository
public class SseEmitterRepository {

	private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
	
	public void save(Long memberNum, SseEmitter emitter) {
		emitters
		.computeIfAbsent(memberNum,  key -> new CopyOnWriteArrayList<>())
		.add(emitter);
	}
	
	public List<SseEmitter> findAllByMemberNum(Long memberNum) {
		return emitters.getOrDefault(memberNum, Collections.emptyList());
	}
	
	public void delete(Long memberNum, SseEmitter emitter) {
		List<SseEmitter> memberEmitters = emitters.get(memberNum);
		if (memberEmitters == null) {
			return;
		}
		
		memberEmitters.remove(emitter);
		
		if (memberEmitters.isEmpty()) {
			emitters.remove(memberNum);
		}
	}
	
	public boolean exists(Long memberNum) {
		List<SseEmitter> memberEmitters = emitters.get(memberNum);
		return memberEmitters != null && !memberEmitters.isEmpty();
	}
}
