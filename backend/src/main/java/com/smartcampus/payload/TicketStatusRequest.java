package com.smartcampus.payload;

import com.smartcampus.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusRequest {
    @NotNull
    private TicketStatus status;
    private String resolutionNotes;
    private String rejectionReason;
}
