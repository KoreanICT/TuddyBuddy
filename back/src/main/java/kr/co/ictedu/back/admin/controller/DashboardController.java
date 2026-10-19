package kr.co.ictedu.back.admin.controller;

import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import kr.co.ictedu.back.admin.service.DashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> overview(Authentication authentication) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(dashboardService.overview(authentication));
    }
}
