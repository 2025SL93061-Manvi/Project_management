package com.enterprisepm.service;

import com.enterprisepm.dto.AuthResponse;
import com.enterprisepm.dto.LoginRequest;
import com.enterprisepm.dto.RegisterRequest;
import com.enterprisepm.model.Role;
import com.enterprisepm.model.User;
import com.enterprisepm.repository.UserRepository;
import com.enterprisepm.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setName("Alice");
        existingUser.setEmail("alice@test.com");
        existingUser.setPassword("encoded");
        existingUser.setRole(Role.DEVELOPER);
        existingUser.setEnabled(true);
    }

    @Test
    void register_savesUserAndReturnsSuccessMessage() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Bob");
        req.setEmail("bob@test.com");
        req.setPassword("secret123");
        req.setRole("DEVELOPER");

        when(userRepository.existsByEmail("bob@test.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded");

        String result = authService.register(req);

        assertThat(result).isEqualTo("User registered successfully");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("alice@test.com");
        when(userRepository.existsByEmail("alice@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");
    }

    @Test
    void login_returnsAuthResponseWithToken() {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@test.com");
        req.setPassword("password");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("jwt-token");
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(existingUser));

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        assertThat(response.getName()).isEqualTo("Alice");
    }

    @Test
    void getMe_returnsUserDetails() {
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(existingUser));

        AuthResponse response = authService.getMe("alice@test.com");

        assertThat(response.getName()).isEqualTo("Alice");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        assertThat(response.getRole()).isEqualTo("DEVELOPER");
    }

    @Test
    void getMe_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.getMe("unknown@test.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void updateMe_updatesNameAndEmail() {
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("newalice@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        AuthResponse response = authService.updateMe("alice@test.com", "Alice Updated", "newalice@test.com");

        assertThat(response).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateMe_throwsWhenNewEmailAlreadyInUse() {
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.existsByEmail("taken@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.updateMe("alice@test.com", "Alice", "taken@test.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already in use");
    }
}
