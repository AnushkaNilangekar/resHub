// package com._7.reshub.reshub.Configs;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.core.annotation.Order;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// public class WebSocketSecurityConfig {

//     @Bean
//     @Order(1) // Ensure this config is applied before the main SecurityConfig
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//             .securityMatcher("/ws/**") // Replace antMatcher with securityMatcher
//             .authorizeHttpRequests(auth -> auth
//                 .anyRequest().permitAll()
//             )
//             .csrf(csrf -> csrf.disable()); // Use lambda for csrf config

//         return http.build();
//     }
// }