package com._7.reshub.reshub.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
/*import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeAction;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.AttributeValueUpdate;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;*/
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import java.io.IOException;
//import java.util.HashMap;
//import java.util.Map;
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

            // Validate file type
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String contentType = file.getContentType();
            if (!isValidFileType(fileExtension, contentType)) {
                String errorResponse = "{\"message\": \"Invalid file type. Only image files are allowed.\"}";
                return ResponseEntity.status(400).body(errorResponse);
            }

            // Generate a unique file name
            String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();


            // Upload file to S3
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(BUCKET_NAME)
                    .key(fileName)
                    .contentType(contentType)
                    .build(),
                RequestBody.fromBytes(file.getBytes())
            );

            // Return the file URL after upload
            String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/" + fileName;

            // Return a JSON response with the file URL
            String successResponse = "{\"url\": \"" + fileUrl + "\"}";
            return ResponseEntity.ok(successResponse);

        } catch (IOException e) {
            String errorResponse = "{\"message\": \"Upload failed: " + e.getMessage() + "\"}";
            return ResponseEntity.status(500).body(errorResponse);
        } catch (Exception e) {
            String errorResponse = "{\"message\": \"An unexpected error occurred.\"}";
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf(".");
        return lastDot == -1 ? "" : fileName.substring(lastDot + 1);
    }

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
