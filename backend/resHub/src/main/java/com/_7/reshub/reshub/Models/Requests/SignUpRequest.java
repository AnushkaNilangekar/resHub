package com._7.reshub.reshub.Models.Requests;

 // Map the JSON body of the signup request
 public class SignUpRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    // Getters and setters (for Spring to map JSON to this class)
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
