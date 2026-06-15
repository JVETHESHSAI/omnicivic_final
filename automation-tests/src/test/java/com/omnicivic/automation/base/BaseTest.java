package com.omnicivic.automation.base;

import com.omnicivic.automation.model.TestUser;
import com.omnicivic.automation.pages.ComplaintListPage;
import com.omnicivic.automation.pages.LoginPage;
import com.omnicivic.automation.pages.SubmitComplaintPage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public abstract class BaseTest {
  private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
  protected final TestConfig config = new TestConfig();
  protected WebDriver driver;

  protected void startBrowser() {
    driver = DriverFactory.create(config);
  }

  protected void stopBrowser() {
    if (driver != null) {
      driver.quit();
      driver = null;
    }
  }

  protected LoginPage loginPage() {
    return new LoginPage(driver, config);
  }

  protected SubmitComplaintPage submitComplaintPage() {
    return new SubmitComplaintPage(driver, config);
  }

  protected ComplaintListPage complaintListPage() {
    return new ComplaintListPage(driver, config);
  }

  protected void loginAs(TestUser user) {
    loginPage().open().loginAs(user);
  }

  protected void switchUser(TestUser user) {
    clearSession();
    loginAs(user);
  }

  protected String newComplaintDescription() {
    return "Automation complaint " + LocalDateTime.now().format(TS);
  }

  protected void submitComplaint(String categoryName, String description) {
    submitComplaintPage().open().submitComplaint(categoryName, description);
  }

  protected ComplaintListPage openComplaint(String description) {
    return complaintListPage().open().openComplaint(description);
  }

  private void clearSession() {
    driver.manage().deleteAllCookies();
    ((JavascriptExecutor) driver).executeScript(
        "window.localStorage.removeItem('omnicivic_token');" +
            "window.localStorage.removeItem('omnicivic_user');" +
            "window.sessionStorage.clear();");
  }
}
