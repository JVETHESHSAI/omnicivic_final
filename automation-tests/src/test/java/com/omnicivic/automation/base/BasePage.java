package com.omnicivic.automation.base;

import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class BasePage {
  protected final WebDriver driver;
  protected final TestConfig config;
  protected final WebDriverWait wait;

  protected BasePage(WebDriver driver, TestConfig config) {
    this.driver = driver;
    this.config = config;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(config.getTimeoutSeconds()));
  }

  protected void openPath(String path) {
    String normalized = path.startsWith("/") ? path : "/" + path;
    driver.navigate().to(config.getBaseUrl() + normalized);
    waitForDocumentReady();
  }

  protected WebElement waitVisible(By locator) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
  }

  protected void waitInvisible(By locator) {
    wait.until(ExpectedConditions.invisibilityOfElementLocated(locator));
  }

  protected void click(By locator) {
    WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
    try {
      element.click();
    } catch (RuntimeException ex) {
      ((JavascriptExecutor) driver).executeScript("arguments[0].click();", element);
    }
  }

  protected void type(By locator, String value) {
    WebElement element = waitVisible(locator);
    element.clear();
    element.sendKeys(value);
  }

  protected boolean isVisible(By locator) {
    return !driver.findElements(locator).isEmpty() && driver.findElement(locator).isDisplayed();
  }

  protected boolean exists(By locator) {
    List<WebElement> elements = driver.findElements(locator);
    return !elements.isEmpty();
  }

  protected void selectOptionContaining(By locator, String text) {
    Select select = new Select(waitVisible(locator));
    for (WebElement option : select.getOptions()) {
      if (option.getText().contains(text)) {
        select.selectByVisibleText(option.getText());
        return;
      }
    }
    throw new IllegalStateException("Could not find option containing '" + text + "'");
  }

  protected void waitForDocumentReady() {
    wait.until(d -> {
      Object state = ((JavascriptExecutor) d).executeScript("return document.readyState");
      return "complete".equals(state);
    });
  }

  protected String xpathLiteral(String value) {
    if (!value.contains("'")) {
      return "'" + value + "'";
    }
    if (!value.contains("\"")) {
      return "\"" + value + "\"";
    }
    StringBuilder builder = new StringBuilder("concat(");
    String[] parts = value.split("'");
    for (int i = 0; i < parts.length; i++) {
      if (i > 0) {
        builder.append(", \"'\", ");
      }
      builder.append("'").append(parts[i]).append("'");
    }
    builder.append(")");
    return builder.toString();
  }
}
