package com.enterprisepm.controller;

import com.enterprisepm.dto.AuthResponse;
import com.enterprisepm.dto.LoginRequest;
import com.enterprisepm.dto.RegisterRequest;
import com.enterprisepm.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        Cookie cookie = new Cookie("jwt", auth.getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false); //  (HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtExpiration / 1000));
        response.addCookie(cookie);
        // Return user info only — no token in body
        return ResponseEntity.ok(new AuthResponse(null, auth.getName(), auth.getEmail(), auth.getRole()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getMe(userDetails.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse> updateMe(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.updateMe(
                userDetails.getUsername(),
                body.get("name"),
                body.get("email")));
    }
}
