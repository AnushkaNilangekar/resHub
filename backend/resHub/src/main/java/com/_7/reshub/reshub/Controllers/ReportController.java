package com._7.reshub.reshub.Controllers;

import com._7.reshub.reshub.Models.Report;
import com._7.reshub.reshub.Services.ReportService;
import com._7.reshub.reshub.Utils.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/create")
    public ResponseEntity<?> createReport(@RequestBody Report report, @RequestHeader("Authorization") String token) {
        try {
            // Validate token
            /*String bearerToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            String userId = jwtUtil.extractUserId(bearerToken);
            
            if (userId == null || !userId.equals(report.getReporterId())) {
                return new ResponseEntity<>("Unauthorized: User ID does not match token", HttpStatus.UNAUTHORIZED);
            }*/
            
            Report savedReport = reportService.createReport(report);
            return new ResponseEntity<>(savedReport, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            // Special handling for duplicate reports
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating report: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /*@GetMapping("/all")
    public ResponseEntity<?> getAllReports(@RequestHeader("Authorization") String token) {
        try {
            // Validate token and check if admin
            String bearerToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            String userId = jwtUtil.extractUserId(bearerToken);
            boolean isAdmin = jwtUtil.isAdmin(bearerToken);
            
            if (!isAdmin) {
                return new ResponseEntity<>("Unauthorized: Admin privileges required", HttpStatus.FORBIDDEN);
            }
            
            List<Report> reports = reportService.getAllReports();
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching reports: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/{reportId}")
    public ResponseEntity<?> getReportById(@PathVariable String reportId, @RequestHeader("Authorization") String token) {
        try {
            // Validate token
            String bearerToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            String userId = jwtUtil.extractUserId(bearerToken);
            boolean isAdmin = jwtUtil.isAdmin(bearerToken);
            
            Report report = reportService.getReportById(reportId);
            
            if (report == null) {
                return new ResponseEntity<>("Report not found", HttpStatus.NOT_FOUND);
            }
            
            // Only allow access if user is the reporter or an admin
            if (!isAdmin && !userId.equals(report.getReporterId())) {
                return new ResponseEntity<>("Unauthorized: Not allowed to access this report", HttpStatus.FORBIDDEN);
            }
            
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching report: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/byReporter/{reporterId}")
    public ResponseEntity<?> getReportsByReporter(@PathVariable String reporterId, @RequestHeader("Authorization") String token) {
        try {
            // Validate token
            String bearerToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            String userId = jwtUtil.extractUserId(bearerToken);
            boolean isAdmin = jwtUtil.isAdmin(bearerToken);
            
            // Only allow access if user is fetching their own reports or is an admin
            if (!isAdmin && !userId.equals(reporterId)) {
                return new ResponseEntity<>("Unauthorized: Not allowed to access these reports", HttpStatus.FORBIDDEN);
            }
            
            List<Report> reports = reportService.getReportsByReporter(reporterId);
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching reports: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/byReportedUser/{reportedUserId}")
    public ResponseEntity<?> getReportsByReportedUser(@PathVariable String reportedUserId, @RequestHeader("Authorization") String token) {
        try {
            // Validate token - Only admins should be able to see all reports against a user
            String bearerToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            boolean isAdmin = jwtUtil.isAdmin(bearerToken);
            
            if (!isAdmin) {
                return new ResponseEntity<>("Unauthorized: Admin privileges required", HttpStatus.FORBIDDEN);
            }
            
            List<Report> reports = reportService.getReportsByReportedUser(reportedUserId);
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching reports: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/resolve/{reportId}")
    public ResponseEntity<?> resolveReport(@PathVariable String reportId, 
                                           @RequestBody Map<String, String> payload,
                                           @RequestHeader("Authorization") String token) {
        try {
            // Validate token - Only admins should be able to resolve reports
            String bearerToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            boolean isAdmin = jwtUtil.isAdmin(bearerToken);
            
            if (!isAdmin) {
                return new ResponseEntity<>("Unauthorized: Admin privileges required", HttpStatus.FORBIDDEN);
            }
            
            String resolutionNotes = payload.get("resolutionNotes");
            Report resolvedReport = reportService.resolveReport(reportId, resolutionNotes);
            
            if (resolvedReport == null) {
                return new ResponseEntity<>("Report not found", HttpStatus.NOT_FOUND);
            }
            
            return new ResponseEntity<>(resolvedReport, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error resolving report: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }*/
}