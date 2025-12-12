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