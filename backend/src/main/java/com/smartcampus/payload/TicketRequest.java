package com.smartcampus.payload;

import com.smartcampus.model.TicketPriority;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TicketRequest {
    private Long resourceId;

    private String location;

    @NotBlank
    private String category;

    @NotBlank
    private String description;

    @NotNull
    private TicketPriority priority;

    @NotBlank
    private String preferredContact;

    private String attachment1;
    private String attachment2;
    private String attachment3;
}
