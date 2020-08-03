# CHANGELOG

## 1.0.0 (2020-07-28)

Features:
  - Migrate to Angular 9 -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/101)
  - Add Execution environment column to Test History table -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/107)

Bugfixes:
  - [API] /api/public/test/create-or-update does not update list of suites -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/105)
  - External issue link is incorrect on Issues table -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/108)
  - Import is blocked when invalid regular expression was saved for issue -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/103)

## 0.3.10 (2020-05-17)

Features:
  - Update Tests to use Admin API to create preconditions -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/100)
  - Dashboard: My open Issues -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/74)
  - Cannot open external issue from Modal and View of Issue -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/96)
  - Test run Bulk Delete -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/91)

Bugfixes:
  - Test run View Page performance is bad -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/99)
  - API Token page: Link to Aquality Tracking API leads to null -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/84)
  - External Link does not work on Issues List -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/97)
  - Test page design is broken if steps are empty -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/94)

## 0.3.9 (2020-04-21)

Features:
  - Migrate results info to issues -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/82)
  - Migrate predefined Resolutions to issues -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/83)
  - Issue -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/69)
  - Test Run: Auto Fill Results on issue creation -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/77)
  - Issues List Page -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/75)
  - add Failed test cases column(count) to Test Runs table -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/92)

## 0.3.8 (2020-03-11)

Features:
  - Test Run List: Add posibility to filter by Inactive Milestone -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/73)
  - Mark import af failed when import is failed  -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/79)

Bugfixes:
  - Test Runs: Fix Filter for No Resolution Column -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/22)
  - Test Run View: Chart is not updated when user updating results in a bulk -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/78)
  
## 0.3.7 (2020-03-02)

Features:
  - Improve Test Run and Test List page performance -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/71)
  - Exclude Debug results from last results column -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/70)
  - Milestone: Add selected Suites to milestone -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/63)
  - Milestone: Add not executed suites -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/64)
  - Milestone: Add Due Date to Milestone. -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/61)
  - Milestone: Add possibility to Close Milestone. -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/62)
  - Test Runs List: Add possibility to Add milestone from Test Runs List. -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/59)

  Bugfixes:
  - Fixed for downloading audits results from Audits Dashboard -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/51)

## 0.3.6 (2020-02-24)

Features:
  - Move Administration to main Menu bar to make it more visible -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/58)
  - Test Run view: Add stability indicator -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/60)
  - Add 'Show resolution slider' for Test Runs chart -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/43)
  - Move to Bootstrap 4.4.1 -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/66)

Bugfixes:
  - Csv export with special symbols -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/36)

## 0.3.5 (2020-02-15)

Features:
  - Exclude Debug testruns from graph on test runs list -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/46)
  - Import: Mark import as debug -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/47)
  - Milestone View: Add functionality that displays the latest results of the tests from the test runs -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/11)
  - List of predefined Resolutions -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/26)
  - Add JUnit 5 support -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/33)
  - Add posibility to Finish Test Run Manually -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/21)

Bugfixes:
  - Cannot remove milestone from TestRun -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/50)
  - Refactored Permissions service
  - Test Runs: Filter by Start Time date From doesn't work -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/38)

## 0.3.4 (2019-12-10)

Features:
  - Remove Customers Feature -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/25)
  - Add 'Steps' label into Test page -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/31)
  - Add ID column to Suites List -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/18)
  - Add possibility to sync testsuites according to Not Executed results -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/32)
  - Add Executor and Pass Rate column to Test Run List table -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/41)

Bugfixes:
  - It should not be possible to delete Customer that assigned to the projects -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/9)
  - Link "View on Aquality Tracking" in report email is broken -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/30)
  - Link from the audit email notification is invalid -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/13)
  - Audits feature is visible when disabled -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/24)
  - All available test are shown in tests list after updating Suite for some test -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/27)
  - There is no scrolling in dashboard configuration -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/14)
  - Empty line on dashboard if suite have no data -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/15)
  - Suites Dashboard: Data refresh working wrong with empty cards -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/40)
  - Suites Dashboard: Data is not updated for empty cards -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/39)

## 0.3.3 (2019-11-16)

Features:
  - Rename Import Token to API Token -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/23)
  - Steps Feature -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/46)
  - Regex Search by Errors for Import -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/17)

Bugfixes:
  - Suite Matrix does not work -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/18)
  - Local Manager can see Local Permissions page -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/22)
  - Test View: Suite link leads to 404 page -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/39)
  - Redirection was wrong when token expired

## 0.3.2 (2019-09-10)

Features:

  - Report an issue now redirecting to Github -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/28)
  - Import: NUnit V3 add possibility to import with fullname test name  -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/27)
  
Bugfixes:

  - TestRun View: Click on charts not working -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/26)
  - Import: Import to latest test Run not working when One Test run option selected -> [View Issue](https://github.com/aquality-automation/aquality-tracking-ui/issues/29)

## 0.3.1 (2019-08-30)

Features:

  - Add ability to set Default Email Pattern
  - Add regex search to Results Searcher

Bugfixes:

  - Fix Fail Reason Search
