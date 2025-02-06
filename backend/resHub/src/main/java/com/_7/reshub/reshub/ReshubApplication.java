package com._7.reshub.reshub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication
@RestController
public class ReshubApplication {

	@GetMapping("/hello")
    public String check() {
        return "Hello World";
    }

	public static void main(String[] args) {
		SpringApplication.run(ReshubApplication.class, args);
	}

}
