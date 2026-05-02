package com.slack.slackjarservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @author zhn
 */
@SpringBootApplication
@EnableScheduling
public class SlackjarServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SlackjarServiceApplication.class, args);
    }
}
