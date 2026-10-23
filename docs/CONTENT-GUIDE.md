# সহজে website-এর content update

এই website static এবং database ছাড়া চলে। প্রতিটি বিষয় একবার লিখবেন; সেই file থেকেই Home, list এবং detail page তৈরি হবে। **একটি বিশাল file নয়—প্রতিটি item-এর একটি file**, তাই একটি লেখা বদলাতে অন্য কিছুর মধ্যে খুঁজতে হবে না। Dark/light mode-এর জন্য আলাদা content লাগে না।

## GitHub থেকেই edit করুন

1. Repository খুলুন: https://github.com/tanzilamd/tanzilamd.github.io । Branch হিসেবে **master** রাখুন।
2. নিচের তালিকা থেকে প্রয়োজনীয় file খুলুন। Pencil / **Edit this file** চাপুন।
3. লেখা বদলে **Commit changes** করুন। আপনি চাইলে সরাসরি master-এ commit করতে পারেন।
4. **Actions → Check and deploy portfolio** খুলে সর্বশেষ run দেখুন। Build ও deploy সবুজ হলে নতুন version প্রকাশিত হয়েছে। Workflow চলাকালে পুরোনো version দেখা স্বাভাবিক।
5. Live page refresh করুন। দরকার হলে hard refresh দিন। লাল হলে failed step-এর error দেখুন; একই commit বারবার push করার প্রয়োজন নেই।

| কী বদলাবেন | কোথায় বদলাবেন | কোথায় দেখা যাবে |
| --- | --- | --- |
| নাম, headline, পরিচিতি, About bio, email, GitHub/LinkedIn | `src/data/profile.json` | Home, About, Contact, footer, author ও metadata-তে প্রযোজ্য অংশ |
| Project | `src/content/projects/প্রজেক্টের-নাম.md` | Work, নিজের detail page; featured হলে Home |
| Open-source contribution | `src/content/contributions/একটি-item.md` | Open source; featured হলে Home |
| নিজের article/essay বা বাইরের article link | `src/content/notes/একটি-লেখা.md` | Writing; featured লেখা Home ও personal essay About-এ |
| চাকরি / কাজের experience | `src/content/experience/একটি-item.md` | About |
| Award / recognition | `src/content/milestones/একটি-item.md` | About; featured হলে Home; Hacktoberfest হলে Open source-ও |
| Debate, theatre, teaching, volunteering | `src/content/activities/একটি-item.md` | Activities এবং featured হলে Home |
| নিজের ছবি | `src/assets/tanzil.jpg` | Home ও About |
| Article/project-এর ছবি | `public/media/` | যেখানে সেই ছবির path ব্যবহার করবেন |

উদাহরণ: Scouts-এর তথ্য বদলাতে শুধু `src/content/activities/teaching.md` edit করুন। তার `summary` Home ও Activities দুই জায়গাতেই বদলাবে। “Grandma’s Xbox”-এর সব লেখা ও date আছে `src/content/notes/grandmas-xbox.md`-তে।

## নিজের নতুন article / essay প্রকাশ করুন

1. `templates/post.md.example` খুলে পুরো লেখা copy করুন।
2. `src/content/notes/` folder-এ **Add file → Create new file** চাপুন। নাম দিন যেমন `my-first-article.md`। ছোট ইংরেজি অক্ষর ও hyphen ব্যবহার করুন; space নয়।
3. Template paste করুন। `title`, `summary`, `date`, `tags` বদলান। `date` হলো এই site-এ প্রথম প্রকাশের দিন: **YYYY-MM-DD**, যেমন `2026-10-23`।
4. দ্বিতীয় `---`-এর নিচে আপনার পুরো লেখা লিখুন। প্রতিটি paragraph-এর মাঝে একটি খালি line রাখুন।
5. Essay হলে `genre` দিন `Essay`; অন্য লেখা `Article` বা `Note` হতে পারে।
6. প্রস্তুত হলে `draft: true`-এর জায়গায় `draft: false` দিন। JSON-style template হলে উদ্ধৃতি ও comma ঠিক রাখুন। `featured: true` দিলে featured selection-এ আসবে।
7. Commit করুন। Deploy শেষ হলে `https://tanzilahmed.tech/notes/my-first-article/` খুলুন। Writing list, RSS feed ও sitemap নিজে থেকেই update হবে।

নিজের article-এর জন্য আলাদা `url` দরকার নেই। একই file-এ title, card summary, date এবং পুরো body থাকবে। নতুন article-এর জন্য page বা component বানাতে হবে না।

### আগে লেখা essay ও পরে edit করার date

পুরোনো লেখা প্রকাশ করলে `date` এখনকার publication date রাখুন। চাইলে আরও field যোগ করুন:

```json
"dateWritten": "2024",
"context": "Originally written for university admission applications.",
"updated": "2026-10-24"
```

এগুলো অন্য field-এর সঙ্গে প্রথম `---` ও দ্বিতীয় `---`-এর মাঝের `{ ... }`-তে থাকবে। Field-এর মাঝে comma দিন; শেষ field-এর পরে comma নয়। `dateWritten` শুধু year অথবা পূর্ণ date হতে পারে। `updated` প্রকাশের দিনের আগে হতে পারবে না। ছোট বানান সংশোধনে date বদলানো জরুরি নয়; বড় update হলে `updated` দিন, মূল `date` রেখে দিন।

“Grandma’s Xbox”-এ **Written 2024** এবং **Posted 23 October 2026** আলাদা দেখায়। ২০২৪ সালের essay-এর বক্তব্যকে নতুন বর্তমান achievement হিসেবে আলাদাভাবে যোগ করা হয়নি।

### অন্য website-এর article link

