const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "OmniCivic";
pptx.subject = "OmniCivic technical presentation for business unit";
pptx.title = "OmniCivic - SDET Batch 4 Technical Presentation";
pptx.lang = "en-IN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-IN"
};

const COLORS = {
  navy: "133B5C",
  teal: "1F7A8C",
  green: "4D7C59",
  amber: "C58B2C",
  red: "A84A57",
  ink: "1F2937",
  slate: "667085",
  border: "D7DEE8",
  panel: "F7F9FC",
  white: "FFFFFF",
  softBlue: "EAF2FB",
  softGreen: "EDF7F0",
  softAmber: "FCF4E5"
};

function addHeader(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.5, y: 0.3, w: 10.8, h: 0.45,
    fontFace: "Aptos Display", fontSize: 23, bold: true, color: COLORS.navy
  });
  slide.addText(subtitle, {
    x: 0.5, y: 0.78, w: 12.1, h: 0.28,
    fontSize: 10.5, color: COLORS.slate
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 1.08, w: 12.2, h: 0,
    line: { color: COLORS.border, pt: 1.1 }
  });
}

function addLabel(slide, text, x, y, w, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.32,
    rectRadius: 0.05,
    line: { color, pt: 0 },
    fill: { color }
  });
  slide.addText(text, {
    x: x + 0.06, y: y + 0.07, w: w - 0.12, h: 0.12,
    fontSize: 9.5, bold: true, color: COLORS.white, align: "center"
  });
}

function addPanel(slide, x, y, w, h, title, items, titleColor = COLORS.navy, fill = COLORS.panel) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    line: { color: COLORS.border, pt: 1 },
    fill: { color: fill }
  });
  slide.addText(title, {
    x: x + 0.18, y: y + 0.13, w: w - 0.28, h: 0.22,
    fontSize: 14.5, bold: true, color: titleColor
  });
  const runs = [];
  items.forEach((item) => {
    runs.push({ text: item, options: { bullet: { indent: 12 }, breakLine: true } });
  });
  slide.addText(runs, {
    x: x + 0.18, y: y + 0.42, w: w - 0.28, h: h - 0.52,
    fontSize: 10.8, color: COLORS.ink, margin: 0.03, valign: "top"
  });
}

function addStatCard(slide, x, y, w, h, value, label, accent) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    line: { color: COLORS.border, pt: 1 },
    fill: { color: COLORS.white }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.12, h,
    line: { color: accent, pt: 0 },
    fill: { color: accent }
  });
  slide.addText(value, {
    x: x + 0.26, y: y + 0.16, w: w - 0.34, h: 0.38,
    fontSize: 20, bold: true, color: accent
  });
  slide.addText(label, {
    x: x + 0.26, y: y + 0.58, w: w - 0.34, h: 0.28,
    fontSize: 10.5, color: COLORS.ink
  });
}

function addTwoLineBox(slide, x, y, w, h, title, body, accent) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    line: { color: COLORS.border, pt: 1 },
    fill: { color: COLORS.white }
  });
  slide.addText(title, {
    x: x + 0.16, y: y + 0.14, w: w - 0.28, h: 0.22,
    fontSize: 13.5, bold: true, color: accent
  });
  slide.addText(body, {
    x: x + 0.16, y: y + 0.44, w: w - 0.28, h: h - 0.54,
    fontSize: 10.5, color: COLORS.ink, margin: 0.02, valign: "top"
  });
}

function slide1ProblemAndSolution() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 1 - Problem Statement And Technical Solution", "OmniCivic | SDET Batch 4 | Java Track");
  addLabel(slide, "SDET BATCH 4", 10.55, 0.32, 1.1, COLORS.teal);
  addLabel(slide, "JAVA TRACK", 11.75, 0.32, 0.95, COLORS.green);

  addPanel(slide, 0.62, 1.45, 5.85, 4.75, "Problem Statement", [
    "Complaint handling in many communities is unstructured: messages are spread across WhatsApp, calls, spreadsheets, and manual follow-up.",
    "There is no reliable ownership model for who should act next, which leads to ticket delays and missed issues.",
    "Traditional complaint handling also lacks proof-of-work verification, auditability, and technical traceability.",
    "From a systems perspective, the challenge is to build a scalable platform that supports many communities without creating a separate deployment for each one."
  ], COLORS.red, COLORS.panel);

  addPanel(slide, 6.82, 1.45, 5.85, 4.75, "Technical Solution Delivered", [
    "We built OmniCivic as a full-stack multi-tenant web application with Angular frontend, Spring Boot backend, and MySQL database.",
    "We implemented a controlled complaint lifecycle with role-based access for resident, admin, co-admin, staff, and super-admin.",
    "We added technical controls such as JWT authentication, tenant isolation using communityPrefix, proof verification, duplicate detection, and location validation.",
    "The result is a reusable SaaS-style platform that combines application engineering, testing mindset, and business-aligned workflow design."
  ], COLORS.navy, COLORS.softBlue);
}

