package com._7.reshub.reshub.Utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import com._7.reshub.reshub.Utils.JwtUtil; // Your JwtUtil class that handles JWT creation/validation
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;


@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil; // Utility for token validation

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = getJwtFromRequest(request);

        if (token != null && jwtUtil.validateToken(token)) {
            
            String username = jwtUtil.getUsernameFromToken(token);

            // Create an authentication object
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username, null, null // Here, you may include roles/authorities
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set the authentication object in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Continue with the next filter in the chain
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Extract token
        }
        return null;
    }
}
