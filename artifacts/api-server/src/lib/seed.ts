import { logger } from "./logger";

/**
 * Demo data seeding has been removed.
 *
 * The platform now uses a first-run setup flow: when no Super Administrator
 * exists, the login screen shows a "Create Super Administrator" form which
 * calls POST /api/school/auth/setup. After that account is created, all other
 * users are added from inside the dashboard. No demo credentials are seeded.
 */
export async function seedSchoolData() {
  logger.info("First-run setup mode — no demo data seeded. Create the Super Admin account from the login screen.");
}
