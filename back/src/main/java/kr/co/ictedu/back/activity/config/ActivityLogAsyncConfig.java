package kr.co.ictedu.back.activity.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class ActivityLogAsyncConfig {

	private static final Logger log = LoggerFactory.getLogger(ActivityLogAsyncConfig.class);
	
	@Bean("activityLogExecutor")
	public ThreadPoolTaskExecutor activityLogExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		
		executor.setThreadNamePrefix("activity-log-");
		
		executor.setCorePoolSize(1);
		executor.setMaxPoolSize(2);
		executor.setQueueCapacity(500);
		
		// 처리 여력이 없으면 로그를 생략한다.
		// 사용자 요청 스레드에서 대신 저장하지 않는다.
		executor.setRejectedExecutionHandler(
				(task, pool) -> log.warn(
						"활동 로그 작업 생략. queued={}, shutdown={}",
						pool.getQueue().size(),
						pool.isShutdown()
				)
		);
		
		executor.setWaitForTasksToCompleteOnShutdown(true);
		executor.setAwaitTerminationSeconds(10);
		
		return executor;
	}
}
