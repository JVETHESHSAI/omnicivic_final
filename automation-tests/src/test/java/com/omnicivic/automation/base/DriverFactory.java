package com.omnicivic.automation.base;

import io.github.bonigarcia.wdm.WebDriverManager;
import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

public final class DriverFactory {
  private DriverFactory() {
  }

  public static WebDriver create(TestConfig config) {
    WebDriver driver = switch (config.getBrowser()) {
      case "edge" -> createEdge(config);
      case "firefox" -> createFirefox(config);
      default -> createChrome(config);
    };

    driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(0));
    driver.manage().window().maximize();
    return driver;
  }

  private static WebDriver createChrome(TestConfig config) {
    WebDriverManager.chromedriver().setup();
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--disable-notifications");
    options.addArguments("--remote-allow-origins=*");
    if (config.isHeadless()) {
      options.addArguments("--headless=new", "--window-size=1440,1000");
    }
    return new ChromeDriver(options);
  }

  private static WebDriver createEdge(TestConfig config) {
    WebDriverManager.edgedriver().setup();
    EdgeOptions options = new EdgeOptions();
    options.addArguments("--disable-notifications");
    if (config.isHeadless()) {
      options.addArguments("--headless=new", "--window-size=1440,1000");
    }
    return new EdgeDriver(options);
  }

  private static WebDriver createFirefox(TestConfig config) {
    WebDriverManager.firefoxdriver().setup();
    FirefoxOptions options = new FirefoxOptions();
    if (config.isHeadless()) {
      options.addArguments("--headless");
    }
    return new FirefoxDriver(options);
  }
}
