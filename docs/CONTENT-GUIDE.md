# সহজে website-এর content update

এই website static এবং database ছাড়া চলে। UI/layout-এর নিয়ম আছে [UI guide](UI-GUIDE.md)-এ। প্রতিটি বিষয় একবার লিখবেন; সেই file থেকেই Home, list এবং detail page তৈরি হবে। **একটি বিশাল file নয়—প্রতিটি item-এর একটি file**, তাই একটি লেখা বদলাতে অন্য কিছুর মধ্যে খুঁজতে হবে না। Dark/light mode-এর জন্য আলাদা content লাগে না।

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
- **Activity:** `templates/activity.md.example`। `summary` Home ও Activities-এ একই source থেকে আসে। নিচে বিস্তারিত লিখুন। Icon-এর `art`: `debate`, `theatre`, `community`। `featured: false` করলে শুধু Activities-এ থাকবে।
- **Experience / recognition:** `templates/experience.md.example` বা `templates/milestone.md.example`। Award-এর সঠিক নাম, year এবং সহজ summary দিন। Nomination-কে win লিখবেন না। Unknown year বাদ রাখুন। Milestone-এর `featured: true` Home-এর প্রথম চারটি recognition-এ বাছাই করে।

সব collection-এ `draft: true` দিলে public page, list, feed ও sitemap থেকে item বাদ যায়। তবে source repository public হলে committed draft-এর source অন্য কেউ দেখতে পারে। ব্যক্তিগত draft নিজের কাছে রাখুন। `order` ছোট হলে আগে আসে; Writing-এর ক্ষেত্রে date আগে বিবেচিত হয়।

## Recognition badge ও proof image

একটি recognition-এর title, year, summary, link ও ছবি একই `src/content/milestones/*.md` file-এ থাকবে। Home ও About একই source ব্যবহার করে; filename `hacktoberfest` দিয়ে শুরু হলে Open source-এও আসে। এখন Home-এ সর্বোচ্চ চারটি featured item দেখা যায়।

ছবি আগে `src/assets/recognition/`-এ upload করুন। Milestone file-এ এই optional fields দিন:

```json
"image": "../../assets/recognition/hacktoberfest-completionist-2026.png",
"imageAlt": "Hacktoberfest 2026 Completionist badge, earned by Tanzil Ahmed.",
"imageLabel": "View badge",
"imagePresentation": "badge",
"url": "https://dev.to/tanzil_ahmed_e6a826eee8c4",
"urlLabel": "DEV profile"
```

এগুলো বিদ্যমান JSON object-এর অন্য field-এর সঙ্গে comma দিয়ে যোগ করবেন। `imagePresentation: "badge"` হলে ছোট artwork ও full-image link দেখা যায়। `"evidence"` দিলে শুধু proof image-এর link থাকে—YCPC leaderboard-এর মতো screenshot-এর জন্য ভালো। Default `evidence`। ছবি থাকলে অর্থপূর্ণ `imageAlt` লাগবেই; `imageLabel` দিয়ে “View badge” বা “View leaderboard” লিখতে পারেন। Website link-এর লেখা `urlLabel` দিয়ে বদলানো যায়। Source path হলো milestone file থেকে relative; `/media/` path-এর সঙ্গে গুলিয়ে ফেলবেন না।

Build নিজে responsive WebP badge images ও full proof তৈরি করে। ছবি পাল্টালে শুধু নতুন file upload করে ওই milestone-এর path/alt বদলালেই হবে; Home/About/Open source আলাদা edit লাগে না। Email বা analytics-এর tracking parameters ছাড়া clean public URL দিন। Nomination, badge ও contest position-এর ভাষা আলাদা রাখুন।

Debate club-এর former President role ও 2022–23 session আছে `src/content/activities/debate.md`-এ। এর summary বদলালে Home এবং Activities দুটোই update হয়; নিচের Markdown-এ বিস্তারিত থাকে।

## Activity photos / আসল ছবি বসানো

Debate, theatre এবং teaching/volunteering-এর ছবিগুলো সংশ্লিষ্ট activity file থেকেই আসে। বর্তমান gallery-তে তোমার নিজের event-এর ছবি আছে; এগুলো optimized WebP হিসেবে রাখা হয়েছে।

