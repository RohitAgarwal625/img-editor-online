# Task: Implement Complete Technical SEO and Google Search Optimization

You are working on my existing project: **img-editor-online**.

Production website: https://removebg-online.vercel.app/

Technology: Next.js (single-page image editor application).

Your task is to inspect the entire existing repository, understand its architecture, and implement a complete, production-ready SEO configuration.

IMPORTANT: Do not blindly overwrite existing files. First inspect the project structure, existing components, routing architecture, metadata, configuration, and dependencies. Follow the existing coding conventions and preserve all existing application functionality.

## 1. Repository Inspection

Before making changes:

- Identify whether the project uses Next.js App Router or Pages Router.
- Identify whether TypeScript or JavaScript is being used.
- Inspect the existing root layout, homepage, components, and configuration.
- Identify existing SEO metadata, sitemap, robots.txt, and favicon.
- Determine whether the homepage is server-rendered, statically generated, or client-rendered.
- Check whether the homepage currently has "use client".
- Identify existing image upload, image processing, and background removal functionality.

Do not make unnecessary architectural changes.

## 2. Implement Complete Metadata

Configure appropriate SEO metadata for the homepage.

Website URL:
https://removebg-online.vercel.app/

Brand:
RemoveBG Online

Requirements:

- SEO-optimized page title.
- Unique meta description.
- Application name.
- Canonical URL.
- Robots index and follow directives.
- Googlebot indexing directives.
- Open Graph title, description, URL, site name, and image.
- Twitter card metadata.
- Appropriate language and viewport configuration.
- Favicon and application icons where applicable.

Suggested homepage title:

Free AI Background Remover Online | RemoveBG Online

Suggested description:

Remove image backgrounds online with AI. Upload your photo and get a clean transparent background in seconds. Fast, simple and easy to use.

Use Next.js native metadata APIs wherever possible.

Avoid duplicate or conflicting metadata.

## 3. Canonical URL Configuration

Set the canonical homepage URL to:

https://removebg-online.vercel.app/

Ensure the canonical URL is absolute and consistent.

Check whether Vercel preview deployments or alternative hostnames could accidentally become canonical URLs.

Do not accidentally make preview deployments the preferred production URL.

Do not introduce unnecessary redirects.

## 4. Sitemap Implementation

Create a dynamic Next.js sitemap using the appropriate routing convention.

The sitemap must be accessible at:

https://removebg-online.vercel.app/sitemap.xml

For now, include the homepage.

Use the correct XML format and absolute production URLs.

Structure it so additional SEO pages can be added easily in the future.

Do not include private, temporary, API, upload, or internal routes.

## 5. Robots.txt Implementation

Create a Next.js robots configuration accessible at:

https://removebg-online.vercel.app/robots.txt

Requirements:

- Allow search engine crawlers to access public website content.
- Do not accidentally block CSS, JavaScript, images, or other rendering resources.
- Reference the production sitemap.
- Avoid blocking the homepage.

Inspect existing robots configurations before creating anything to prevent conflicts.

## 6. Homepage SEO and Content Optimization

Inspect the actual homepage design and functionality.

Improve the semantic HTML structure without changing the existing visual design unnecessarily.

Requirements:

- One clear primary H1.
- Appropriate H2 and H3 headings.
- Meaningful image alt attributes.
- Descriptive button labels.
- Semantic sections.
- Accessible content.
- Relevant textual content describing the actual product.

The homepage should clearly communicate:

- What RemoveBG Online does.
- How image background removal works.
- How users upload images.
- How users obtain their processed images.
- Supported image formats, but only those genuinely supported.
- Actual product benefits and limitations.

Do not invent features, performance claims, or unsupported functionality.

Do not stuff keywords unnaturally.

## 7. Server-Side Rendering and Client Components

This is particularly important.

My application is an interactive image editor.

Inspect whether the entire homepage is unnecessarily implemented as a client component.

Where practical, separate the application into:

- A server-rendered homepage containing SEO-friendly content.
- Client-side components responsible for image uploading, editing, processing, and interactions.

Use the existing architecture wherever possible.

Do not break:
- Image uploads.
- Background removal.
- Image previews.
- Editing functionality.
- Download functionality.
- Existing API integrations.
- Existing responsive layouts.

Preserve all existing functionality.

## 8. Open Graph Image

Check whether an Open Graph image already exists.

If it does not, create a suitable image at:

public/og-image.png

Target dimensions: 1200 × 630 pixels.

It should represent RemoveBG Online and its AI image editing functionality.

Make sure the metadata references the correct image path.

Do not create a broken image reference.

## 9. Google Search Console Verification

I have already verified ownership of:

https://removebg-online.vercel.app/

Do not remove or overwrite any existing Google verification token.

Inspect whether verification is already configured.

If it is missing, prepare the configuration so that I can add my existing Google verification code.

Do not invent a verification token.

## 10. Structured Data / Schema.org

Implement appropriate JSON-LD structured data where justified.

Use relevant schema types such as:

- WebSite
- WebApplication

Include only information that is genuinely accurate.

Do not invent:
- Ratings.
- Reviews.
- Pricing.
- Organization details.
- Unsupported product claims.

Ensure JSON-LD is valid and does not contain conflicting information.

## 11. Technical SEO Checks

Inspect and fix SEO-related issues where possible:

- Broken internal links.
- Missing page titles.
- Missing meta descriptions.
- Duplicate metadata.
- Incorrect canonical URLs.
- Missing image alt attributes.
- Accidental noindex directives.
- Incorrect robots configuration.
- Missing sitemap.
- Broken metadata image references.
- Unnecessary redirects.
- Inaccessible public homepage content.

Check whether the production site is configured to return a successful HTTP response.

Do not expose API keys, environment variables, or private configuration.

## 12. Future SEO Scalability

Structure the SEO configuration so I can later add individual landing pages for:

- Background Remover.
- Image Compressor.
- Image Resizer.
- Image Upscaler.
- Image Format Converter.
- AI Image Editor.

Do not create empty or duplicate SEO pages now.

Ensure future pages can have their own titles, descriptions, canonical URLs, and sitemap entries.

## 13. Validation

After implementing changes:

- Run the existing lint command.
- Run TypeScript checks if applicable.
- Run the production build.
- Fix errors introduced by your changes.
- Check generated metadata.
- Verify sitemap and robots routes.
- Verify canonical URL output.
- Verify structured data.
- Check that the original image editor functionality remains intact.

Do not claim that Google has indexed the website. That must be checked separately through Google Search Console.

## 14. Final Report

When finished, provide:

1. Files inspected.
2. Files created.
3. Files modified.
4. SEO features implemented.
5. Any existing issues discovered.
6. Build and validation results.
7. Any manual steps I still need to perform.
8. Exact URLs I should test after deployment.

## STRICT RULES

- Preserve existing application functionality.
- Follow the repository's existing architecture and coding conventions.
- Avoid unnecessary dependencies.
- Do not overwrite existing working implementations blindly.
- Do not invent credentials or verification tokens.
- Do not introduce fake SEO content.
- Do not change the GitHub repository name.
- Do not change the Vercel project name.
- Do not deploy or push to GitHub without my explicit permission.
- Make the changes directly in the existing local repository.

The objective is to make RemoveBG Online technically SEO-ready and properly configured for Google indexing.