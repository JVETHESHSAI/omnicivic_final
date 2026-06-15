package com.omnicivic.automation.pages;

import com.omnicivic.automation.base.BasePage;
import com.omnicivic.automation.base.TestConfig;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class SubmitComplaintPage extends BasePage {
  private static final By PAGE_TITLE = By.xpath("//h1[normalize-space()='Report a problem']");
  private static final By DESCRIPTION = By.cssSelector("textarea[formControlName='description']");
  private static final By SUBMIT = By.cssSelector("button[type='submit']");
  private static final By SUCCESS_TITLE = By.xpath("//h2[normalize-space()='Reported successfully']");
  private static final By COORDS = By.cssSelector(".loc-coords");

  public SubmitComplaintPage(WebDriver driver, TestConfig config) {
    super(driver, config);
  }

  public SubmitComplaintPage open() {
    openPath("/complaints/new");
    return waitUntilLoaded();
  }

  public SubmitComplaintPage waitUntilLoaded() {
    waitVisible(PAGE_TITLE);
    waitVisible(DESCRIPTION);
    return this;
  }

  public SubmitComplaintPage submitComplaint(String categoryName, String description) {
    click(categoryButton(categoryName));
    type(DESCRIPTION, description);
    wait.until(d -> exists(COORDS) || waitVisible(SUBMIT).isEnabled());
    click(SUBMIT);
    waitVisible(SUCCESS_TITLE);
    return this;
  }

  public boolean isSuccessVisible() {
    return isVisible(SUCCESS_TITLE);
  }

  private By categoryButton(String categoryName) {
    return By.xpath("//button[contains(@class,'cat-btn')][.//span[contains(@class,'cat-name') and normalize-space()="
        + xpathLiteral(categoryName) + "]]");
  }
}