1. GitHub-এ `public/media/activities/` folder খুলে **Add file → Upload files** দিয়ে নিজের ছবি upload করুন। নাম দিন যেমন `debate-final-2023.webp`। ছোট ইংরেজি অক্ষর ও hyphen ব্যবহার করুন। সম্ভব হলে 1200–1600px চওড়া optimized WebP ছবি রাখুন। Camera-এর 10–15 MB original সরাসরি upload না করে ছোট web copy ব্যবহার করুন; সম্ভব হলে প্রতি ছবি কয়েকশ KB-এর মধ্যে রাখুন। শুধু filename-এর extension বদলালে ছবি ছোট বা WebP হবে না—image converter দিয়ে export করতে হবে।
2. যেমন debate-এর জন্য `src/content/activities/debate.md` খুলুন। প্রথম `{ ... }`-এর মধ্যে `gallery` array-তে ছবির তথ্য বদলান:

```json
"gallery": [
  {
    "src": "/media/activities/debate-final-2023.webp",
    "alt": "Tanzil speaking at the lectern during a debate.",
    "caption": "A moment from the final round.",
    "event": "Your actual event name",
    "year": "2023",
    "role": "Debater",
    "demo": false
  }
]
```

3. `src` হবে upload করা ছবির path; শুরুতে `public` লিখবেন না। `alt`-এ ছবিতে কী হচ্ছে তার বর্ণনা, `caption`-এ ছোট কথা দিন। `event`, `year`, `role` optional—নিশ্চিত না হলে field বাদ রাখুন। `year` double quote-এর মধ্যে থাকবে।
4. একাধিক ছবি দিতে `gallery`-র মধ্যে দ্বিতীয় `{ ... }` যোগ করুন, মাঝখানে comma দিন। Caption ও বড় viewer-এর photo count নিজে update হবে। সব ছবির frame সমান থাকবে—desktop-এ দুই column, mobile-এ এক column। যে ছবিটি আগে দেখাতে চান, সেটি array-তে প্রথমে রাখুন। আলাদা layout file edit করতে হবে না। সব ছবি সরাতে `"gallery": []` রাখুন।
5. আসল ছবি বসালে সংশ্লিষ্ট `demo` হবে **false**, এবং demo alt/caption-ও বাস্তব বর্ণনা দিয়ে বদলাবেন। বাকি demo ছবিতে label থাকবে।
6. Activity-এর `"homePreview": true` থাকলে তার **প্রথম ছবিটি Home-এও দেখাবে**। বর্তমানে theatre-তে true আছে। অন্য activity বেছে নিতে পুরোনোটিতে false ও নতুনটিতে true দিন। Featured activity-গুলোর মধ্যে প্রথম নির্বাচিতটি ব্যবহার হবে; কোনোটি না বাছলে ছবি আছে এমন প্রথম featured activity বেছে নেবে।
7. Commit করুন; Actions সফল হলে Home ও Activities-এ একই data থেকে update দেখা যাবে। Component edit লাগবে না।

ছবিতে click করলে বড় viewer খুলবে। আগের/পরের button অথবা keyboard-এর arrow দিয়ে browse করা যাবে; Escape বা Close দিয়ে বন্ধ হবে। JavaScript বন্ধ থাকলেও ছবির link খুলবে। Thumbnail-এ crop হলেও বড় viewer-এ পুরো ছবি দেখা যায়। Portrait ও landscape—দুটিই ব্যবহার করতে পারবেন। নতুন real photos-এর জন্য পুরোনো demo filename ব্যবহার না করে নিজের বর্ণনামূলক filename দিন।

## পরিচিতি ও contact বদলানো

Home-এর typing animation-এও `profile.json`-এর `headline` এবং `headlineAccent` ব্যবহার হয়। এই দুই জায়গায় লেখা বদলালেই হবে; animation-এর code edit করার দরকার নেই। প্রতিটি tab-এ প্রথম Home visit-এ একবার চলে। আবার দেখতে নতুন tab খুলুন। Device-এ reduced motion চালু থাকলে পুরো লেখাটি সরাসরি দেখাবে। নতুন native article যোগ করলে reading-progress line-ও নিজে পাওয়া যাবে।

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

## Play page বদলানো

