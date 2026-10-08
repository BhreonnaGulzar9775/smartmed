# 💊 SmartMed – Cloud-Based Prescription Fulfillment & Inventory Management

![CI/CD](https://github.com/YOUR_ORG/smartmed/actions/workflows/ci-cd.yml/badge.svg)

## Live
- Frontend: https://smartmed-frontend.onrender.com
- Swagger: https://smartmed-backend.onrender.com/swagger

> Render free tier sleeps after inactivity — first request takes ~60s.

## Problem
Independent pharmacies struggle with stockouts, expiry waste, prescription errors, and multi-branch visibility.

## Users
Pharmacy owners, pharmacists, patients.

## Features
- JWT authentication with roles (Admin, Pharmacist, Patient)
- Inventory per branch with low-stock and expiring alerts
- Prescriptions with dispense action and stock validation
- Reports for stock summary and dispensing stats

## Architecture
graph TD
    Client["React SPA"] --> API["ASP.NET Core 8 API"]
    API --> DB[("PostgreSQL (Neon)")]
    API --> Email["SendGrid"]

## Run locally
1. Install Docker Desktop, VS Code, .NET 8 SDK, Node.js 20
2. Clone the repo
3. Copy `.env.example` to `.env`
4. In Docker Desktop, or a terminal at repo root: `docker compose up --build`
5. Frontend: http://localhost:3000
6. Swagger: http://localhost:5000/swagger

## Environment Variables
See `.env.example`.

## Group Members
| Name | Student # | Contribution |
|------|-----------|--------------|
| Bhreonna Gulzar | ST10473087 | Backend core (models, DbContext, auth) |
| Suvika Sewlall | ST10473344 | Backend features (inventory, prescriptions, tests) |
| Humeshnie Govender | ST10061910 | Frontend React SPA |
| Justin Govender | ST10469304 | Docker, CI/CD, deployment, docs |

## Git Workflow
- `main` protected: PR + 1 approval + CI green required
- Feature branches: `feature/<area>-<description>`
- Conventional commits

## License
Educational (CLDV6212).