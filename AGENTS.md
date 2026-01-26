# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a job application tracking system designed to help users track job applications to companies and monitor updates throughout the application process.

## Project Status

⚠️ **Early Stage**: This repository is newly initialized with minimal codebase. The project structure, technology stack, and architecture are yet to be established.

## Development Guidelines

### Initial Setup Considerations

When beginning development on this project, consider:

1. **Technology Stack Selection**: Choose appropriate technologies based on requirements:
   - Frontend framework (React, Vue, Next.js, etc.)
   - Backend framework (Express, FastAPI, Django, etc.)
   - Database (PostgreSQL, MongoDB, SQLite, etc.)
   - Deployment target (web app, desktop app, mobile, etc.)

2. **Core Features**: The application should track:
   - Company names and contact information
   - Application submission dates
   - Job positions applied for
   - Application status (applied, interviewing, rejected, accepted, etc.)
   - Interview schedules and notes
   - Follow-up reminders
   - Document attachments (resumes, cover letters)

3. **Architecture Patterns**: Consider implementing:
   - Clear separation between data layer, business logic, and presentation
   - Authentication and user management if multi-user
   - Search and filtering capabilities for applications
   - Export/import functionality for data portability

### Commands (To Be Established)

Once the technology stack is chosen, document here:
- Installation/setup commands
- Development server commands
- Build commands
- Test commands
- Linting/formatting commands
- Database migration commands

### Database Schema Considerations

Key entities to model:
- Applications (with status tracking and timestamps)
- Companies (with relationship to applications)
- Contacts (recruiters, hiring managers)
- Interviews (scheduled and completed)
- Documents (resumes, cover letters, references)
- Notes and activity logs

### Future Development

As the codebase grows, update this file with:
- Actual project structure and module organization
- Specific build and test commands
- Key architectural decisions and patterns used
- Integration points and external dependencies
- Common development workflows and debugging tips