Footer-এর খোলা **Take a little break** link থেকে `/play/` খুলবে। পাঁচটি activity-র আলাদা page আছে: `/play/tic-tac-toe/`, `/play/stack-tower/`, `/play/playground/`, `/play/drawing-pad/`, `/play/do-not-press/`। Play-এর content বদলাতে শুধু `src/data/play.json` edit করুন:

- `headline`, `headlineAccent`, `intro`: page-এর শুরুর লেখা।
- `activities`: পাঁচটি card-এর title, label, description ও action text। `id` (`tic-tac-toe`, `stack-tower`, `playground`, `draw`, `button`) অপরিবর্তিত রাখুন—এগুলো shareable URL ও controls-এর সঙ্গে যুক্ত।
- `prompts`: drawing-এর **Give me a prompt** button-এর লেখা। Array-তে নতুন quoted sentence যোগ করতে পারেন; অন্তত একটি রাখুন।
- `palette`: drawing-এর রঙের নাম ও `#RRGGBB` value। অন্তত একটি রং রাখুন।
- `pocket.label`: fixed **✦** button-এর screen-reader label। Click করলে visible screen জুড়ে প্রায় 5.5 সেকেন্ডের effect হয়; কোনো popup text বা tooltip নেই। পুরোনো `pocket.messages` সরানো হয়েছে।
- `reactions`: **Do not press** game-এর message, caption ও effect। সমর্থিত effect: `balloon`, `flip`, `confetti`, `duck`, `bubbles`। অন্তত একটি reaction রাখুন; page-এর আসল লেখা বা portfolio নষ্ট হয় না।

উদাহরণ: নতুন drawing prompt দিতে `prompts`-এ `"Draw a tiny moon with a garden."` যোগ করুন। প্রতিটি item-এর মাঝে comma লাগবে; JSON-এ শেষ item-এর পরে comma দেবেন না। Build-এ খালি list, ভুল color বা unsupported effect ধরা পড়বে; invalid content live হবে না। Commit করলে স্বাভাবিক master deployment চলবে।

Drawing চলতি browser tab-এর `sessionStorage`-এ থাকে; একই tab-এ game বদলে বা normal reload করে ফিরলে পাওয়া যাবে। Tab/session শেষ হলে browser এটি সরিয়ে দিতে পারে; স্থায়ীভাবে রাখতে **Download PNG** ব্যবহার করুন। Browser storage বন্ধ থাকলে reminder দেখাবে, drawing/export তবুও কাজ করবে। Undo/Redo buttons বা Ctrl/Cmd+Z ও Ctrl/Cmd+Shift+Z ব্যবহার করা যায়। History সীমিত এবং reload-এ পুরো undo history রাখা হয় না। কোনো drawing server-এ পাঠানো বা gallery-তে প্রকাশ করা হয় না।


Tic-tac-toe-তে **Computer** (Easy/Hard) বা **A friend** বেছে নিন। A friend একই screen-এ দুজনের খেলা। Computer-এর বিরুদ্ধে X/O বদলালেও নিজের win/loss নিজেরই থাকে; Easy, Hard ও local two-player scores আলাদা। **Reset scores** শুধু চলতি mode-এর score মুছে দেয়; **New round** বোর্ড নতুন করে।

Stack Tower-এর **Chill** একটু ধীর, **Classic** দ্রুত, আর **Step mode**-এ timer নেই। Start stacking দিয়ে শুরু করে tap/click/Space/Enter দিয়ে drop করুন। Step mode-এ Left/Right button বা arrow key দিয়ে block সরানো যায়; Shift+arrow ছোট adjustment করে। তিনটি perfect landing-এ কিছু width ফেরত পাওয়া যায়। Pause/Resume ও New game আছে। Scroll করে play area ছেড়ে গেলে বা অন্য tab-এ গেলে game pause হবে; Resume করে ফিরতে হবে। Reduced motion থাকলে শুরুতেই Step mode বেছে নেওয়া হয়। প্রতিটি pace-এর best score device-এ থাকে; clear site data করলে মুছে যাবে। Browser storage বন্ধ থাকলেও দুটো game খেলা যায়।

Game-এর নিয়ম বদলানো content edit নয়: UI আছে `src/components/games/`, controllers ও rules আছে `src/scripts/play/` ও `src/scripts/play/games/`-এ। শুধু title/description/card text বদলাতে JSON-ই যথেষ্ট; নতুন engine ছাড়া নতুন game ID যোগ করবেন না।
