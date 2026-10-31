-- LaCuriosity website: columns the site reads + three placeholder articles.
-- Run once in Supabase → SQL Editor. Safe to re-run.

-- 1. Columns the website needs
alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists excerpt text;
alter table public.articles add column if not exists body_markdown text;
create unique index if not exists articles_slug_key on public.articles (slug);

-- 2. Public (anon) may read published articles only.
--    This policy only takes effect while RLS is enabled on the table. RLS is not
--    switched on here, because the Make.com pipeline may write with the anon key;
--    the site's query filters on status = 'published' either way.
drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
  on public.articles for select to anon
  using (status = 'published');

-- 3. Placeholder articles (delete later with: delete from articles where slug in (...))
insert into public.articles (pillar_id, title, topic, slug, excerpt, body_markdown, cover_image_url, status, published_at)
values
(
  '0e749e41-6007-485e-aa82-3173accd69e2', -- Human Mind
  'Why Your Brain Is Built to Forget',
  'Memory and forgetting',
  'why-your-brain-is-built-to-forget',
  'Forgetting isn''t a failure of memory. It''s the feature that lets you think at all.',
  $md$
In 1885, Hermann Ebbinghaus sat alone in a room memorising nonsense syllables — DAX, BUP, ZOL — and then timed how quickly they slipped away. The curve he drew is still one of the most famous graphs in psychology: we lose most of what we learn within a day, and the rest fades more slowly after that.

For a century, that curve was read as a story of loss. Memory was a vault, and forgetting was the leak. The newer view from neuroscience turns the story around.

## Forgetting is active work

Your brain spends real energy erasing things. Specialised proteins prune synapses that are not being used. New neurons born in the hippocampus quietly overwrite old connections. During sleep, the brain replays some of the day's experiences and lets others dissolve.

None of this is an accident. A system that kept everything would drown in detail. To decide what to do next, you need the gist of the past, not a perfect recording of it.

> A memory that never fades is a memory that can never generalise.

## The cost of remembering everything

In the 1920s, the Russian neuropsychologist Alexander Luria began studying a journalist who seemed unable to forget. He could repeat long tables of numbers years later, in either direction. Yet he struggled with ordinary life. Faces were hard for him to recognise, because every new expression looked like a different person. Metaphors confused him, because he saw every word as a vivid, literal image.

His gift shows what forgetting does for the rest of us. Letting the details blur is how the mind finds the pattern underneath them.

## Using it, not fighting it

If forgetting is the default, the useful question is not how to stop it but how to steer it. A few things reliably help:

- **Spacing.** Reviewing something just as you are about to forget it strengthens it more than cramming.
- **Retrieval.** Trying to recall an idea, even unsuccessfully, does more than re-reading it.
- **Sleep.** Much of the sorting between keep and discard happens overnight.

The brain is not a hard drive with a bad sector. It is an editor, constantly cutting. What survives the cut is what it has judged worth keeping — and you have more say in that judgement than you might think.
$md$,
  'https://mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/2026-04-17T07:02:16.297Z.png',
  'published',
  '2026-10-31T08:00:00Z'
),
(
  '297f2717-267b-45e4-865b-5eae070cfe64', -- The Construct
  'Every Program Is Slowly Falling Apart',
  'Software rot',
  'every-program-is-slowly-falling-apart',
  'Software doesn''t wear out — the world around it does. A short history of bit rot.',
  $md$
A bridge rusts. A shoe wears thin. Software, made of nothing but logic, should be immune to that kind of decay. Run the same code on the same input and you get the same answer, forever.

And yet anyone who has opened a project they wrote five years ago knows the feeling: it no longer builds, the libraries have moved on, and something that once worked perfectly now fails in ways nobody can explain. Engineers call this *bit rot*, and it is one of the strangest forces in technology.

## The code doesn't change. Everything else does.

A program never runs alone. It sits on an operating system, calls libraries, talks to servers, reads files in formats someone else defined. Each of those is maintained by other people, on other schedules, with other priorities.

When any one of them shifts — a security patch, a renamed function, a certificate that expires — the program's assumptions quietly stop being true. Nothing inside it changed. The world it was written for simply ended.

> Software doesn't wear out. It gets left behind.

## Rot you can see, rot you can't

Some decay is loud: a build that fails, a crash on start-up. Most of it is silent. A date library that never imagined a leap second. A sorting routine that was fast for a thousand users and crawls for a million. A security assumption that was reasonable in 2010 and reckless today.

The famous Year 2000 problem was bit rot at planetary scale. Programs written in the 1970s stored years as two digits to save precious memory. That was a sensible choice at the time. Thirty years later it threatened banks, power grids and airlines, and fixing it cost hundreds of billions of dollars.

## Living with entropy

There is no cure, only maintenance. The teams whose software ages well tend to do the same few things:

- **Pin and update deliberately.** Know exactly which versions you depend on, and move forward on purpose rather than by accident.
- **Test the boundaries.** Automated tests are a record of the assumptions you made, so you notice when they stop holding.
- **Keep it small.** Every dependency is another clock ticking.

Software feels permanent because it is invisible. But like a garden, it only stays alive while someone keeps tending it.
$md$,
  'https://mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/Gemini_Generated_Image_hwg7nmhwg7nmhwg7.png',
  'published',
  '2026-10-30T08:00:00Z'
),
(
  'b228ffc4-43ad-422e-b9d8-9a9836ab721a', -- The Planet
  'The Forest Beneath the Forest',
  'Mycorrhizal networks',
  'the-forest-beneath-the-forest',
  'Under every old-growth stand runs a fungal network trading sugar, water and nutrients between trees.',
  $md$
Walk through an old forest and you see individuals: a fir here, a birch there, each tree competing for light. Dig a few centimetres down and the picture changes. The roots are wrapped in fine white threads, finer than a human hair, running for kilometres through the soil. They belong to fungi, and they connect the forest into something closer to a single system.

## A trade older than trees

These partnerships are called *mycorrhizae*, from the Greek for "fungus" and "root". Roughly nine in ten land plants form them. The deal is simple. The plant makes sugar through photosynthesis and pays some of it to the fungus. The fungus, whose threads reach far further than any root, gathers water, phosphorus and nitrogen from the soil and hands them back.

The arrangement is ancient. Fossils suggest fungi were helping the first plants colonise bare land more than 400 million years ago. In a sense, forests exist because of this partnership.

> Most of a forest's life happens where we can't see it.

## Sharing, or just plumbing?

In the 1990s, the forest ecologist Suzanne Simard ran experiments with tagged carbon and found it moving between neighbouring trees, apparently through shared fungal networks. The idea of a "wood wide web", in which older trees nourish seedlings and send warnings to their neighbours, spread quickly.

More recent reviews urge caution. Field studies show the networks exist and that resources can move through them, but how much, and whether trees are truly "helping" one another, is still debated. The fungi have their own interests, and what looks like generosity may simply be plumbing.

## Why it matters

Whatever the final answer, the soil beneath a forest is not inert. It stores enormous amounts of carbon, much of it in fungal tissue. Clear-cutting and heavy fertiliser can break these networks apart, and they recover slowly.

- **Healthy fungi help forests regrow** after fire and logging.
- **They lock carbon into the soil**, sometimes for centuries.
- **They are easy to destroy and hard to rebuild.**

The next time you walk through a forest, it is worth remembering that you are standing on its most connected part.
$md$,
  null,
  'published',
  '2026-10-29T08:00:00Z'
)
on conflict (slug) do nothing;

-- 4. Check: should list the three slugs, and say whether RLS is on.
select slug, status, published_at from public.articles order by published_at desc;
select relrowsecurity as rls_enabled from pg_class where oid = 'public.articles'::regclass;
