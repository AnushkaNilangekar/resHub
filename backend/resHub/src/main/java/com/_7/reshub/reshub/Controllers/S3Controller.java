package com._7.reshub.reshub.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/s3")
@CrossOrigin(origins = "*") 
public class S3Controller {
    private static final Logger logger = LoggerFactory.getLogger(S3Controller.class);

    private final String BUCKET_NAME = "reshub-profile-pics";
    private final S3Client s3Client;

    public S3Controller() {
        this.s3Client = S3Client.builder()
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .credentialsProvider(ProfileCredentialsProvider.create())
                .build();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            logger.info("Attempting to upload file: {}", file.getOriginalFilename());

            // Validate file type (check both extension and MIME type)
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String contentType = file.getContentType();
            if (!isValidFileType(fileExtension, contentType)) {
                String errorResponse = "{\"message\": \"Invalid file type. Only image files are allowed.\"}";
                logger.error("Invalid file type: {}", errorResponse);
                return ResponseEntity.status(400).body(errorResponse);
            }

            // Generate a unique file name
            String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
            logger.info("Generated unique file name: {}", fileName);

            // Upload file to S3
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(fileName)
                    .build(),
                RequestBody.fromBytes(file.getBytes())
            );

            // Return the file URL after upload
            String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + fileName;
            logger.info("File uploaded successfully: {}", fileUrl);

            // Return a JSON response with the file URL
            String successResponse = "{\"url\": \"" + fileUrl + "\"}";
            logger.info("Returning response: {}", successResponse);
            return ResponseEntity.ok(successResponse);

        } catch (IOException e) {
            logger.error("Error uploading file: {}", e.getMessage(), e);
            // Return a JSON error response
            String errorResponse = "{\"message\": \"Upload failed: " + e.getMessage() + "\"}";
            logger.error("Returning error response: {}", errorResponse);
            return ResponseEntity.status(500).body(errorResponse);
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            // Return a general error response
            String errorResponse = "{\"message\": \"An unexpected error occurred.\"}";
            logger.error("Returning error response: {}", errorResponse);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Helper method to get file extension
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf(".");
        return lastDot == -1 ? "" : fileName.substring(lastDot + 1);
    }

    // Helper method to validate file type
    private boolean isValidFileType(String fileExtension, String contentType) {
        // Check if the file extension is in the allowed list
        String[] allowedExtensions = {"jpg", "jpeg", "png", "gif", "bmp"};
        for (String ext : allowedExtensions) {
            if (fileExtension.equalsIgnoreCase(ext)) {
                return true;
            }
        }
        // Check MIME type for image files
        if (contentType != null && contentType.startsWith("image/")) {
            return true;
        }
        return false;
    }
}
