package com.loanvault.config;

import com.loanvault.security.CustomUserDetailsService;
import com.loanvault.security.JwtAuthFilter;
import com.loanvault.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * ============================================================
 * SPRING SECURITY CONFIGURATION
 * Configures:
 *  - Stateless JWT session management
 *  - Public vs protected route rules
 *  - Google OAuth2 login flow
 *  - Dynamic CORS allowing Vercel and Localhost
 *  - BCrypt password encoding
 *  - Role-based access (@PreAuthorize)
 * ============================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // Enables @PreAuthorize on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Main security filter chain — defines which routes are public
     * and which require authentication.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF (not needed for stateless JWT APIs)
            .csrf(AbstractHttpConfigurer::disable)

            // 2. Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Session management — STATELESS (no server-side sessions)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 4. Route authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — no token needed
                .requestMatchers(
                    "/api/auth/**",               // login, register, OTP
                    "/oauth2/**",                  // Google OAuth2 flow
                    "/login/oauth2/**",
                    "/error"
                ).permitAll()

                // Public GET for loan products (calculator)
                .requestMatchers(HttpMethod.GET, "/api/loan-products").permitAll()

                // Borrower-only routes
                .requestMatchers("/api/applications/my/**").hasRole("BORROWER")
                .requestMatchers("/api/loans/my/**").hasRole("BORROWER")
                .requestMatchers("/api/loans/summary/**").hasRole("BORROWER")
                .requestMatchers("/api/support/**").hasRole("BORROWER")

                // Officer-only routes
                .requestMatchers("/api/applications/queue/**").hasRole("OFFICER")
                .requestMatchers("/api/applications/*/recommend").hasRole("OFFICER")

                // Manager-only routes
                .requestMatchers("/api/applications/approval-queue/**").hasRole("MANAGER")
                .requestMatchers("/api/applications/*/approve").hasRole("MANAGER")
                .requestMatchers("/api/applications/*/reject").hasRole("MANAGER")
                .requestMatchers("/api/disbursements/**").hasRole("MANAGER")
                .requestMatchers("/api/manager/**").hasRole("MANAGER")

                // Admin-only routes
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/applications/all").hasRole("ADMIN")

                // All other requests require authentication
                .anyRequest().authenticated()
            )

            // 5. OAuth2 Login configuration
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )

            // 6. Add our JWT filter BEFORE Spring's username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            // 7. Set our custom user details service
            .authenticationProvider(authenticationProvider());

        return http.build();
    }

    /**
     * CORS configuration — allows Vercel deployment URLs and localhost.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow Vercel origins, custom frontend URL, and local dev
        config.setAllowedOriginPatterns(List.of(
            "https://*.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "*",
            frontendUrl
        ));

        // Allow common HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow all headers (Authorization, Content-Type, etc.)
        config.setAllowedHeaders(List.of("*"));

        // Allow cookies/auth headers in requests
        config.setAllowCredentials(true);

        // Cache preflight for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
