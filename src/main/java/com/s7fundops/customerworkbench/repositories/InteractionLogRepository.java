package com.s7fundops.customerworkbench.repositories;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InteractionLogRepository extends JpaRepository<InteractionLog, Long> {
}
