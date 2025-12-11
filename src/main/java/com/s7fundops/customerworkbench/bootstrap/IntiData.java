package com.s7fundops.customerworkbench.bootstrap;

import com.s7fundops.customerworkbench.domain.InteractionLog;
import com.s7fundops.customerworkbench.mappers.InteractionLogMapper;
import com.s7fundops.customerworkbench.repositories.InteractionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class IntiData implements CommandLineRunner {

    private final InteractionLogRepository interactionLogRepository;
    private final InteractionLogMapper interactionLogMapper;

    @Override
    public void run(String... args) {
        if (interactionLogRepository.count() == 0) {
            List<Long> createdIds = new ArrayList<>(5);

            for (int i = 0; i < 5; i++) {
                var dto = DataUtil.randomInteraction();
                dto.setId(null);

                InteractionLog saved = interactionLogRepository.save(interactionLogMapper.toEntity(dto));
                createdIds.add(saved.getId());
                log.info("Saved InteractionLog {}", saved);
            }

            log.info("Initialized InteractionLog data with ids: {}", createdIds);
        } else {
            log.info("########### InteractionLog data already initialized");
            log.info("Count is {}", interactionLogRepository.count());

            interactionLogRepository.findAll().forEach(interactionLog -> log.info("{}", interactionLog));

        }
    }
}