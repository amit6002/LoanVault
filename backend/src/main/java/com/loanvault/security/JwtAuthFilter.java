package com.loanvault.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ============================================================
 * JWT AUTHENTICATION FILTER
 * Intercepts every HTTP request. Reads the Authorization header,
 * validates the JWT token, and sets the Spring Security context
 * so the user is treated as authenticated for this request.
 *
 * Flow: Request → Extract JWT → Validate → Set SecurityContext → Continue
 * ============================================================
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // 2. Skip if header is missing or doesn't start with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the raw JWT (remove "Bearer " prefix)
        final String jwt = authHeader.substring(7);

        try {
            // 4. Extract email from the token
            final String userEmail = jwtService.extractUsername(jwt);

            // 5. If we have an email and no existing auth in context
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Load user from DB
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // 7. Validate the token
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 8. Create auth token and set in security context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("Authenticated user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.warn("JWT validation failed for request to {}: {}", request.getRequestURI(), e.getMessage());
        }

        // 9. Continue the filter chain regardless
        filterChain.doFilter(request, response);
    }
}
