package com._7.reshub.reshub.Configs;


import com._7.reshub.reshub.Utils.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import jakarta.servlet.Filter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API usage
            .csrf(csrf -> csrf.disable())
            // Configure request authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(new AntPathRequestMatcher("/api/login")).permitAll() // Allow /api/login
                .requestMatchers(new AntPathRequestMatcher("/api/signup")).permitAll() // Allow /api/signup
                .requestMatchers(new AntPathRequestMatcher("/api/forgot-password")).permitAll() // Allow /api/forgot-password
                .requestMatchers(new AntPathRequestMatcher("/api/reset-password")).permitAll() // Allow /api/reset-password
                .anyRequest().authenticated()

            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) // Add JWT filter
            // Enable HTTP Basic authentication
            .httpBasic(Customizer.withDefaults());
        
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Default strength is 10
    }
}
