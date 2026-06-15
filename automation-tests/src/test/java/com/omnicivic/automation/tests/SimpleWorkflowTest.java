package com.omnicivic.automation.tests;

import com.omnicivic.automation.base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class SimpleWorkflowTest extends BaseTest {
  private String complaintDescription;

  @BeforeClass(alwaysRun = true)
  public void setUpSuite() {
    startBrowser();
  }

  @AfterClass(alwaysRun = true)
  public void tearDownSuite() {
    stopBrowser();
  }

  @Test(priority = 1)
  public void residentCanLogin() {
    // Flow 1: resident logs into OmniCivic
    loginAs(config.getResident());
    Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"), "Resident should land on dashboard");
  }

  @Test(priority = 2, dependsOnMethods = "residentCanLogin")
  public void residentCanSubmitComplaint() {
    // Flow 2: resident submits a new complaint
    complaintDescription = newComplaintDescription();

    submitComplaint(config.getCategoryName(), complaintDescription);

    Assert.assertTrue(submitComplaintPage().isSuccessVisible(), "Complaint should submit successfully");

    complaintListPage().open();
    Assert.assertTrue(
        complaintListPage().hasComplaintInList(complaintDescription),
        "Complaint should appear in the resident complaint list");
  }

  @Test(priority = 3, dependsOnMethods = "residentCanSubmitComplaint")
  public void adminCanAssignComplaintToStaff() {
    // Flow 3: admin assigns the same complaint to a staff member
    switchUser(config.getAdmin());

    openComplaint(complaintDescription).assignToStaff(config.getStaff().getUsername());

    Assert.assertTrue(
        complaintListPage().getAssignedTo().contains(config.getStaff().getUsername()),
        "Complaint should be assigned to the selected staff user");
    Assert.assertTrue(
        complaintListPage().isStatusShown("assigned"),
        "Complaint status should change to assigned");
  }
}
