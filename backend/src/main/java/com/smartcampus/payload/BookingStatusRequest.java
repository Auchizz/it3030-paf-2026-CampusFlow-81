package com.smartcampus.payload;

import com.smartcampus.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusRequest {
    @NotNull
    private BookingStatus status;
    private String reason;
}
