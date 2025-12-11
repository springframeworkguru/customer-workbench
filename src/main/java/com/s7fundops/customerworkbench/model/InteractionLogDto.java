package com.s7fundops.customerworkbench.model;

import com.opencsv.bean.CsvBindByName;
import com.opencsv.bean.CsvIgnore;
import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@Builder
public class InteractionLogDto {

    @CsvIgnore
    private Long id;

    @CsvBindByName(column = "product_id")
    @NotNull
    private Integer productId;

    @CsvBindByName(column = "customer_id")
    @NotNull
    private Integer customerId;

    @CsvBindByName(column = "interaction_type")
    @NotNull
    private InteractionType interactionType;

    @CsvBindByName(column = "customer_rating")
    private Integer customerRating;

    @CsvBindByName(column = "feedback")
    private String feedback;

    @CsvBindByName(column = "interaction_date")
    private LocalDateTime interactionDate;

    @CsvBindByName(column = "responses_from_customer_support")
    private String responsesFromCustomerSupport;
}
