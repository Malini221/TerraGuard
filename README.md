**TerraGuard**: Digital Leash for Environmental Compliance
TerraGuard is a high-performance, GPS-enabled monitoring system developed for the TN Hackathon 2026. It is designed to regulate the transportation of excavated earth and prevent illegal mining through real-time geospatial enforcement.

****Core Features****
Aadhaar-Linked Accountability: Integrated driver authentication ensures every trip is tied to a verified identity, preventing anonymous violations.

Dynamic Geofencing: Utilizes Leaflet-based spatial polygons to define "Safe Mining Zones".

Instant Breach Detection: The system triggers a high-frequency siren and visual "BREACH DETECTED" alerts the moment a vehicle exits its permitted boundary.

Automated Audit Trail: Every violation is automatically logged into a secure SQLite database with precise GPS coordinates and timestamps.

Official Oversight: Features a PIN-protected Admin Dashboard (PIN: 2026) with violation heatmaps and PDF export for legal reporting.

Bilingual Accessibility: Fully functional interface in both Tamil and English.

****Technical Stack****
Frontend: React.js with TypeScript, Leaflet.js for mapping, and jsPDF for report generation.

Backend: Node.js and Express managing secure API endpoints.

Database: SQLite with Prisma ORM for relational data integrity.
