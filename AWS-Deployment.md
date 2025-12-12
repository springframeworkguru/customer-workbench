# AWS Deployment

The application will be bundled into an executable JAR file. The JAR file will include all of the necessary dependencies,
and the web resources bundled into the `resources/static` folder. This approach ensures that the application is self-contained
and can be easily deployed to AWS or other cloud providers.

There are several options to deploy the application to AWS. The most straightforward approach is to use the AWS Elastic Beanstalk
service. Elastic Beanstalk simplifies the process of deploying and managing applications on AWS, providing automatic 
scaling, load balancing, and health monitoring.

The application does require a PostgreSQL database to be running. Elastic Beanstalk supports PostgreSQL as a managed service,
making it easy to set up and manage the database alongside the application. The database settings can easily be passed
to the application via environment variables. This approach ensures that the database configuration is decoupled from the
application code, making it easier to manage and deploy the application in different environments.

A custom domain name can also be associated with the application. This domain can be configured Route 53 to point to the
Elastic Beanstalk application URL. AWS can also be configured to automatically renew the SSL certificate for the domain.

## AWS Deployment Configuration
The following environment variables need to be set in the Elastic Beanstalk application configuration:- `SPRING_PROFILES_ACTIVE`: Set to `prod` to enable production mode
- `SPRING_DATASOURCE_URL`: The JDBC URL for the PostgreSQL database
- `SPRING_DATASOURCE_USERNAME`: The username for the PostgreSQL database
- `SPRING_DATASOURCE_PASSWORD`: The password for the PostgreSQL database
- `SPRING_JPA_HIBERNATE_DDL_AUTO`: Set to `validate` to ensure the database schema matches the application model
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME`: Set to `org.postgresql.Driver`
- `SPRING_FLYWAY_ENABLED`: Set to `true` to enable Flyway database migrations
- `SERVER_PORT`: The port number for the application to listen on (default: 8080)
- `JAVA_OPTS`: Set to `-Xmx2048m -Xms1024m`, adjust as necessary depending on deployment environment

## AWS Beanstalk Configuration
The backend application can be configured to use health checks via Spring Boot Actuator to ensure the application is running correctly.

#### Example Configuration Snippet
```yaml
        readinessProbe:
          httpGet:
            port: 8080 # Set to server port
            path: /actuator/health/readiness
        livenessProbe:
          httpGet:
            port: 8080
            path: /actuator/health/liveness
```