package com.omnicivic.automation.pages;

import com.omnicivic.automation.base.BasePage;
import com.omnicivic.automation.base.TestConfig;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ComplaintListPage extends BasePage {
  private static final By PAGE_TITLE = By.cssSelector(".page-head .page-title");
  private static final By LOADING = By.cssSelector(".loading-state");
  private static final By DETAIL_PANEL = By.cssSelector(".detail-panel");
  private static final By DETAIL_QUOTE = By.cssSelector(".detail-panel .quote");
  private static final By ASSIGN_SELECT = By.xpath("//label[normalize-space()='Assign to staff']/following::select[1]");
  private static final By ASSIGN_BUTTON = By.xpath("//button[normalize-space()='Assign']");

  public ComplaintListPage(WebDriver driver, TestConfig config) {
    super(driver, config);
  }

  public ComplaintListPage open() {
    openPath("/complaints");
    return waitUntilLoaded();
  }

  public ComplaintListPage waitUntilLoaded() {
    waitVisible(PAGE_TITLE);
    if (exists(LOADING)) {
      waitInvisible(LOADING);
    }
    return this;
  }

  public boolean hasComplaintInList(String description) {
    return exists(listRow(description));
  }

  public ComplaintListPage openComplaint(String description) {
    click(listRow(description));
    return waitForComplaintDetail(description);
  }

  public ComplaintListPage waitForComplaintDetail(String description) {
    waitVisible(DETAIL_PANEL);
    wait.until(d -> waitVisible(DETAIL_QUOTE).getText().contains(description));
    return this;
  }

  public ComplaintListPage assignToStaff(String staffUsername) {
    selectOptionContaining(ASSIGN_SELECT, staffUsername);
    click(ASSIGN_BUTTON);
    wait.until(d -> getAssignedTo().contains(staffUsername));
    waitForStatus("assigned");
    return this;
  }

  public boolean isStatusShown(String statusText) {
    return currentStatus().contains(statusText);
  }

  public String getAssignedTo() {
    return detailValue("Assigned to");
  }

  private String detailValue(String label) {
    By value = By.xpath("//div[contains(@class,'detail-meta-grid')]//div[.//div[normalize-space()="
        + xpathLiteral(label) + "]]//div[contains(@class,'val')]");
    return waitVisible(value).getText();
  }

  private void waitForStatus(String statusText) {
    wait.until(d -> currentStatus().contains(statusText));
  }

  private String currentStatus() {
    return waitVisible(By.cssSelector(".detail-head .status-pill")).getText().trim().toLowerCase();
  }

  private By listRow(String description) {
    return By.xpath("//article[contains(@class,'row')][.//p[contains(@class,'row-desc') and normalize-space()="
        + xpathLiteral(description) + "]]");
  }
}
