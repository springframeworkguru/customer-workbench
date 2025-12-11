package com.s7fundops.customerworkbench.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionSearchCriteria {

    private Integer customerId;
    private Integer productId;
    private InteractionType interactionType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}