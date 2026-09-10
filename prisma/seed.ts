/**
 * Seeds the minimum structural data CodeSprint needs to function:
 *  - The Event row itself (slug must match NEXT_PUBLIC_ACTIVE_EVENT_SLUG).
 *  - Its 2 Checkpoints, in order.
 *
 * Deliberately does NOT seed fake teams, scores, or admin accounts —
 * per the brief, "Do NOT hardcode values." Teams/scores are real organizer
 * input (Phase 8 CRUD), and admins are provisioned via
 * `npm run admin:create` (see scripts/create-admin.ts). Idempotent: safe
 * to re-run (`npm run db:seed`) without creating duplicates.
 */
import { PrismaClient } from '@prisma/client';
import { CHECKPOINT_COUNT, ACTIVE_EVENT_SLUG, EVENT_NAME } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.upsert({
    where: { slug: ACTIVE_EVENT_SLUG },
    update: {},
    create: {
      slug: ACTIVE_EVENT_SLUG,
      name: EVENT_NAME,
      isActive: true,
    },
  });

  for (let order = 1; order <= CHECKPOINT_COUNT; order += 1) {
    await prisma.checkpoint.upsert({
      where: { eventId_order: { eventId: event.id, order } },
      update: { label: `Week ${order}` },
      create: {
        eventId: event.id,
        order,
        label: `Week ${order}`,
      },
    });
  }

  console.warn(
    `Seeded event "${event.name}" (${event.slug}) with ${CHECKPOINT_COUNT} checkpoints.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
