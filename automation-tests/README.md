# OmniCivic Automation Tests

Standalone Selenium automation pack for OmniCivic using Java, TestNG, and Page Object Model.

## Covered workflows

1. Resident login
2. Resident submits a complaint
3. Admin assigns the complaint to staff

## Project structure

- `src/test/java/com/omnicivic/automation/base` - driver, config, and test base
- `src/test/java/com/omnicivic/automation/pages` - page objects
- `src/test/java/com/omnicivic/automation/tests` - one simple workflow test class
- `src/test/resources/config.properties` - tracked template config

## Configuration

Update `src/test/resources/config.properties` with your environment values, or create:

- `src/test/resources/config.local.properties`

The local file overrides the tracked template and is ignored by Git.

Required preconditions:

- 1 resident user
- 1 admin or co-admin user
- 1 staff user assigned to the chosen complaint category
- OmniCivic frontend running at the configured `baseUrl`

Important config values:

- `baseUrl`
- resident, admin, and staff usernames and passwords
- `test.categoryName`

The staff user must already be mapped to that category in OmniCivic.

## Run

Run the suite:

```bash
mvn test
```

Run headless:

```bash
mvn test -Dheadless=true
```