function slide2TechAndArchitecture() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 2 - Tech Stack And Architecture", "Technical foundation of the solution");

  addStatCard(slide, 0.7, 1.4, 2.2, 1.05, "Angular 17", "Frontend UI layer", COLORS.teal);
  addStatCard(slide, 3.0, 1.4, 2.2, 1.05, "Java 21", "Core language used", COLORS.green);
  addStatCard(slide, 5.3, 1.4, 2.2, 1.05, "Spring Boot 3.2", "Backend REST layer", COLORS.navy);
  addStatCard(slide, 7.6, 1.4, 2.2, 1.05, "MySQL", "Relational persistence", COLORS.amber);
  addStatCard(slide, 9.9, 1.4, 2.2, 1.05, "JWT + Selenium", "Security + QA automation", COLORS.red);

  addTwoLineBox(slide, 0.7, 2.85, 3.8, 2.8, "Frontend Layer", "Angular standalone components, reactive forms, route guards, JWT interceptor, Leaflet integration for complaint pinning and boundary control.", COLORS.teal);
  addTwoLineBox(slide, 4.75, 2.85, 3.8, 2.8, "Backend Layer", "Spring Boot REST APIs with service-repository layering, JPA/Hibernate, Spring Security, validation, email notifications, and audit logging through AOP.", COLORS.navy);
  addTwoLineBox(slide, 8.8, 2.85, 3.8, 2.8, "Architecture Style", "Single deployment, multi-tenant architecture. Tenant isolation is handled logically using communityPrefix across entities, JWT claims, and repository queries.", COLORS.green);
}

function slide3CurriculumAlignment() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 3 - Curriculum Alignment With SDET Handbook", "How the project applied and extended the Java Track curriculum");

  addPanel(slide, 0.62, 1.45, 4.0, 4.75, "Stage 1 Applied", [
    "Frontend foundations from HTML, CSS, and JavaScript were extended into an Angular 17 application.",
    "Database and SQL learning were applied through MySQL schema design and relational modeling.",
    "Java programming concepts were applied in backend service design, DTO handling, and workflow logic."
  ], COLORS.navy, COLORS.softBlue);

  addPanel(slide, 4.67, 1.45, 4.0, 4.75, "Stage 2 Applied", [
    "Maven is used for backend dependency management and project build lifecycle.",
    "Spring concepts were applied through Spring Boot, REST controllers, JPA, validation, and Spring Security.",
    "Functional testing mindset and Agile workflow were reflected in role-wise flows and validation-driven design.",
    "GenAI learning was applied as a development accelerator for design, refactoring, testing support, and technical documentation."
  ], COLORS.teal, COLORS.softGreen);

  addPanel(slide, 8.72, 1.45, 4.0, 4.75, "Stage 3 Applied And Extended", [
    "Selenium, Java, TestNG, and Page Object Model were used for UI automation.",
    "API automation concepts connect naturally to our REST-first backend design with 53 endpoints.",
    "On top of the curriculum, we implemented multi-tenancy, geolocation validation, proof-of-work approval, community feed, and audit trails."
  ], COLORS.amber, COLORS.softAmber);
}

function slide4TechnicalImplementation() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 4 - Core Technical Implementation", "The main engineering constructs built in the project");

  addPanel(slide, 0.65, 1.5, 3.9, 4.7, "Security And Access", [
    "Stateless JWT authentication using Spring Security.",
    "Password hashing through BCrypt.",
    "Frontend AuthGuard and backend @PreAuthorize enforcement.",
    "First-login password reset gate implemented through token claims."
  ], COLORS.navy, COLORS.panel);

  addPanel(slide, 4.72, 1.5, 3.9, 4.7, "Data And Tenant Model", [
    "MySQL + JPA/Hibernate with entity-driven schema.",
    "communityPrefix used as the tenant partition key.",
    "Community-scoped complaint numbering rather than global numbering.",
    "Separate tables for complaints, media, proofs, upvotes, notifications, and audit logs."
  ], COLORS.green, COLORS.softGreen);

  addPanel(slide, 8.79, 1.5, 3.9, 4.7, "Advanced Logic Built", [
    "Duplicate detection through Haversine-distance logic.",
    "Anti-fake complaint control through polygon or radius-based location validation.",
    "Proof-of-work review flow where staff cannot self-close complaints.",
    "Async email notifications and AOP-based audit logging."
  ], COLORS.red, COLORS.softAmber);
}

