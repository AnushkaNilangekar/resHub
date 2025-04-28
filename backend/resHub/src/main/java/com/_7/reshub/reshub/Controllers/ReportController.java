package com._7.reshub.reshub.Controllers;

import com._7.reshub.reshub.Models.Report;
import com._7.reshub.reshub.Services.ReportService;

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

    @PostMapping("/create")
    public ResponseEntity<?> createReport(@RequestBody Map<String, String> requestBody) {
        try {
            //System.out.println("Received request data: " + requestBody);
            
            // Create a new report from the map data
            Report report = new Report();
            report.setReporterId(requestBody.get("reporterId"));
            report.setReportedUserId(requestBody.get("reportedUserId"));
            report.setChatId(requestBody.get("chatId"));
            report.setReason(requestBody.get("reason"));
            report.setAdditionalInfo(requestBody.get("additionalInfo"));
            report.setMessageTimestamp(requestBody.get("messageTimestamp"));
            report.setReportTimestamp(requestBody.get("reportTimestamp"));
            
            //System.out.println("Created report object: " + report);
            
            Report savedReport = reportService.createReport(report);
            return new ResponseEntity<>(savedReport, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error creating report: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/byReporter/{reporterId}")
    public ResponseEntity<?> getReportsByReporter(@PathVariable String reporterId) {
        try {            
            List<Report> reports = reportService.getReportsByReporter(reporterId);
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching reports: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}