package com.example.deskclean;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DeskcleanApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeskcleanApplication.class, args);
	}

}
