package com.s7fundops.customerworkbench.domain;

import com.s7fundops.customerworkbench.model.InteractionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interaction_log")
@Getter
@Setter
public class InteractionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @NotNull
    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "interaction_type", nullable = false, length = 32)
    private InteractionType interactionType;

    @Column(name = "customer_rating")
    private Integer customerRating;

    @Lob
    @Column(name = "feedback", columnDefinition = "text")
    private String feedback;

    @Column(name = "interaction_date")
    private LocalDateTime interactionDate;

    @Lob
    @Column(name = "responses_from_customer_support", columnDefinition = "text")
    private String responsesFromCustomerSupport;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "date_created", updatable = false)
    private LocalDateTime dateCreated;

    @UpdateTimestamp
    @Column(name = "date_updated")
    private LocalDateTime dateUpdated;
}