`templates/note.md.example` copy করে একই `src/content/notes/` folder-এ নতুন `.md` file বানান। এখানে `kind` হবে `external`; `platform`, আসল `url`, `title`, `summary`, আসল publication `date` দিন। পুরো দিন না জানলে `YYYY-MM` চলবে। `draft: false` দিয়ে publish করুন। Writing-এ দুটো filter আছে: **On this site** ও **Elsewhere**।

### Writing-এর ক্রম ও highlight

Writing list-এ নতুন publication date আগে আসে। একই date হলে ছোট `order` আগে। Home-এ প্রথম featured লেখা দেখায়; featured না থাকলে সর্বশেষ লেখা। About-এ প্রথম featured personal essay দেখায়। একাধিক লেখা থাকলে কেবল পছন্দের লেখাটিতে `featured: true` রাখতে পারেন।

## Markdown-এর প্রয়োজনীয় কিছু নিয়ম

```md
একটি paragraph।

আরেকটি paragraph।

## একটি subheading

**Bold**, *italic*, [link](https://example.com)

- প্রথম item
- দ্বিতীয় item

![ছবির অর্থপূর্ণ বর্ণনা](/media/my-photo.webp)
```

ছবি আগে `public/media/`-তে upload করুন; লেখায় path হবে `/media/...`—`public` লিখবেন না। ছোট, optimized image ব্যবহার করুন। Private document বা original application PDF এখানে upload করবেন না।

## অন্য item যোগ করার নিয়ম

Matching template copy করে matching folder-এ নতুন `.md` file বানান। প্রতিটি filename আলাদা হতে হবে। প্রথম দুই `---`-এর মধ্যে structured information, নিচে সাধারণ Markdown body। Template-এ JSON ব্যবহার করা হয়েছে, ordinary YAML-ও চলে।

- **Project:** `templates/project.md.example`। Category: `Product`, `Tool`, `Experiment`, `Earlier work`। `featured: true` ও ছোট `order` দিয়ে Home-এর প্রথম চারটি project বেছে নিন। নতুন project-এ `cover: "custom"` দিন, অথবা `/media/`-এর ছবি `coverImage` এবং বর্ণনা `coverAlt` দিন। নতুন file-এর নামই `/work/file-name/` URL হবে।
- **Contribution:** সাধারণ PR-এর জন্য `templates/contribution.md.example`; published website-এর জন্য `templates/website-contribution.md.example`। একটি PR একবারই যোগ করুন। `Merged`, `Open`, `Closed`, `Published` সঠিকভাবে দিন। Personal fork merge-কে upstream contribution বলবেন না। `featured` দিয়ে Home-এর তিনটি highlight; `spotlight: true` দিয়ে Open source-এর বিস্তারিত highlight বাছাই হয়।
- **Activity:** `templates/activity.md.example`। `summary` Home ও Activities-এ একই source থেকে আসে। নিচে বিস্তারিত লিখুন। Illustration-এর `art`: `debate`, `theatre`, `community`। `featured: false` করলে শুধু Activities-এ থাকবে।
- **Experience / recognition:** `templates/experience.md.example` বা `templates/milestone.md.example`। Award-এর সঠিক নাম, year এবং সহজ summary দিন। Nomination-কে win লিখবেন না। Unknown year বাদ রাখুন। Milestone-এর `featured: true` Home-এর প্রথম তিনটি recognition-এ বাছাই করে।

সব collection-এ `draft: true` দিলে public page, list, feed ও sitemap থেকে item বাদ যায়। তবে source repository public হলে committed draft-এর source অন্য কেউ দেখতে পারে। ব্যক্তিগত draft নিজের কাছে রাখুন। `order` ছোট হলে আগে আসে; Writing-এর ক্ষেত্রে date আগে বিবেচিত হয়।

## পরিচিতি ও contact বদলানো

`src/data/profile.json` খুলে প্রয়োজনীয় text বদলান:

- `siteTitle`: browser/search title; `description`: search/social preview।
- `headline`, `headlineAccent`, `intro`: Home-এর পরিচিতি।
- `about.heading`, `about.paragraphs`: About-এর bio; প্রতিটি paragraph আলাদা string।
- `email`: public contact email। খালি string রাখলে email actions লুকাবে।
- `socialLinks`: GitHub/LinkedIn-এর URL, label ও contact description। একই তালিকা Contact, footer এবং profile metadata-তে ব্যবহৃত হয়।
- `portraitAlt`, `portraitCaption`: ছবির বর্ণনা ও caption। ছবি বদলাতে একই নামে `src/assets/tanzil.jpg` replace করুন; optimized images নিজে তৈরি হবে।

JSON-এ text double quote-এর মধ্যে রাখুন। লেখার মধ্যে double quote লাগলে `\"` ব্যবহার করুন। কোনো key-এর নাম অকারণে বদলাবেন না। About paragraph edit করলে component edit করার প্রয়োজন নেই।

## ভুল হলে

GitHub-এ file-এর **History** থেকে আগের version দেখতে পারবেন। Edit করে আগের text ফিরিয়ে নতুন commit দিন। এটি সরাসরি master edit করলেও কাজ করে। File rename করলে article/project-এর URL বদলে যাবে—পুরোনো link রাখার জন্য অকারণে rename করবেন না।

নিজের computer থেকে চাইলে:

```sh
npm ci
npm run check
npm run build
npm test
npm run test:authoring
npm run test:browser
```

Browser ও authoring tests একসঙ্গে চালাবেন না; authoring test সাময়িক fixture দিয়ে build করে, শেষে সেগুলো সরিয়ে আসল site rebuild করে। নতুন code না লিখে শুধু content edit করলেও GitHub Actions-এ checks নিজে চলে। Hosting-এর জন্য database বা paid service যোগ করতে হবে না।
