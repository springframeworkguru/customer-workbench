package com.s7fundops.customerworkbench.repositories;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface InteractionLogRepository extends JpaRepository<InteractionLog, Long>, JpaSpecificationExecutor<InteractionLog> {
}
