/**
 * Blog seed (CMS roadmap D6) — two sample posts so /blog, the category/tag
 * pages and the sitemap have real content to check against.
 *
 * Idempotent: a post or category/tag is created only when its slug is free,
 * so re-running never overwrites edits made in /admin/posts.
 *
 * Usage: pnpm db:seed:blog
 */
import { PrismaClient, PostStatus } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "appliance-care", name: "Appliance Care" },
  { slug: "troubleshooting", name: "Troubleshooting" },
];

const TAGS = [
  { slug: "fridge", name: "Fridge" },
  { slug: "washing-machine", name: "Washing Machine" },
  { slug: "aircond", name: "Aircond" },
];

const POSTS = [
  {
    slug: "how-to-keep-your-fridge-running-longer",
    title: "How to Keep Your Fridge Running Longer",
    excerpt: "Simple habits that cut energy use and help your fridge last years longer in a Malaysian home.",
    category: "appliance-care",
    tags: ["fridge"],
    publishedAt: new Date("2026-09-01T02:00:00Z"),
    contentHtml: `
<p>A fridge runs all day, every day, so small habits add up. In Kuala Lumpur's heat the compressor works harder than in most countries, which makes basic care even more important.</p>
<h2>Check the door seal</h2>
<p>Close the door on a piece of paper. If it slides out easily, the gasket is worn and the motor runs longer to keep the cold in.</p>
<h2>Clean the condenser coils</h2>
<p>Dust on the coils at the back or underneath traps heat. Vacuum them every three to six months.</p>
<h2>Set the right temperature</h2>
<ul>
  <li>Fridge compartment: around 3°C to 5°C</li>
  <li>Freezer compartment: around -18°C</li>
</ul>
<p>Colder is not better. Each extra degree adds to your power bill.</p>
<h2>Know when to call a technician</h2>
<p>If the fridge is loud, warm on the inside, or leaks water onto the floor, book a check before the problem spreads to the compressor.</p>
`,
  },
  {
    slug: "washing-machine-smells-what-to-do",
    title: "Washing Machine Smells? What to Do",
    excerpt: "A musty smell usually means trapped moisture and detergent residue. Here is how to clear it and stop it coming back.",
    category: "troubleshooting",
    tags: ["washing-machine"],
    publishedAt: new Date("2026-09-15T02:00:00Z"),
    contentHtml: `
<p>A sour or musty smell from the drum is one of the most common complaints we hear. The cause is almost always moisture and residue that never fully dries out between washes.</p>
<h2>Run a hot empty cycle</h2>
<p>Add a cup of white vinegar or a dedicated washer cleaner to the drum and run the hottest cycle with no clothes.</p>
<h2>Clean the rubber door seal</h2>
<p>Wipe the folds of the door gasket and check for coins or lint hiding underneath.</p>
<h2>Clear the detergent drawer</h2>
<p>Pull the drawer out fully and rinse it under warm water. Old powder turns into a paste that feeds the smell.</p>
<h2>Leave the door open</h2>
<p>After each wash, leave the door and drawer open so the inside can dry.</p>
<p>If the smell stays after these steps, the drain pump filter may be blocked and needs a proper clean.</p>
`,
  },
];

function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function main() {
  const categoryIds = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.postCategory.upsert({
      where: { slug: c.slug },
      create: c,
      update: {},
    });
    categoryIds.set(c.slug, row.id);
  }

  const tagIds = new Map<string, string>();
  for (const t of TAGS) {
    const row = await prisma.tag.upsert({
      where: { slug: t.slug },
      create: t,
      update: {},
    });
    tagIds.set(t.slug, row.id);
  }

  for (const p of POSTS) {
    const exists = await prisma.post.findUnique({ where: { slug: p.slug }, select: { id: true } });
    if (exists) {
      console.log(`skip (exists): ${p.slug}`);
      continue;
    }
    await prisma.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        contentHtml: p.contentHtml.trim(),
        status: PostStatus.PUBLISHED,
        publishedAt: p.publishedAt,
        categoryId: categoryIds.get(p.category) ?? null,
        readingMinutes: readingMinutes(p.contentHtml),
        tags: {
          create: p.tags.map((tag) => ({ tagId: tagIds.get(tag)! })),
        },
      },
    });
    console.log(`created: ${p.slug}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
