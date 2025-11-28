# Requirements Document

## Introduction

This document outlines the requirements for rebranding the AI Podcast Clipper application to "Mylo" - an AI video clipper tool that converts raw footage into viral short-form clips. The rebranding involves updating all references, naming conventions, and branding elements throughout the codebase while maintaining the existing functionality and architecture.

## Glossary

- **Mylo**: The new brand name for the AI video clipper application
- **Application**: The full-stack video processing system including frontend, backend, and infrastructure
- **Codebase**: All source code files, configuration files, and documentation
- **Brand Reference**: Any occurrence of "ai-podcast-clipper", "AI Podcast Clipper", or related naming in code, comments, or documentation
- **Modal App**: The serverless backend application running on Modal platform
- **S3 Bucket**: AWS storage bucket for video files
- **Environment Variable**: Configuration value stored in .env files or deployment settings

## Requirements

### Requirement 1

**User Story:** As a developer, I want all code references updated from "ai-podcast-clipper" to "mylo", so that the codebase reflects the new brand identity

#### Acceptance Criteria

1. WHEN the codebase is scanned THEN the system SHALL contain no references to "ai-podcast-clipper" in Python files
2. WHEN the codebase is scanned THEN the system SHALL contain no references to "ai-podcast-clipper" in TypeScript files
3. WHEN the codebase is scanned THEN the system SHALL contain no references to "ai-podcast-clipper" in configuration files
4. WHEN the codebase is scanned THEN the system SHALL contain no references to "ai-podcast-clipper" in package.json or requirements.txt
5. WHEN directory names are reviewed THEN the system SHALL use "mylo" naming convention for all project directories

### Requirement 2

**User Story:** As a developer, I want Modal application names updated, so that the serverless backend reflects the new brand

#### Acceptance Criteria

1. WHEN the Modal app is initialized THEN the system SHALL use "mylo" as the application name
2. WHEN Modal volumes are referenced THEN the system SHALL use "mylo-model-cache" as the volume name
3. WHEN Modal secrets are referenced THEN the system SHALL use "mylo-secret" as the secret name

### Requirement 3

**User Story:** As a developer, I want S3 bucket references updated, so that video storage uses the new brand naming

#### Acceptance Criteria

1. WHEN S3 operations are performed THEN the system SHALL reference the bucket name from environment variables
2. WHEN environment variable documentation is reviewed THEN the system SHALL specify "mylo" bucket naming convention
3. WHEN S3 client code is executed THEN the system SHALL use the configured bucket name consistently

### Requirement 4

**User Story:** As a developer, I want environment variable names updated, so that configuration reflects the new brand

#### Acceptance Criteria

1. WHEN environment files are reviewed THEN the system SHALL use "MYLO_" prefix for application-specific variables where appropriate
2. WHEN environment examples are provided THEN the system SHALL document the new variable naming conventions
3. WHEN the application reads configuration THEN the system SHALL support both old and new variable names during transition

### Requirement 5

**User Story:** As a developer, I want package and project metadata updated, so that npm and pip packages reflect the new brand

#### Acceptance Criteria

1. WHEN package.json is reviewed THEN the system SHALL contain "mylo-frontend" as the package name
2. WHEN Python project structure is reviewed THEN the system SHALL use "mylo-backend" as the directory name
3. WHEN package metadata is displayed THEN the system SHALL show "Mylo" as the project title

### Requirement 6

**User Story:** As a developer, I want documentation updated, so that README files and comments reflect the new brand

#### Acceptance Criteria

1. WHEN README files are reviewed THEN the system SHALL reference "Mylo" as the application name
2. WHEN code comments are reviewed THEN the system SHALL contain no references to "podcast clipper"
3. WHEN documentation describes functionality THEN the system SHALL use "video clipper" terminology

### Requirement 7

**User Story:** As a developer, I want API endpoint references updated, so that the backend integration uses new naming

#### Acceptance Criteria

1. WHEN environment variables for endpoints are reviewed THEN the system SHALL use descriptive names without brand-specific prefixes
2. WHEN API routes are documented THEN the system SHALL reflect the video processing purpose
3. WHEN endpoint URLs are constructed THEN the system SHALL use the configured endpoint from environment variables

### Requirement 8

**User Story:** As a developer, I want database and authentication references updated, so that internal naming is consistent

#### Acceptance Criteria

1. WHEN Prisma schema is reviewed THEN the system SHALL use generic model names without brand references
2. WHEN authentication configuration is reviewed THEN the system SHALL use standard NextAuth naming conventions
3. WHEN database queries are executed THEN the system SHALL reference models by their functional purpose

### Requirement 9

**User Story:** As a developer, I want a migration checklist, so that deployment updates can be tracked

#### Acceptance Criteria

1. WHEN the rebranding is complete THEN the system SHALL provide a checklist of infrastructure changes required
2. WHEN deployment documentation is reviewed THEN the system SHALL list all environment variables that need updating
3. WHEN the checklist is followed THEN the system SHALL identify Modal, S3, and database resources requiring updates
4. WHEN external services are reviewed THEN the system SHALL document Stripe, Inngest, and AWS configuration changes needed
