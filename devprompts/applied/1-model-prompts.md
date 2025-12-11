Complete the following tasks:

1. In the package `com.s7fundops.model` create a Java Enum called `InteractionType` with the values of CHAT, EMAIL, TICKET, FORM.
2. In the package `com.s7fundops.model` create a Java POJO with Lombok, @Data, and @Builder called
`InteractionLogDto` with the properties:
   * id - Long
   * productId - Integer, not null
   * customerId - Integer, not null
   * interactionType (ENUM, not null)
   * customerRating - Integer
   * feedback - String
   * interactionDate - LocalDateTime
   * responsesFromCustomerSupport - String

3. In the package `com.s7fundops.domain` create a new JPA Entity called `InteractionLog` using the same properties
and validation constraints as `InteractionLogDto`. Add JPA Version Property and JPA properties for dateCreated, and dateUpdated. The String
properties should be mapped to a CLOB JPA type.

4. In the directory `src/main/resources/db/migration`

5. In the package `com.s7fundops.repositories` create a Spring Data JPA repository for `InteractionLog`. Create 
an integration test using H2 to test persistence and validation. 

6. In the package `com.s7fundops.mappers` create Mapstruct mapper to convert to/from `InteractionLogDto` and
   `InteractionLog`. Create a unit test and verify mappings are correct.

