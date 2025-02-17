package com._7.reshub.reshub.Configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API usage
            .csrf(csrf -> csrf.disable())
            // Configure request authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // Allow all endpoints under /api without authentication
                .anyRequest().authenticated()
            )
            // Enable HTTP Basic authentication
            .httpBasic(Customizer.withDefaults());
        
        return http.build();
    }
}
