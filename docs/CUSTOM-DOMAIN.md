# tanzilahmed.tech — GitHub Pages

Hosting GitHub Pages-এই থাকবে। Domain কেনা হয়েছে get.tech থেকে। Canonical address: `https://tanzilahmed.tech/`।

## DNS records

get.tech account-এ domain খুলে DNS Management / Manage DNS থেকে নিচের records বসান। Nameserver অন্য DNS provider-এর হলে সেই provider-এর panel-এ records বসাতে হবে। কেবল domain কেনার কারণে nameserver বদলানোর প্রয়োজন নেই।

| Type | Host / Name | Value / Destination | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | `3600` / default |
| A | `@` | `185.199.109.153` | `3600` / default |
| A | `@` | `185.199.110.153` | `3600` / default |
| A | `@` | `185.199.111.153` | `3600` / default |
| CNAME | `www` | `tanzilamd.github.io` | `3600` / default |

চারটি A record আলাদা entry হবে। Root domain-এর Host field `@`; panel root-এর জন্য blank চাইলে blank রাখুন। CNAME destination-এ `https://` বা `/` দেবেন না।

আগে থেকে root বা `www`-এ parking/forwarding/অন্য website-এর conflicting A, AAAA বা CNAME থাকলে সেগুলো replace করুন। Email-এর MX/TXT এবং অন্য subdomain-এর records রেখে দিন। Domain forwarding চালু থাকলে এই website-এর জন্য সেটি বন্ধ করুন।

IPv6 optional। চাইলে root (`@`)-এ চারটি AAAA record দিন: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`। অন্য server-এর পুরোনো AAAA রেখে দেবেন না।

## GitHub Pages activation

1. [Repository Settings → Pages](https://github.com/tanzilamd/tanzilamd.github.io/settings/pages) খুলুন। Source **GitHub Actions**-ই থাকবে।
2. Custom domain-এ `tanzilahmed.tech` লিখে **Save** করুন।
3. DNS check সফল ও certificate তৈরি হলে **Enforce HTTPS** চালু করুন। Certificate প্রস্তুত হওয়ার আগে option unavailable থাকতে পারে।

এই repository custom Actions workflow ব্যবহার করে। এই পদ্ধতিতে GitHub Pages `CNAME` file দিয়ে domain activate করে না; Settings-এর Custom domain আলাদাভাবে save করা জরুরি। `public/CNAME` domain record হিসেবে source-এ রাখা হয়েছে এবং build-এ copy হয়।

DNS propagation-এ সর্বোচ্চ ২৪ ঘণ্টা লাগতে পারে। Certificate issue হওয়ার পর HTTP এবং `www` থেকে canonical HTTPS address-এ redirect, homepage, project page ও assets খুলে যাচাই করুন।

## Repository configuration

- `astro.config.mjs`: canonical origin; metadata, social image URL, structured data ও sitemap এটি ব্যবহার করে।
- `public/robots.txt`: sitemap address।
- `public/CNAME`: domain name।
- `tests/site.test.mjs`: generated output-এর canonical origin, sitemap, robots এবং CNAME consistency যাচাই করে।

Content update-এর নিয়ম বদলায়নি: `master`-এ content commit করলে checks শেষে GitHub Actions deploy করবে। Domain বা hosting-এর জন্য আলাদা database লাগবে না।

Reference: [GitHub Pages custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
