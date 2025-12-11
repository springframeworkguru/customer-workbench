package com.s7fundops.customerworkbench;

import org.springframework.boot.SpringApplication;

public class TestCustomerWorkbenchApplication {

    static void main(String[] args) {
        SpringApplication.from(CustomerWorkbenchApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
