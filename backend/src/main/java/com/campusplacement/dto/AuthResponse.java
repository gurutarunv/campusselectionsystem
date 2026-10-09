package com.campusplacement.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfo user;

    public AuthResponse() {}

    public AuthResponse(String token, long expiresIn, UserInfo user) {
        this.token = token;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public static class UserInfo {
        private Long id;
        private String email;
        private String role;
        private String fullName;

        public UserInfo() {}

        public UserInfo(Long id, String email, String role, String fullName) {
            this.id = id;
            this.email = email;
            this.role = role;
            this.fullName = fullName;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }
}
