package com._7.reshub.reshub.Utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.util.Date;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
    
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour expiration
                .signWith(SECRET_KEY)
                .compact();
    }

    // Validate the JWT token
    public boolean validateToken(String token) {
        try {
            // Extract the claims from the token
            Claims claims = extractClaims(token);
            // Check if the token has expired
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
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}