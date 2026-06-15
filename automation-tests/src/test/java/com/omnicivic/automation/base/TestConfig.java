package com.omnicivic.automation.base;

import com.omnicivic.automation.model.TestUser;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Properties;

public class TestConfig {
  private final Properties properties = new Properties();

  public TestConfig() {
    loadFromClasspath("config.properties", true);
    loadFromClasspath("config.local.properties", false);
  }

  private void loadFromClasspath(String resourceName, boolean required) {
    try (InputStream inputStream = Thread.currentThread()
        .getContextClassLoader()
        .getResourceAsStream(resourceName)) {
      if (inputStream == null) {
        if (required) {
          throw new IllegalStateException("Missing configuration resource: " + resourceName);
        }
        return;
      }
      properties.load(inputStream);
    } catch (IOException ex) {
      throw new IllegalStateException("Could not load configuration: " + resourceName, ex);
    }
  }

  public String getBaseUrl() {
    String value = getOptional("baseUrl", "http://localhost:4200");
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }

  public String getBrowser() {
    return getOptional("browser", "chrome").toLowerCase(Locale.ROOT);
  }

  public boolean isHeadless() {
    return Boolean.parseBoolean(getOptional("headless", "false"));
  }

  public int getTimeoutSeconds() {
    return Integer.parseInt(getOptional("timeout.seconds", "25"));
  }

  public String getCategoryName() {
    return require("test.categoryName");
  }

  public TestUser getResident() {
    return new TestUser("resident", require("resident.username"), require("resident.password"));
  }

  public TestUser getAdmin() {
    return new TestUser("admin", require("admin.username"), require("admin.password"));
  }

  public TestUser getStaff() {
    return new TestUser("staff", require("staff.username"), require("staff.password"));
  }

  private String require(String key) {
    String value = lookup(key);
    if (value == null || value.isBlank() || value.startsWith("CHANGE_ME")) {
      throw new IllegalStateException("Set a real value for '" + key + "' in config.properties or config.local.properties");
    }
    return value.trim();
  }

  private String getOptional(String key, String defaultValue) {
    String value = lookup(key);
    return value == null || value.isBlank() ? defaultValue : value.trim();
  }

  private String lookup(String key) {
    String systemValue = System.getProperty(key);
    if (systemValue != null && !systemValue.isBlank()) {
      return systemValue;
    }

    String envKey = key.toUpperCase(Locale.ROOT).replace('.', '_');
    String envValue = System.getenv(envKey);
    if (envValue != null && !envValue.isBlank()) {
      return envValue;
    }

    return properties.getProperty(key);
  }
}
