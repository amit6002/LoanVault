# Multi-stage Dockerfile for Spring Boot deployment on Render
# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production JAR without running tests
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java Runtime environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/loanvault-backend-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
