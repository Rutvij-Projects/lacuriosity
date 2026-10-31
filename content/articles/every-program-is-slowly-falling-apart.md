---
title: Every Program Is Slowly Falling Apart
pillar: the-construct
excerpt: Software doesn't wear out — the world around it does. A short history of bit rot.
cover: https://mskwqqbigtauakojpyhn.supabase.co/storage/v1/object/public/covers/Gemini_Generated_Image_hwg7nmhwg7nmhwg7.png
publishedAt: 2026-10-30T08:00:00Z
---

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