function slide5ApiAndSkills() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 5 - API Landscape And Skills Developed", "Technical scale of the implementation");

  addStatCard(slide, 0.7, 1.45, 2.0, 1.0, "53", "Implemented REST endpoints", COLORS.navy);
  addStatCard(slide, 2.9, 1.45, 2.0, 1.0, "9", "Controller modules", COLORS.teal);
  addStatCard(slide, 5.1, 1.45, 2.0, 1.0, "22 GET", "Read APIs", COLORS.green);
  addStatCard(slide, 7.3, 1.45, 2.0, 1.0, "16 POST", "Create/action APIs", COLORS.amber);
  addStatCard(slide, 9.5, 1.45, 1.5, 1.0, "11 PUT", "Update APIs", COLORS.red);
  addStatCard(slide, 11.15, 1.45, 1.5, 1.0, "4 DELETE", "Delete APIs", COLORS.slate);

  addPanel(slide, 0.7, 2.85, 5.7, 3.2, "API Modules Used In The Project", [
    "Auth APIs: login and reset-password",
    "Complaint APIs: submission, feed, upvote, assignment, proof, closure, map pins",
    "User APIs: profile, residents, staff, co-admin, deactivate",
    "Category, community, notification, service-request, audit, and bootstrap APIs"
  ], COLORS.navy, COLORS.softBlue);

  addPanel(slide, 6.7, 2.85, 5.95, 3.2, "Technical Skills Learned And Demonstrated", [
    "Java backend design, Spring Boot, Spring Security, JPA/Hibernate, and DTO-based API design",
    "Angular component-based UI development with forms, routing, and service integration",
    "SQL/data modeling, Maven, GitHub-based versioning, and testing mindset",
    "Ability to extend beyond curriculum by building scalable workflow logic and maintainable automation support"
  ], COLORS.teal, COLORS.panel);
}

function slide6GenAIAndAutomation() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 6 - Gen AI Usage And Selenium Automation", "Technical support capabilities applied during project delivery");

  addPanel(slide, 0.68, 1.55, 5.8, 4.5, "How We Used Gen AI", [
    "As a technical accelerator during design, coding, debugging, restructuring, and documentation.",
    "To break down product requirements into implementable backend, frontend, and workflow tasks.",
    "To improve testing strategy, automation flow selection, and technical explanation quality.",
    "This aligns with the handbook's GenAI learning objective: applying AI support to real engineering tasks."
  ], COLORS.amber, COLORS.softAmber);

  addPanel(slide, 6.85, 1.55, 5.8, 4.5, "Selenium Automation Implemented", [
    "Built a separate Java + Selenium + TestNG automation project using Page Object Model.",
    "Current simplified flows cover resident login, complaint submission, and admin assignment.",
    "This directly maps to handbook topics: Selenium concepts, Java track automation, and maintainable test design.",
    "POM was used to separate page locators/actions from test logic, improving readability and maintainability."
  ], COLORS.navy, COLORS.softBlue);
}

function slide7Conclusion() {
  const slide = pptx.addSlide();
  addHeader(slide, "Slide 7 - Technical Summary", "What we should communicate to the business unit");
  addPanel(slide, 0.9, 1.7, 11.5, 3.8, "Final Positioning", [
    "We are SDET Batch 4, Java Track, and OmniCivic is our business-aligned project demonstrating how we applied curriculum topics to a real engineering solution.",
    "The project is not only functionally complete; it is technically structured using modern Java full-stack practices: Angular, Spring Boot, MySQL, REST APIs, JWT security, and Selenium automation.",
    "We also implemented capabilities beyond the baseline curriculum, such as multi-tenancy, proof-of-work governance, geospatial validation, upvote control, and audit logging.",
    "So the project demonstrates both learning absorption from the handbook and engineering maturity in extending those concepts into a scalable real-world platform."
  ], COLORS.navy, COLORS.panel);
}

slide1ProblemAndSolution();
slide2TechAndArchitecture();
slide3CurriculumAlignment();
slide4TechnicalImplementation();
slide5ApiAndSkills();
slide6GenAIAndAutomation();
slide7Conclusion();

const outputDir = path.join(__dirname, "..", "deliverables");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "OmniCivic_SDET_Batch4_Technical_Presentation.pptx");

pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log(`Presentation generated: ${outputPath}`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
