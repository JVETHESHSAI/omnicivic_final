package com.omnicivic.automation.pages;

import com.omnicivic.automation.base.BasePage;
import com.omnicivic.automation.base.TestConfig;
import com.omnicivic.automation.model.TestUser;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {
  private static final By USERNAME = By.id("user-input");
  private static final By PASSWORD = By.id("pwd-input");
  private static final By SUBMIT = By.cssSelector("button[type='submit']");
  private static final By TITLE = By.cssSelector(".form-title");

  public LoginPage(WebDriver driver, TestConfig config) {
    super(driver, config);
  }

  public LoginPage open() {
    openPath("/login");
    return waitUntilLoaded();
  }

  public LoginPage waitUntilLoaded() {
    waitVisible(TITLE);
    waitVisible(USERNAME);
    waitVisible(PASSWORD);
    return this;
  }

  public void loginAs(TestUser user) {
    type(USERNAME, user.getUsername());
    type(PASSWORD, user.getPassword());
    click(SUBMIT);
    waitForDocumentReady();
    wait.until(d -> d.getCurrentUrl().contains("/dashboard"));
  }
}
