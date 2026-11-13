# SEO and Growth Roadmap

Status of the base technical SEO: done (metadata, canonical, sitemap, robots, Search Console, FAQ JSON-LD). See `docs/SEO-GSO.md`.
This file lists what is still needed to rank and get traffic. Tick items off as they are done.

## 0. Domain decision (do first, so nothing is redone)

- [ ] Pick the final domain and brand name before building pages or doing outreach. Changing later means redoing backlinks and Search Console.
- [ ] Check the name is free and not close to an existing trademark. "RemoveBG" is close to remove.bg, so consider a different brand.
- [ ] Prefer `.com`, `.app`, `.io` or `.ai` over `.online` if the budget allows. `.online` is cheap and Google does not penalise it, but users trust it less and it is often used by spam sites.
- [ ] Prefer a name that says what the tool does (background, cutout, transparent). "instantphoto" suggests instant-camera or photo printing.
- [ ] Buy the domain, add it in Vercel, and set it as the primary domain.
- [ ] Update the domain everywhere: `metadataBase`, canonical, Open Graph, `sitemap.ts`, `robots.ts`, JSON-LD, `docs/SEO-GSO.md`.
- [ ] Add a Search Console "Domain" property for the new domain and submit the sitemap.
- [ ] 301-redirect `removebg-online.vercel.app` to the new domain, and use Search Console's Change of Address if it applies.

### Domain shortlist (availability NOT checked; verify on a registrar and search the name for trademarks)

Plan: broad photo-editor brand (later: resizer, upscaler, etc.), with the first tool at `/background-remover`.

- Broad names: pixelmint, pixelforge, pixlo, pixelnest, snapforge, cutmint, clipforge, snapnova, photonest, fotoforge, photoloom, picnova, lumiq, fotora, editra, picly
- Background-removal-only names: cutoutpro, clearcutout, bgclean, transparentify, snapcutout, erasebg
- Rules: no hyphens or numbers, easy to spell, not close to Picsart/Photoroom/Canva/remove.bg, free social handles.
- Fallback: `instantphoto.online` works but is weak (`.online` trust, name suggests instant cameras).

## 1. Technical checks

- [ ] Run Lighthouse and PageSpeed Insights on mobile. Fix LCP, CLS and INP.
- [ ] Check the Search Console "Pages" report for indexing problems.
- [ ] Confirm the homepage HTML contains real text (view-source), not only client-rendered content.
- [ ] Check `og-image.png` is 1200×630 and under 1 MB.
- [ ] Add `Organization`/`WebSite` and `SoftwareApplication` (with `offers`, free) JSON-LD alongside the FAQ schema.
- [ ] Add a favicon set (32×32, 192×192, 512×512, `apple-touch-icon`).
- [ ] Add `/privacy`, `/terms` and `/contact` pages. They build trust and are needed for some directories and ad networks.

## 2. Hosting for quality (affects user experience and reviews)

- [ ] Move the engine to a container host so users get BiRefNet results, not the browser fallback (see `HANDOFF.md` section 4).
- [ ] Fix the 413 upload limit by sending uploads to the container, not through Vercel functions.

## 3. Pages to build (one per search intent)

Each page needs its own title, meta description, H1, 400+ words of useful content, a working tool or demo, internal links, and a sitemap entry.

- [ ] `/remove-background-from-image`
- [ ] `/transparent-background-maker` (transparent PNG)
- [ ] `/white-background-for-product-photos` (e-commerce, Amazon, Etsy, Shopify)
- [ ] `/remove-background-from-logo`
- [ ] `/passport-photo-background` (ID and passport photos)
- [ ] `/change-photo-background` (replace with colour or image)
- [ ] `/remove-background-from-signature`
- [ ] `/removebg-alternative` (comparison page)
- [ ] `/blog` with guides, such as "How to remove a background without Photoshop" and "Best free background removers compared"
- [ ] A `/how-it-works` page that explains the AI and privacy, if the images are processed privately
- [ ] Add every page to `sitemap.ts` and link them from the navbar or footer.

Other tools from the commented list in `sitemap.ts` (compressor, resizer, upscaler) are optional and only worth it if built properly.

## 4. Keywords to target (long-tail first)

- free background remover no signup
- remove background from image transparent png
- remove background online without uploading (only claim this if the browser path is used)
- background remover for product photos
- remove.bg alternative free
- passport photo background remover
- remove white background from image
- make image background transparent

Validate volume and difficulty with Google Keyword Planner, Search Console queries, or a free tool such as Ubersuggest, because I have not measured search volumes.

## 5. Backlinks and launch

- [ ] Product Hunt launch (prepare logo, screenshots, a short demo GIF, first comment).
- [ ] Listings: AlternativeTo (as an alternative to remove.bg), There's An AI For That, Futurepedia, Toolify, SaaSHub, BetaList, Uneed, Indie Hackers.
- [ ] Hacker News "Show HN" (works best if the tool runs privately in the browser or is open source).
- [ ] Reddit posts in relevant communities (check each subreddit's self-promotion rules): r/SideProject, r/webdev, r/photography, r/ecommerce.
- [ ] GitHub: public repo with a good README (not including the model files), and an awesome-list submission.
- [ ] Write posts on dev.to, Hashnode or Medium about how the pipeline works (BiRefNet + ViTMatte), with before/after images and a link back.
- [ ] YouTube or short video demo with the link in the description.
- [ ] Reach out to bloggers and e-commerce newsletters for roundups.
- [ ] Answer questions on Quora and Stack Exchange with a relevant link (sparingly).
- [ ] Do not buy links or use link farms. Google penalises them.

## 6. Content and trust signals

- [ ] Before/after gallery with real examples (hair, fur, products).
- [ ] Clear privacy statement (what is stored, for how long).
- [ ] About page with a real person or team name.
- [ ] Use cases and short tutorials, with images that have descriptive alt text.

## 7. Measure and iterate

- [ ] Search Console: weekly review of queries, impressions, CTR and indexing.
- [ ] Add analytics (for example Plausible or Google Analytics).
- [ ] Rewrite titles and descriptions for pages that get impressions but low CTR.
- [ ] Expect months, not days, for a new domain to rank for competitive terms.
- [ ] Track brand search (`"<brand>"`) and `site:<domain>` as early signals.

## 8. Suggested order

1. Domain and brand decision, and the engine hosting fix.
2. Technical checks and the trust pages.
3. Three to five landing pages and the comparison page.
4. Launch on Product Hunt and the directories, then the community posts.
5. Blog content every one to two weeks.
6. Review Search Console monthly and adjust.
