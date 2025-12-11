Project: S7/customer-workbench — Development Guidelines (project-specific)

Overview
- Spring Boot 4.0.0 (parent), Java 25, single-module Maven project.
- Primary focus areas enabled: Data JPA, Flyway, Validation, Web MVC, MapStruct, Lombok, Testcontainers (PostgreSQL), H2 (runtime option), Docker Compose integration.

## Project Structure
- `**/model/` - Java POJO DTOs
- `**/bootstrap/` - Statup configuration
- `**/controller/` - Spring MVC controllers
- `**/service/` - Business logic and services
- `**/repository/` - Spring Data JPA repositories
- `**/config/` - Configuration classes
- `**/mappers/` - Mapstruct mappers
- `**/domain/` - JPA entities

## Database Management
- Database migrations are managed with Flyway
- Migration scripts are in `data-chore/src/main/resources/db/migration/`
- Follow naming convention: `V<version>__<description>.sql`

## Java Coding Hints and Conventions
* The @MockBean annotation is deprecated. Use @MockitoBean instead.
* When writing unit tests, verify any required properties have values, unless testing an exception condition.
* When writing unit tests, be sure to test exception conditions, such as validation constraint errors, and ensure the correct exception is thrown.
* When writing unit tests for classes which implement an interface NEVER create a test implementation of the interface for the class under test.
* When adding properties to JPA entities or DTOs, add the new properties after other properties, but above the user, dateCreated, and dateUpdated properties.
* When refactoring classes DO NOT create .new or .tmp files. Refactor the class in place.

### DTO Conventions
- Use DTOs for Spring MVC controllers
- Name DTOs with `DTO` suffix
- For HTTP Get and List operations use <classname>DTO
- For HTTP Create operations use <classname>CreationDTO. Do not add the id, version, createdDate, or dateUpdated properties to the creation DTO. Ignore the id, version, createdDate, and dateUpdated these properties in MapStruct mappings.
- For HTTP Update operations use <classname>UpdateDTO. The update DTO should NOT include the id, createdDate, and dateUpdated properties. The version property should be used to check for optimistic locking.
- For HTTP Patch operations use <classname>PatchDTO. The patch DTO should NOT include the id, createdDate, and dateUpdated properties. The version property should be used to check for optimistic locking. Patch operations should be used to update a single property. The PatchDTO should NOT have validation annotations preventing null or empty values.

### JPA Conventions
- Use an `Interger` version property annotated with `@Version` for optimistic locking
- When mapping enumerations to database columns, use `@Enumerated(EnumType.STRING)` to store the enum name instead of the ordinal value.
- Use a property named `createdDate` of type `LocalDateTime` with `@CreationTimestamp` for the creation date. The column description should use `updatabele = false` to prevent updates to the createdDate property.
- Use a property named `dateUpdated` of type `LocalDateTime` with `@UpdateTimestamp` for the last update date.
- Do not use the Lombok `@Data` annotation on JPA entities. Use `@Getter` and `@Setter` instead.
- Do not add the '@Repository' annotation to the repository interface. The Spring Data JPA will automatically create the implementation at runtime.
- Use the `@Transactional` annotation on the service class to enable transaction management. The `@Transactional` annotation should be used on the service class and not on the repository interface.
- Use the `@Transactional(readOnly = true)` annotation on the read-only methods of the service class to enable read-only transactions. This will improve performance and reduce locking on the database.
- When adding methods to the repository interface, try to avoid using the `@Query` annotation. Use the Spring Data JPA method naming conventions to create the query methods. This will improve readability and maintainability of the code.
- In services when testing the return values of optionals, throw the `NotFoundException` if the optional is empty. This will provide a 404 response to the client. The `NotFoundException` should be thrown in the service class and not in the controller class.

### Mapstruct Conventions
- When creating mappers for patch operations, use the annotation `@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)` to ignore null values in the source object. This will prevent null values from overwriting existing values in the target object.
- Mapper implementations are generated at compile time. If the context is not loading because of missing dependencies, compile java/main to generate the mappers.

### Unit Test Conventions
- When creating unit tests, use datafaker to generate realistic test data values. See the class `PaymentProcessorBootStrap` for example usage.
- When creating or updating tests, use the Junit `@DisplayName` annotation to provide a human readable name for the test. This will improve the quality of the test report.
- When creating or updating tests, use the Junit `@Nested` annotation to group related tests. This will improve the readability of the test report.
- When investigating test failures of transaction tests, verify the service implementation uses saveAndFlush() to save the entity. This will ensure the entity is saved to the database before the transaction is committed.


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
