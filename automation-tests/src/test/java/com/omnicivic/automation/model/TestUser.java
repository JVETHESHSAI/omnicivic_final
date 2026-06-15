package com.omnicivic.automation.model;

public class TestUser {
  private final String label;
  private final String username;
  private final String password;

  public TestUser(String label, String username, String password) {
    this.label = label;
    this.username = username;
    this.password = password;
  }

  public String getLabel() {
    return label;
  }

  public String getUsername() {
    return username;
  }

  public String getPassword() {
    return password;
  }
}
