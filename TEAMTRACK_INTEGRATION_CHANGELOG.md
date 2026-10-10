# TeamTrack Integration Changelog

## [2026-09-24] — [Phase 3D: TeamTrack Pilot Integration]

### Introduced
- Server-to-Server HMAC authentication middleware (`server/src/middlewares/hmacAuth.ts`).
- `/api/admin/health` and `/api/admin/stats` dedicated endpoints.

### Modified
- `server/.env`: Added `ADMIN_INTEGRATION_SECRET`.
- `server/src/index.ts`: Added integration routes and hooked in `hmacAuth`.

### Removed
- None

### Security Changes
- Environment variable `ADMIN_INTEGRATION_SECRET` is now required for Central Admin integration.
- Standard Phase 3 HMAC-SHA256 signature verification implemented in Express.
- Existing frontend APIs remain completely independent and unmodified.
- Rejected requests (e.g., missing signatures) return `401 Unauthorized`.

### Validation
- Validated `GET /api/admin/health` with a valid Central Admin payload.
- Validated `GET /api/admin/stats` showing aggregate project and user counts via Sequelize.
- Confirmed existing `GET /api/health` remains functional for backward compatibility.
