    package com.example.auth_service.model;

    import jakarta.persistence.*;
    import jakarta.validation.constraints.Email;
    import jakarta.validation.constraints.NotBlank;
    import lombok.*;
    import lombok.experimental.SuperBuilder;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;
    import java.util.Collection;
    import java.util.Collections;

    @Entity
    @Table(name = "users") 
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @SuperBuilder
    @Inheritance(strategy = InheritanceType.TABLE_PER_CLASS) 
    @DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
    @DiscriminatorValue("USER")
    public class User implements UserDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)  
        private Integer id;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Second name is required")
        private String secondName;

        @NotBlank(message = "tel is required")
        private String tel;

        @Email(message = "Invalid email address")
        @NotBlank(message = "Email is required")
        @Column(unique = true)
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private Role role;

        private String verificationCode;

        @Column(nullable = false)
        private boolean enabled = false;

        @Column(nullable = false)
        private boolean validated = false;

      

        public User(String name, String secondName, String email, String password, Role role) {
            this.name = name;
            this.secondName = secondName;
            this.email = email;
            this.password = password;

            this.role = role;
            this.enabled = false;
            this.validated = false;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return Collections.emptyList();
        }

        @Override
        public String getUsername() {
            return this.email;
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return this.enabled;
        }
    }
