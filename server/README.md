# Server-ready backend contracts

This folder contains production-ready backend artifacts required to move from browser-only state to real API + DB architecture.

## Included
- `contracts/openapi.yaml` — REST API contracts (auth, users, achievements, registrations).
- `migrations/001_init.sql` — PostgreSQL initial schema.

## Security requirements covered by contract/schema
- Password hashes only (`password_hash`) on server side (bcrypt/argon2 at app layer).
- Refresh session table with token hash + device + IP.
- Login lock controls (`failed_login_attempts`, `locked_until`).
- Audit log storage with device/IP.

## Suggested implementation stack
- Node.js + Fastify/Express + Zod validation
- PostgreSQL + migration runner
- JWT access token + hashed refresh token rotation
- RBAC middleware (`admin`, `curator`, `student`) per endpoint
