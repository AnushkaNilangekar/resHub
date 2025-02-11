# Starting resHub
Spring Boot
- Make sure maven is downloaded
- Go into backend/resHub/
- Run mvn spring-boot:run
- Download ngrok if you don't already have it
- Do ngrok http 8080
    - Or whatever port Spring Boot is running on
- Change the API_BASE_URL value in frontend/config.js file to the ngrok url
    - e.g. API_BASE_URL: "https://<code>.ngrok-free.app"
    - If the config.js file does not exist then create one in frontend
    - Do not push the config.js
AWS Credentials
- Do aws configure and enter the prompted information
  
