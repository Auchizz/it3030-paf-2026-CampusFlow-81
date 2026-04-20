package com.smartcampus.repository;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByOrderByFullNameAsc();
    List<User> findByRole(Role role);
    List<User> findByRoleInOrderByFullNameAsc(List<Role> roles);
}
