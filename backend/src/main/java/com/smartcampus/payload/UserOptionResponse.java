package com.smartcampus.payload;

import com.smartcampus.model.Role;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserOptionResponse {
    Long id;
    String fullName;
    String email;
    Role role;
}
