/*package com._7.reshub.reshub.Utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import java.util.Base64;
import java.util.Date;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class JwtUtil {
    
    private final SecretKey SECRET_KEY;

     public JwtUtil(@Value("${jwt.secret}") String secret) {
        // String secret = System.getenv("JWT_SECRET_KEY"); // Read from environment
        if (secret == null || secret.isEmpty()) {
            throw new IllegalStateException("JWT_SECRET environment variable is not set");
        }
        this.SECRET_KEY = new SecretKeySpec(secret.getBytes(), SignatureAlgorithm.HS256.getJcaName());
    }

    public String generateToken(String email) {
        // Get current issued time (truncated to seconds)
        Instant issuedAt = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        
        // Set expiration time to 30 days from now
        Instant expiration = issuedAt.plus(30, ChronoUnit.DAYS);


        // Build and return the JWT
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(Date.from(issuedAt))
                .setExpiration(Date.from(expiration))
                .signWith(SECRET_KEY)
                .compact();
    }


    // Validate the JWT token
    public boolean validateToken(String token) {
        try {
            // Extract the claims from the token
            Claims claims = extractClaims(token);
            // // Check if the token has expired
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            // Log the error and return false for invalid token
            return false;
        }
    }

    // Get the username (subject) from the JWT token
    public String getUsernameFromToken(String token) {
        Claims claims = extractClaims(token);
        return claims.getSubject();
    }

    // Extract claims from the JWT token
    private Claims extractClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();  // Retrieve the claims payload
        } catch (Exception e) {
            System.out.println("Error parsing JWT: " + e.getMessage());
            return null;
        }
    }
}*/