package com.example.deskclean.config;

import com.example.deskclean.server.ChatServer;
import jakarta.servlet.ServletContext;
import jakarta.websocket.server.ServerContainer;
import jakarta.websocket.server.ServerEndpointConfig;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebSocketConfig {

    @Bean
    public CustomSpringConfigurator customSpringConfigurator() {
        return new CustomSpringConfigurator();
    }

    @Bean
    public org.springframework.web.socket.server.standard.ServerEndpointExporter serverEndpointExporter() {
        System.out.println("=== ServerEndpointExporter Bean created ===");
        return new org.springframework.web.socket.server.standard.ServerEndpointExporter();
    }

    @Bean
    public ServletContextInitializer servletContextInitializer() {
        return new ServletContextInitializer() {
            @Override
            public void onStartup(ServletContext servletContext) {
                try {
                    System.out.println("=== ServletContextInitializer.onStartup called ===");
                    ServerContainer serverContainer = (ServerContainer) servletContext.getAttribute("jakarta.websocket.server.ServerContainer");
                    if (serverContainer == null) {
                        serverContainer = (ServerContainer) servletContext.getAttribute(ServerContainer.class.getName());
                    }
                    if (serverContainer != null) {
                        System.out.println("ServerContainer found: " + serverContainer.getClass().getName());
                        System.out.println("Adding ChatServer endpoint...");
                        serverContainer.addEndpoint(ChatServer.class);
                        System.out.println("ChatServer endpoint added successfully!");
                    } else {
                        System.err.println("ERROR: ServerContainer is null!");
                        System.err.println("Available attributes:");
                        java.util.Enumeration<String> attrs = servletContext.getAttributeNames();
                        while (attrs.hasMoreElements()) {
                            String attr = attrs.nextElement();
                            System.err.println("  - " + attr);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("=== ERROR in ServletContextInitializer ===");
                    e.printStackTrace();
                }
            }
        };
    }

    public static class CustomSpringConfigurator extends ServerEndpointConfig.Configurator implements ApplicationContextAware {

        private static volatile BeanFactory context;

        @Override
        public <T> T getEndpointInstance(Class<T> clazz) throws InstantiationException {
            try {
                System.out.println("=== CustomSpringConfigurator.getEndpointInstance called for: " + clazz.getName() + " ===");
                if (context == null) {
                    System.err.println("ERROR: ApplicationContext is null!");
                    throw new InstantiationException("ApplicationContext is not initialized");
                }
                System.out.println("Getting bean from context...");
                T instance = context.getBean(clazz);
                System.out.println("Bean instance created: " + (instance != null));
                return instance;
            } catch (Exception e) {
                System.err.println("=== ERROR in getEndpointInstance ===");
                System.err.println("Error message: " + e.getMessage());
                e.printStackTrace();
                throw new InstantiationException("Failed to instantiate endpoint: " + e.getMessage());
            }
        }

        @Override
        public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
            System.out.println("=== CustomSpringConfigurator.setApplicationContext called ===");
            CustomSpringConfigurator.context = applicationContext;
        }
    }
}