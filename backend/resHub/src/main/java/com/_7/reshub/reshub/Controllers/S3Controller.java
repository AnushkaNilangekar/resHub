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

            // Validate file type (optional, e.g., only allow image files)
            String fileExtension = getFileExtension(file.getOriginalFilename());
            if (!isValidFileType(fileExtension)) {
                return ResponseEntity.status(400).body("Invalid file type. Only image files are allowed.");
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
            return ResponseEntity.ok(fileUrl);

        } catch (IOException e) {
            logger.error("Error uploading file: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // Helper method to get file extension
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf(".");
        return lastDot == -1 ? "" : fileName.substring(lastDot + 1);
    }

    // Helper method to validate file type (optional)
    private boolean isValidFileType(String fileExtension) {
        // Here you can add other valid file extensions if needed
        String[] allowedExtensions = {"jpg", "jpeg", "png", "gif", "bmp"};
        for (String ext : allowedExtensions) {
            if (fileExtension.equalsIgnoreCase(ext)) {
                return true;
            }
        }
        return false;
    }
}
