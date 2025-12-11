Project: S7/customer-workbench — Development Guidelines (project-specific)

Overview
- Spring Boot 4.0.0 (parent), Java 25, single-module Maven project.
- Primary focus areas enabled: Data JPA, Flyway, Validation, Web MVC, MapStruct, Lombok, Testcontainers (PostgreSQL), H2 (runtime option), Docker Compose integration.

1) Build and Configuration Instructions
- JDK: 25. The Maven compiler plugin is set to release 25. Use a matching JDK for build/IDE.
- MapStruct & Lombok annotation processing:
  - pom.xml preconfigures MapStruct processor, Lombok, and lombok-mapstruct-binding under the maven-compiler-plugin with `-Amapstruct.defaultComponentModel=spring`.
  - MapStruct library version is pinned via property: `${org.mapstruct.version}`.
- Testcontainers & Docker:
  - Testcontainers is wired through `TestcontainersConfiguration` and `@Import` in test classes; only tests importing that configuration boot a PostgreSQL container.
  - Docker must be running to execute such tests. If you only run plain unit tests (no Spring context, no Testcontainers import), Docker is not required.
- Flyway:
  - Starter on classpath; no migrations are present yet. Flyway will create `flyway_schema_history` and report “No migrations found” during test boot if Testcontainers-backed tests start the app context.
- Docker Compose support:
  - `spring-boot-docker-compose` is included; `compose.yaml` defines a postgres service. Spring Boot can manage lifecycle when the app is launched (not needed for plain unit tests). For local app runs, ensure Docker Desktop is running.

2) Testing Information
- Frameworks: JUnit 5 (Surefire on JUnit Platform), Spring Boot test starters, Testcontainers (PostgreSQL), and optional H2 at runtime.
- Notes on Testcontainers usage:
  - Only tests importing `TestcontainersConfiguration` will start a PostgreSQL container (see `CustomerWorkbenchApplicationTests` with `@Import(TestcontainersConfiguration.class)`).
  - If Docker is not available, avoid importing that config and prefer plain unit tests or slice tests using H2 where applicable.
- H2 vs PostgreSQL in tests:
  - H2 is declared as a runtime dependency. If you add JPA-layer tests that do not require PostgreSQL-specific features, you can configure a test profile to point to H2 and avoid Testcontainers.
- Adding new tests — guidelines:
  - Plain unit tests (preferred default for logic):
    - Place in `src/test/java` under the corresponding package. Avoid Spring context; import nothing from Spring. These run fast and need no Docker.
  - Spring Boot slice/integration tests without DB:
    - Use `@SpringBootTest` or slices (`@WebMvcTest`, etc.) cautiously. Keep the context lean and avoid importing `TestcontainersConfiguration` unless DB is required.
  - Database integration tests with PostgreSQL:
    - Add `@Import(TestcontainersConfiguration.class)` and `@SpringBootTest` (or data slice) to use a disposable PostgreSQL container.
    - Place migrations under `src/main/resources/db/migration` if your test expects schema; Flyway will apply them on startup.
  - Database tests with H2 (fast path):
    - Configure a `@TestPropertySource` or `@DynamicPropertySource` to point to H2 JDBC URL, or create a dedicated `application-test.properties`. Do not import `TestcontainersConfiguration`.

Demonstration flow (performed and validated)
1) Full suite (with Testcontainers):
   - Ran: `./mvnw -DskipTests=false test` → Started Spring Boot 4.0.0, launched PostgreSQL container via Testcontainers 2.0.2, Flyway created schema history; BUILD SUCCESS.
2) Single plain unit test class (no Spring):
   - Added a trivial test, executed `./mvnw -Dtest=DemoGuidelinesTest test` → BUILD SUCCESS, no Docker required.
   - Removed the demo test to keep the repo clean, as requested in this task.

3) How to add and execute new tests (templates)
- Plain JUnit 5 test template:
  ```java
  package com.s7fundops.somepkg;

  import org.junit.jupiter.api.Test;
  import static org.assertj.core.api.Assertions.assertThat;

  class MyUnitTest {
      @Test
      void addsNumbers() {
          assertThat(2 + 3).isEqualTo(5);
      }
  }
  ```
  Run: `./mvnw -Dtest=MyUnitTest test`

- Spring Boot + Testcontainers template (PostgreSQL):
  ```java
  package com.s7fundops.somepkg;

  import org.junit.jupiter.api.Test;
  import org.springframework.boot.test.context.SpringBootTest;
  import org.springframework.context.annotation.Import;

  @Import(com.s7fundops.customerworkbench.TestcontainersConfiguration.class)
  @SpringBootTest
  class MyPostgresIT {
      @Test
      void contextLoadsAgainstPostgres() {
      }
  }
  ```
  Run: `./mvnw -Dtest=MyPostgresIT test` (Docker required)

4) Additional Development Information
- Code style & layout:
  - Java package root: `com.s7fundops.customerworkbench` (main app under `src/main/java`).
  - Keep tests in matching packages under `src/test/java` for access to package-private members when needed.
  - Prefer AssertJ for fluent assertions in new tests; JUnit Jupiter is already present.
- MapStruct usage:
  - When adding mappers, declare `@Mapper(componentModel = "spring")` so generated implementations are Spring beans.
  - If you see warnings like “The following options were not recognized by any processor: '[mapstruct.defaultComponentModel]’” during test compile, it is informational and can be ignored; the processor still runs via the configured APT paths.
- Lombok notes:
  - The project includes Lombok and `lombok-mapstruct-binding`; ensure your IDE has Lombok plugin installed and annotation processing enabled.
- Flyway migrations:
  - Place versioned SQL files under `src/main/resources/db/migration` (e.g., `V1__init.sql`). These will be applied automatically on app/test startup when a datasource is present.
- Database options:
  - `compose.yaml` provides a PostgreSQL service. For app runs with Docker compose integration, ensure Docker Desktop is running; Spring Boot can manage the container lifecycle.
  - For faster feedback loops, prefer H2 for logic-layer tests and keep PostgreSQL/Testcontainers for persistence behavior validation and PostgreSQL-specific features.

Troubleshooting
- Docker not running but Testcontainers test selected → tests hang/fail. Either start Docker or avoid importing `TestcontainersConfiguration`.
- “No migrations found” on startup → expected if `db/migration` directory is empty; add Flyway scripts when schema is needed.
- MapStruct classes not generated in IDE → enable annotation processing; run `./mvnw -DskipTests=false compile` to force generation.
- Mockito warning about dynamic agents on newer JDKs → informational; tests still pass. Consider configuring the Mockito agent explicitly if needed in the future.

Appendix: Key Files
- `pom.xml`: Spring Boot 4.0.0, Java 25, MapStruct `${org.mapstruct.version}`, Lombok, Testcontainers, Flyway.
- `src/test/java/.../CustomerWorkbenchApplicationTests.java`: boots Spring context; imports Testcontainers config.
- `src/test/java/.../TestcontainersConfiguration.java`: declares a `PostgreSQLContainer` bean with `@ServiceConnection`.
- `compose.yaml`: PostgreSQL service definition for local runs with Spring Boot Docker Compose support.
- `src/main/resources/application.properties`: base application name only; no datasource configured for main runtime.

All example commands and flows in this document were executed and validated on 2025-12-10. No temporary files remain from the demonstration.
