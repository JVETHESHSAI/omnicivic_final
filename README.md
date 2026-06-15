# OmniCivic

OmniCivic is a multi-tenant civic complaint management platform built by **SDET Batch 4 (Java Track)**. The project is designed for gated communities and municipal-style complaint handling, with a strong focus on technical architecture, workflow control, and quality engineering.

## Repository Structure

- `backend/` - Spring Boot 3.2 backend using Java 21, Spring Security, JPA/Hibernate, MySQL, and REST APIs
- `platform-frontend/` - Angular 17 web application for residents, staff, admins, and super-admin users
- `company-website/` - static website used for product landing and service request onboarding
- `automation-tests/` - standalone Selenium + Java + TestNG automation project using Page Object Model
- `presentation-generator/` - Node.js utility used to generate the technical presentation PPT
- `deliverables/` - final presentation files prepared for review and submission

## Technical Snapshot

- Frontend: Angular 17, TypeScript, RxJS, Leaflet
- Backend: Spring Boot 3.2, Java 21, Spring Security, Spring Data JPA, JavaMail
- Database: MySQL
- Security: JWT authentication, BCrypt password hashing, role-based access control
- Testing: Selenium WebDriver, TestNG, Page Object Model
- Architecture: single deployment with logical multi-tenancy using `communityPrefix`

## Key Technical Highlights

- Multi-tenant complaint workflow with resident, staff, admin, co-admin, and super-admin roles
- Complaint lifecycle with assignment, proof submission, proof approval, resolution, and closure
- Community-scoped complaint numbering
- Duplicate complaint detection using Haversine-distance logic
- Anti-fake complaint validation using community location boundaries
- Audit logging and email notification support

## Submission Notes

- The automation project currently focuses on **3 simple interview-friendly flows**:
  - resident login
  - resident complaint submission
  - admin complaint assignment
- Presentation assets for trainers and leaders are available in [deliverables](/C:/omnicivic/omnicivic-fixed-all/deliverables).
- Generated folders such as `target/`, `node_modules/`, IDE metadata, and local cache directories are excluded from version control.

## Run Locally

### Backend

Run the Spring Boot app from `backend/` with MySQL and the required environment variables configured.

### Frontend

```bash
cd platform-frontend
npm install
ng serve --proxy-config proxy.conf.json
```

### Automation Tests

```bash
cd automation-tests
mvn test
```

## Deliverables

See [deliverables/README.md](/C:/omnicivic/omnicivic-fixed-all/deliverables/README.md) for the review-ready files included with this repository.
