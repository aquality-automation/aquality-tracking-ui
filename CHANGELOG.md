# CHANGELOG

## 0.3.8 (2020-03-02)

Features:
  - Test Run List: Add posibility to filter by Inactive Milestone -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/73)

## 0.3.7 (2020-03-02)

Features:
  - Improve Test Run and Test List page performance -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/71)
  - Exclude Debug results from last results column -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/70)
  - Milestone: Add selected Suites to milestone -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/63)
  - Milestone: Add not executed suites -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/64)
  - Milestone: Add Due Date to Milestone. -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/61)
  - Milestone: Add possibility to Close Milestone. -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/62)
  - Test Runs List: Add possibility to Add milestone from Test Runs List. -> [View Issue](https://github.com/aquality-automation/aquality-tracking/issues/59)

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
