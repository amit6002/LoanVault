package com.loanvault.security;

import com.loanvault.dto.response.JwtResponse;
import com.loanvault.entity.User;
import com.loanvault.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * ============================================================
 * OAUTH2 SUCCESS HANDLER
 * Called by Spring Security after a successful Google login.
 *
 * Flow:
 * 1. Google redirects to /login/oauth2/code/google
 * 2. Spring Security processes the OAuth2 code and fetches user info
 * 3. This handler is invoked with the authenticated OAuth2User
 * 4. We find-or-create the user in our database
 * 5. Generate a JWT token
 * 6. Redirect to frontend with JWT as query param:
 *    http://localhost:5173/oauth2/callback?token=<jwt>
 * ============================================================
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");  // Google's unique user ID

        log.info("Google OAuth2 login for: {}", email);

        // Find existing user or create new one
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                // Auto-register the user as a BORROWER
                User newUser = User.builder()
                    .name(name)
                    .email(email)
                    .googleId(googleId)
                    .role(User.Role.BORROWER)
                    .authProvider(User.AuthProvider.GOOGLE)
                    .enabled(true)
                    .kycVerified(false)
                    .build();
                return userRepository.save(newUser);
            });

        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        // If user registered with password earlier, link their Google ID
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
        }
        userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(user, user.getRole().name());

        // Build redirect URL to React frontend callback page with token
        String redirectUrl = UriComponentsBuilder
            .fromUriString(frontendUrl + "/oauth2/callback")
            .queryParam("token", token)
            .queryParam("name", user.getName())
            .queryParam("email", user.getEmail())
            .queryParam("role", user.getRole().name())
            .build().toUriString();

        log.info("Redirecting OAuth2 user to frontend: {}", frontendUrl + "/oauth2/callback");
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
