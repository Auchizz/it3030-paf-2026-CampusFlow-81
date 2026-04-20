package com.smartcampus.payload;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTicketRequest {
    @NotNull
    private Long technicianId;
}
