FROM eclipse-temurin:25-jre

WORKDIR /app

# Build first with ./gradlew clean bootJar; copy only the executable Boot JAR.
COPY build/libs/back-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 80

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
