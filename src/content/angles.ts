/**
 * Angle library for the general blog archetypes.
 *
 * Each post is one archetype (a cost guide, a checklist, a comparison…) shot
 * from a particular angle. Without a second dimension every post of the same
 * archetype came out as the same article with the industry name swapped —
 * which reads as a content farm to a crawler and to a reader.
 *
 * An angle contributes:
 *   - a section heading and body that the archetype's template cannot supply
 *   - a question-and-answer pair that belongs to that angle alone
 *
 * Tokens available in `body` and in the FAQ answer:
 *   {kw}      the post's primary keyword
 *   {loc}     the long location label, e.g. "the United Kingdom"
 *   {locShort} the short location label, e.g. "United Kingdom"
 *   {ind}     the industry, lower-cased
 *   {s}       the service, lower-cased
 *   {currency} the local currency
 *   {country} the country long name
 */

export interface PostAngle {
  /** Short fragment used for the block id. */
  slug: string;
  /** The keyword fragment this angle contributes to the page's keyword. */
  keyword: string;
  /** The section heading. */
  heading: string;
  /** The section body. */
  body: string;
  /** A question and answer that belongs to this angle alone. */
  faq: { q: string; a: string };
}

/** How many angles exist per archetype. */
export const ANGLES_PER_TYPE = 8;

export const POST_ANGLES: Record<string, PostAngle[]> = {
  'how-to': [
    {
      slug: 'brief',
      keyword: 'Brief',
      heading: 'Start from the brief, not the briefcase',
      body:
        'The most reliable way to approach {kw} in {loc} is to write the brief before you speak to anyone. One paragraph: who the site is for, what it must achieve, and what happens after someone makes contact. Everything else — page count, imagery, motion, integrations — is derived from that paragraph rather than decided in a meeting. Providers who can restate your brief back to you in one sentence have understood the project; providers who immediately talk about templates have not. In {ind} the commercial consequence of getting this wrong is specific: a site built for general awareness produces enquiries that no one can act on, and the cost of that shows up in the sales team\'s inbox rather than in the design review.',
      faq: {
        q: 'How long should a website brief be before you send it to providers?',
        a: 'One page is enough. A page of written scope — objective, audience, pages, proof, non-negotiables and a budget ceiling — gives every provider something comparable to quote against, and it takes about twenty minutes to write.',
      },
    },
    {
      slug: 'page-list',
      keyword: 'Page List',
      heading: 'Write the page list before anyone proposes a site map',
      body:
        'Count the pages you actually need and write them down. Most {ind} businesses in {loc} are served by seven to fifteen pages, and a page count that climbs past twenty usually signals an information-architecture problem rather than a content shortage. Each page should earn its place by having one job: one action it exists to drive. A page whose job cannot be stated in a sentence should either be merged into a stronger page or removed. Doing this before the design conversation means the page list becomes a constraint you set rather than a suggestion you receive, and it is the fastest way to bring a quote down without losing anything that matters.',
      faq: {
        q: 'How many pages does a small business website actually need?',
        a: 'For most {ind} businesses in {locShort}, seven to fifteen pages is the working range: home, services, about, one page per core service, contact, and a small number of proof pages. Add a page only when it has a job of its own.',
      },
    },
    {
      slug: 'assets',
      keyword: 'Asset Checklist',
      heading: 'Gather what you already own before you are asked for it',
      body:
        'Logo in vector format, brand colours, photography you own, service descriptions in writing, and your proof: reviews, case studies, numbers, credentials, photographs of the work. Providers who have to source all of this from scratch charge for it and lose days doing it. In {loc} the difference is bigger than it looks, because a project that stalls in the content phase is a project that misses the launch window and pushes delivery into the next pricing period. The single most common reason a {s} project slips by two weeks is not design — it is waiting for assets that nobody was assigned to collect.',
      faq: {
        q: 'What should I have ready before a website project starts?',
        a: 'Logo in vector format, brand colours, any photography you own, written service descriptions, and your proof — reviews, numbers, credentials or case studies. Providers charge for sourcing these and it delays delivery.',
      },
    },
    {
      slug: 'proposals',
      keyword: 'Proposal Comparison',
      heading: 'Compare proposals against one identical scope',
      body:
        'The fastest way to get a useless comparison is to let every provider scope their own work. Send the same written scope to three providers and ask each to quote against it, listing inclusions and exclusions separately. Then compare the exclusions, not the inclusions — every quote will claim the same basics, and the difference lives in what each provider has quietly left out. In {loc} we also ask for the delivery date in writing, because a provider who cannot commit to a date is usually managing a queue rather than a schedule. Two written scopes and three comparable quotes is the whole process; everything else is negotiation theatre.',
      faq: {
        q: 'How do I compare website quotes without wasting weeks?',
        a: 'Send the same one-page written scope to three providers and require each to list inclusions and exclusions against it. Compare the exclusions and the committed delivery dates. Any quote that does not itemise is not comparable.',
      },
    },
    {
      slug: 'references',
      keyword: 'Reference Checks',
      heading: 'Check references inside your own market',
      body:
        'A portfolio of work from another country tells you about craft. It does not tell you about fit. What matters for {ind} businesses in {loc} is whether a provider has shipped something for buyers with the same objections, the same regulatory context and the same local buying behaviour — and whether the client will take a call. Ask for a project in your own market, then ask the client two questions: what would you change if you could, and what did the provider get wrong in the first month. The second question is the one that tells you what you are signing up for.',
      faq: {
        q: 'Should I only look at providers who have worked in my market?',
        a: 'Look at both. Craft is visible in any portfolio, but fit — understanding of your objections, your local context and your buyers — is only visible in work done for a similar market. Ask for a reference you can actually call.',
      },
    },
    {
      slug: 'revisions',
      keyword: 'Revision Policy',
      heading: 'Agree revisions and communication before the deposit',
      body:
        'Two clauses prevent most of the friction we see: a definition of what a revision round is, and a single named person who consolidates feedback. Say what happens when a stakeholder wants structural changes after the build has started, and what happens if the project runs late. These are not adversarial terms — they are the difference between a project that finishes and one that quietly drifts. In {ind} the risk is usually not the provider; it is that three people inside your own organisation each send a separate list. Naming one decision-maker in the contract removes that risk entirely, and it costs nothing.',
      faq: {
        q: 'How should revision rounds be handled?',
        a: 'Define what a round covers, how many rounds are included, and name one person on your side who compiles feedback into a single prioritised list. Without that, feedback arrives in fragments and each fragment is treated as a change request.',
      },
    },
    {
      slug: 'review-stage',
      keyword: 'Wireframe Review',
      heading: 'Review structure before you review appearance',
      body:
        'There are three review moments and they are not interchangeable. Wireframes are for structure — is anything missing, is the order right. Design is for look and feel — does this look like our business. The built site is for detail — does it work, is it fast, do the forms submit. The most expensive mistake in {s} is reviewing structure after the site has been built, because restructuring then means re-laying out every page rather than moving a box. It also removes your ability to influence the things that cost the most to change. For {ind} buyers in {loc}, the page order is often the whole argument: what you do, who it is for, and what it costs, in that sequence.',
      faq: {
        q: 'When should we review the design?',
        a: 'Three times, for three different things: wireframes for structure, design for appearance, and the built site for detail. Reviewing structure last is the single most expensive mistake in the process.',
      },
    },
    {
      slug: 'signoff',
      keyword: 'Launch Checklist',
      heading: 'Test on a real phone, on real mobile data, before you sign off',
      body:
        'Office Wi-Fi and a development machine hide performance problems that customers feel immediately. Open the built site on the oldest phone in the building, switch off Wi-Fi, and load it over 4G from outside. If it feels slow there, it is slow for a large share of your traffic. Then submit every form and confirm the notification arrives with the right person and the analytics event fires. This is unglamorous and it is where most launch-day defects are caught — a form that routes to nobody is a silent loss of enquiries, and {ind} businesses in {loc} rarely notice until the lead report is three weeks late.',
      faq: {
        q: 'What should we test before signing off on a website?',
        a: 'Load the site on a real phone over mobile data, outside, and submit every form end to end — email, notification and analytics. Broken form routing is the most common launch-day defect and one of the most expensive.',
      },
    },
  ],

  'cost-guide': [
    {
      slug: 'drivers',
      keyword: 'Pricing Drivers',
      heading: 'What actually moves the number on the quote',
      body:
        'Four things move the price and everything else is decoration: how many genuinely distinct page designs you need, how much custom functionality is involved, how much content has to be written or imported, and how many third-party services you are paying for. What does not move the price is the provider\'s office rent, how old the founder is, or whether the logo needs redrawing. In {ind} in {loc}, the surprise usually comes from the second category — a form that talks to a CRM, a booking flow, or a checkout with tax rules you did not know applied. Decide those requirements before you request quotes and the spread between quotes narrows sharply, because everyone is then pricing the same thing.',
      faq: {
        q: 'What makes a website quote higher than another?',
        a: 'Distinct page designs, custom functionality, content volume and third-party service costs. Before asking for quotes, settle integrations and page count, because those four items explain almost all of the difference between proposals.',
      },
    },
    {
      slug: 'hidden-costs',
      keyword: 'Hidden Costs',
      heading: 'The costs that arrive after the quote',
      body:
        'A quote covers a build. It does not usually cover a domain, hosting, an SSL certificate, an email service, a booking system, an SMS gateway, a copywriter, a photographer, a monthly maintenance retainer, or the cost of fixing what breaks. In {loc} the ones that surprise people are the compliance-adjacent ones: consent management for analytics, accessibility remediation if the site was built without it, and the recurring cost of the third-party tools the build depends on. A good provider itemises these before signing, which is why a higher number on the first page sometimes represents the cheaper project overall. The question to ask is not "how much is this" but "what does this not include".',
      faq: {
        q: 'What costs are usually missing from a website quote?',
        a: 'Domain, hosting, email, transactional messaging, payment or booking fees, copy and photography, maintenance, and compliance tooling such as consent management. Ask what the price excludes before comparing anything.',
      },
    },
    {
      slug: 'too-low',
      keyword: 'Quotes That Are Too Low',
      heading: 'How to read a quote that is too low',
      body:
        'A quote far below the market median is not efficiency. It is a missing scope. The usual omissions are on-page SEO, CMS setup, responsive testing, accessibility work, image optimisation, analytics, and post-launch support — and the pattern is consistent enough to be recognisable. In {ind} the cost of a missing scope is rarely visible at handover; it surfaces two months later as traffic that never grew and a site that nobody wants to edit. The way to read a low quote is not to assume the worst but to ask for the inclusions in writing. If a line is absent from that list, it is not included, regardless of what the sales conversation implied.',
      faq: {
        q: 'Should we be suspicious of a much cheaper quote?',
        a: 'Ask for the inclusions in writing. A low price is normally a missing scope — often SEO, CMS setup, testing, accessibility or support — rather than better efficiency. If a line is not on the list, it is not included.',
      },
    },
    {
      slug: 'save',
      keyword: 'Cost Saving Tips',
      heading: 'Three ways to reduce cost without reducing quality',
      body:
        'Consolidate your page count by reusing strong templates rather than commissioning a distinct design for everything. Supply your own content and assets rather than paying for copywriting and photography that will be replaced in six months anyway. And choose a provider in a compatible time zone, so a revision sent at the end of your day comes back the next morning rather than after a weekend. What does not work is cutting the design budget and expecting the same result — design is where the differentiation lives, and {ind} buyers in {loc} will notice the difference between a site that looks like your sector and one that looks like a template with your logo on it.',
      faq: {
        q: 'How can we reduce the cost of a website without cutting quality?',
        a: 'Consolidate pages onto strong templates, supply your own copy and imagery, and pick a provider in a compatible time zone so revisions turn around overnight. Cutting the design budget is the one lever that reliably costs you results.',
      },
    },
    {
      slug: 'payment',
      keyword: 'Payment Terms',
      heading: 'Payment terms are part of the price',
      body:
        'How and when you pay changes the risk you carry, and it should be written down. A structure that works for most clients is a deposit to schedule the work, a milestone payment before the build, and a final payment on handover against a completed scope document — with revisions and delivery date defined in writing. Requests for the full amount up front, with no milestone and no written scope, are a signal worth taking seriously regardless of how good the portfolio is. In {loc}, we also see buyers comparing providers on price while paying in a currency that introduces conversion risk; asking for the currency, the exchange rate basis and the tax treatment in writing removes that ambiguity before it becomes a dispute.',
      faq: {
        q: 'What payment terms are normal for a website project?',
        a: 'A deposit to book the slot, a milestone payment before the build, and a final payment on handover against a written scope. Full payment up front with no milestone and no written scope is a warning sign in any market.',
      },
    },
    {
      slug: 'ongoing',
      keyword: 'Maintenance Costs',
      heading: 'The cost of the year after launch',
      body:
        'The build is the part everyone budgets for and the smallest part of the total. After launch you are paying for hosting and domain, an email service, analytics, any paid third-party tools, content updates, security patching, and the ongoing work of improving pages that are not yet converting. For {ind} businesses in {loc} a sensible first-year budget is a maintenance retainer that covers hours, monitoring and a small number of changes, rather than a project-based arrangement that puts you in a queue every time something needs attention. Sites do not decay because of the technology. They decay because nobody owns them after the handover, and because the content stops matching what the business actually sells.',
      faq: {
        q: 'What does it cost to maintain a website after launch?',
        a: 'Hosting, domain, email, analytics and any paid tools, plus a retainer covering support, updates and small improvements. The first year usually costs more than people expect, because the build is the smallest part of the total cost.',
      },
    },
    {
      slug: 'currency',
      keyword: 'Local Pricing',
      heading: 'Comparing quotes across currencies',
      body:
        'When quotes arrive in different currencies, the headline numbers are not comparable. Two providers may quote the same work at what looks like a large difference purely because one is priced in {currency} and the other in dollars, with a conversion layered on top. The honest way to compare is to convert once, on the same day, at the same rate, and then subtract what is genuinely different — usually delivery time and revision terms rather than headline price. In {loc} the additional point is tax: {currency} quotes normally exclude local consumption tax, so a comparison that ignores it understates the local figure. We publish packages in local currency with tax stated separately for exactly this reason.',
      faq: {
        q: 'How do we compare website quotes in different currencies?',
        a: 'Convert once, on one day, at one rate, then compare what actually differs — delivery time and revision terms rather than headline price. Also check whether local consumption tax is included, because quotes in {currency} usually exclude it.',
      },
    },
    {
      slug: 'cost-of-nothing',
      keyword: 'Cost of Delay',
      heading: 'The cost of doing nothing is the hardest number to price',
      body:
        'Every month a site underperforms, the cost lands somewhere other than the marketing budget. Enquiries that go to a competitor, a slow site that loses the visit before it loads, a stale offer that quietly stops being true, a search listing with the wrong phone number. None of these produces an invoice, which is exactly why they survive for years. For {ind} in {loc}, work out what one good enquiry is worth to you and what the current site is producing. If the second number is zero, the cheapest thing you can do is fix the worst problem rather than plan a rebuild. If it is under-performing but not zero, a scoped redesign is usually a better-value first move than a full rebuild.',
      faq: {
        q: 'How do we work out whether a redesign is worth it?',
        a: 'Multiply the value of one good enquiry by the number the current site produces, then compare that with what the same traffic would produce on a site that converts. If the current number is zero, fix the worst problem first rather than commissioning a rebuild.',
      },
    },
  ],

  'comparison': [
    {
      slug: 'when-diy',
      keyword: 'When to Build It Yourself',
      heading: 'When doing it yourself is genuinely the right call',
      body:
        'Choose DIY when the site is real but non-critical — a portfolio, a personal project, an internal tool — or when you have a specific skill a provider lacks and enough hours to use it. You keep ownership, you keep the ability to change anything on a Tuesday afternoon, and you learn things that have value beyond the site. The trap is treating "non-critical" as a description of the present rather than of the future. In {ind} the site usually becomes critical sooner than expected, and the handover cost of rescuing a half-finished build is often higher than the cost of the original build would have been. Decide up front whether you are building a tool or building a sales channel, because those are different projects with different standards.',
      faq: {
        q: 'Is it worth building our own website instead of hiring someone?',
        a: 'If the site is a portfolio, a personal project or an internal tool, and you have the hours, yes. If it is a sales channel with a deadline, the outcome almost always favours hiring. Decide which one you are building before you start.',
      },
    },
    {
      slug: 'when-hire',
      keyword: 'When to Hire a Professional',
      heading: 'When hiring is the only sensible answer',
      body:
        'Hire when the site generates revenue, when there is a deadline, when it has to be genuinely fast and accessible, when it needs to integrate with something you already run, or when your own time is worth more spent on the thing you actually do. The strongest signal is a deadline that is real rather than aspirational — a launch, a campaign, a funding round, a season that opens and closes. In {ind} the most common version of this is a business that has grown faster than its website and needs both redesigned and shipped, and the only question worth asking is which of those two is more urgent. A provider can compress a build into days; nobody can compress it and keep the quality.',
      faq: {
        q: 'How do we know when we should stop building it ourselves?',
        a: 'When the site has a deadline that is real, generates revenue, needs to integrate with something you run, or has to be fast and accessible by definition. Those are not preferences — they are requirements a part-time owner cannot meet.',
      },
    },
    {
      slug: 'cost-of-diy',
      keyword: 'The Real Cost of DIY',
      heading: 'What building it yourself actually costs',
      body:
        'The money is rarely the problem; the time is. A professional-quality build in {loc} typically runs forty to a hundred and twenty hours of skilled work depending on scope, and at twenty hours a week that is two to six months of evenings before anything goes live. Add revision cycles, hosting decisions, security updates, accessibility remediation and the ongoing content work, and the true cost becomes a great deal more than the quote you were comparing against. The honest comparison is not software licences against a fee — it is your hours at your effective rate plus the risk of a launch that slips, against a fixed price and a date you can plan around.',
      faq: {
        q: 'How much does it really cost to build a website ourselves?',
        a: 'Count hours, not licences. A professional build in {locShort} runs roughly 40–120 hours depending on scope, which at 20 hours a week is two to six months before launch, plus hosting, updates and the risk of a slipped date.',
      },
    },
    {
      slug: 'freelancer',
      keyword: 'Freelancers vs Agencies',
      heading: 'What a good freelancer actually is',
      body:
        'A strong independent designer or developer is genuinely good value for simple briefs, and they are usually faster than an agency because there is no account management layer. What they cannot offer is continuity: one person is one point of failure, and when they are unavailable the work stops. For {ind} businesses in {loc}, the right question is whether the project needs a team behind it. If the site is a brochure that will be updated twice a year, a freelancer is the sensible choice. If it needs a CRM integration, an ongoing content relationship, or several people to call when something breaks, the continuity premium is worth paying for.',
      faq: {
        q: 'Is a freelance designer better value than an agency?',
        a: 'For a simple, occasional project, usually yes — they are faster and cheaper with no account layer. For ongoing work, integrations, or anything needing several people on call, continuity is what you are paying an agency for.',
      },
    },
    {
      slug: 'agency',
      keyword: 'What an Agency Adds',
      heading: 'What a good agency actually is',
      body:
        'A good agency is not a bigger version of a freelancer; it is a different instrument. You are buying a team, a process, a quality standard and someone who remains answerable after the invoice is settled. That is worth paying for when the work involves compliance, multi-region architecture, custom integrations, content that has to be produced at volume, or a stakeholder structure that needs managing. It is wasteful when the brief is simple and you are paying for capability you will never use. In {loc} the differentiator is whether the agency publishes its process — the stages, the review points, the handover — because a process you can read is a process you can hold them to.',
      faq: {
        q: 'When is an agency worth the money over a freelancer?',
        a: 'When the work involves compliance, integrations, multi-region architecture, content volume, or several stakeholders to manage. For a simple brief you are paying for capability you will never use.',
      },
    },
    {
      slug: 'in-house',
      keyword: 'Hiring In-House',
      heading: 'When an in-house team is the right answer',
      body:
        'An in-house team wins when the site changes every week, when the work is continuous rather than a project, and when there is someone internally who genuinely knows the market. It also wins when the business treats the site as infrastructure rather than as a marketing asset — a booking platform, a member area, a customer portal — because then it needs a roadmap rather than a launch. The failure mode is the opposite of the freelancer\'s: a team without a design system drifts, and a team without a clear owner rebuilds the same page four times. Before hiring, establish who owns the site, what it is for, and what success is measured in.',
      faq: {
        q: 'Should we build an in-house web team?',
        a: 'When the site changes every week and someone internally understands the market. Before hiring, settle who owns the site and what success is measured in — teams without an owner and a design system drift badly.',
      },
    },
    {
      slug: 'templates',
      keyword: 'Templates or Custom Design',
      heading: 'Templates, builders and custom design',
      body:
        'A template or page builder is the right answer when the design is genuinely not your differentiator, when you need something live quickly, and when someone on your team can maintain it without calling anyone. It is the wrong answer when the site has to look and behave like a specific business, when it has to survive a design comparison against a competitor, or when it will be edited repeatedly by people who did not build it. The trap is the middle: a heavily customised template that has been edited beyond recognition, which usually costs more than custom work and looks worse than either. For {ind} in {loc}, the test is whether your buyers would notice the difference. If they would, buy the difference.',
      faq: {
        q: 'Is a template website good enough for our business?',
        a: 'If design is not your differentiator, someone on your team can maintain it, and it needs to be live quickly, yes. If buyers compare you against competitors on design, buy custom — a heavily customised template usually costs more and looks worse than either option.',
      },
    },
    {
      slug: 'switching',
      keyword: 'Switching Providers',
      heading: 'Switching providers without losing what you have',
      body:
        'Most migrations are harder than the build because of what nobody wrote down: which URLs have search equity, which redirects matter, which form fields people actually use, which content is still current. Before switching, write a short handover document listing your live URLs, the ones you want to keep, the ones worth redirecting, and the content inventory with a date on each piece. Then insist on a redirect map as a deliverable and check it after launch, rather than assuming. In {loc} the practical detail that gets missed is the phone number and address on every page — if they are changing, every template needs updating, and missing one on a single service page costs more than the migration saved.',
      faq: {
        q: 'How do we move to a new website provider without losing rankings?',
        a: 'Write a handover document first: live URLs, which to keep, which to redirect, and a content inventory with dates. Make the redirect map a deliverable and verify it after launch, including the phone number and address on every template.',
      },
    },
  ],

  'best-of': [
    {
      slug: 'evaluate',
      keyword: 'How to Choose',
      heading: 'How to evaluate a provider in an afternoon',
      body:
        'You do not need a long checklist. You need four questions asked of every provider, answered in writing: what exactly is included, what is excluded, who will do the work, and when will it be delivered. Those four answers separate providers faster than any portfolio comparison, because every portfolio looks competent and most scopes look identical until you ask what is not in them. In {ind} in {loc}, add a fifth: what happens if the project runs late. A provider who answers that question with a specific process rather than a reassurance is telling you something useful about how they work.',
      faq: {
        q: 'What is the fastest way to compare website providers?',
        a: 'Ask four questions in writing — what is included, what is excluded, who does the work, and by when. Add "what if it runs late" if it is a real risk for you. The written answers separate providers faster than any portfolio.',
      },
    },
    {
      slug: 'portfolio',
      keyword: 'Portfolio Depth',
      heading: 'Portfolio depth beats portfolio polish',
      body:
        'A portfolio is a selection, and every provider selects their best work. The informative question is whether you can see work that resembles your problem rather than work that resembles an agency award. For {ind} in {loc}, that means a site for a business of your size, in a comparable market, with the same kind of constraint — a booking flow, a catalogue, a regulated claim, a multi-location structure. Ask for the version of the project that went wrong as well. Providers who share the difficult one are usually the ones whose other claims are accurate.',
      faq: {
        q: 'What should I look for in a provider\'s portfolio?',
        a: 'Work that resembles your problem: similar size, similar market, similar constraint. Ask to see the project that went wrong as well — providers who share that are usually the ones whose other claims hold up.',
      },
    },
    {
      slug: 'process',
      keyword: 'Process Transparency',
      heading: 'Process transparency is the thing you can actually check',
      body:
        'Ask how the work moves from brief to handover: what the stages are, what you are asked to review at each one, how long your approval is assumed to take, and what happens to the timeline if it takes longer. A provider with a defined process can tell you these things without hesitating; a provider without one will describe a general way of working that could describe any project. This matters more in {loc} than the portfolio does, because a process is what protects your deadline. It also means a change of contact person mid-project does not reset the project to zero.',
      faq: {
        q: 'How do we tell whether a provider has a real process?',
        a: 'Ask them to describe the stages, what you review at each one, and what happens to the timeline if your approval is slow. A provider with a defined process answers immediately and specifically; one without it describes something generic.',
      },
    },
    {
      slug: 'price',
      keyword: 'Price Structure',
      heading: 'Price structure reveals more than price',
      body:
        'The number on the quote is the least informative part of it. The structure around it is what tells you whether you are dealing with a business or a sales operation. A published starting price with fixed packages, an itemised list of what is and is not included, and a quote that holds its scope for a defined period are all signs of a business that prices work rather than selling attention. A number that arrives without inclusions, or that changes for reasons nobody can name, is a number that will change again before the invoice. In {ind} the practical advice is to compare three quotes against one written scope and to ask the two lowest for their exclusions in writing before choosing.',
      faq: {
        q: 'How do we read a website price correctly?',
        a: 'Read the structure, not the number: published packages, itemised inclusions and exclusions, and a quote that holds its scope for a stated period. Compare three quotes against one written scope, and ask the cheapest two for their exclusions in writing.',
      },
    },
    {
      slug: 'responsiveness',
      keyword: 'Responsiveness',
      heading: 'Responsiveness is a leading indicator',
      body:
        'Before you hire anyone, contact them the way you would contact a supplier and measure how long a substantive reply takes. Not an acknowledgement — a real answer to a real question. In {ind} in {loc} this is a good proxy for how they will behave during the project, because the project is mostly communication about small decisions. Providers who answer a pre-sales question in two days usually answer a feedback round in two days as well. Providers who answer in a week usually find a reason to answer a feedback round in a week, and a project with eight stakeholders accumulates those delays very quickly.',
      faq: {
        q: 'How can we tell how a provider will behave during the project?',
        a: 'Contact them as a prospective client and time the substantive reply — not the acknowledgement. Most of a project is communication about small decisions, so reply speed is a genuine leading indicator.',
      },
    },
    {
      slug: 'aftercare',
      keyword: 'Aftercare',
      heading: 'What happens after the handover',
      body:
        'Ask what happens when something breaks at 6pm on a Friday three months after launch. Who do they email, what is covered, what is billable, and what is the response time. Then ask what they would like you to do differently in month one, which is a revealing question because a good provider has a list and a lazy one has nothing. In {loc} the practical point is that a site without an owner degrades: the offer changes and the site does not, the phone number changes and one page does not. Ownership of the site after handover should be explicit, in writing, with a named person on your side.',
      faq: {
        q: 'What should we ask about support after launch?',
        a: 'Who to contact, what is covered, what is billable, and the response time — and name a person on your side who owns the site. Ask too what they would change about your site in month one; a good provider has an answer.',
      },
    },
    {
      slug: 'questions',
      keyword: 'Questions to Ask',
      heading: 'The eight questions worth asking every provider',
      body:
        'Ask all of them to all of them, in writing, and compare the answers side by side: what is excluded from this price, who specifically will do the work, can you show a finished project in my market, what happens if the project runs late, how many revision rounds are included, what do I own at the end and how do I get it, what happens if something breaks after launch, and can I see the scope document before I sign. The eighth is the most revealing — a provider unwilling to show the scope before the deposit is telling you the deposit buys a discovery phase rather than a plan.',
      faq: {
        q: 'What questions should we ask a website provider?',
        a: 'Eight, all in writing: what is excluded, who does the work, a finished project in my market, what if it runs late, how many revision rounds, what do I own, what if it breaks, and can I see the scope before signing. Compare answers side by side.',
      },
    },
    {
      slug: 'red-flags',
      keyword: 'Red Flags',
      heading: 'Red flags that are hard to argue with',
      body:
        'Some answers are difficult to reinterpret favourably. A portfolio with no client names and no live links. Templates presented as custom design. Unlimited revisions with no definition of scope. Payment demanded in full before any work begins. A proposal that takes more than a week after first contact. None of these is individually fatal; together they describe a supplier who optimises for the sale rather than the outcome. In {ind} in {loc}, add one more: a provider who cannot say what the accessibility standard will be. It is a simple question, it has a standard answer, and the inability to produce one predicts most of what will go wrong later.',
      faq: {
        q: 'What are the warning signs when choosing a website provider?',
        a: 'A portfolio with no live client links, templates sold as custom design, unlimited revisions with no scope, full payment before work starts, and a proposal that arrives after a week. In {ind}, a provider who cannot state the accessibility standard is the clearest signal of all.',
      },
    },
  ],

  'mistakes': [
    {
      slug: 'verbal-scope',
      keyword: 'Agreeing Scope Verbally',
      heading: 'Mistake one: agreeing the scope verbally',
      body:
        'A conversation is not a specification. It has no version, no date, and no way to be checked. The moment two people remember it differently — and two people always do — the disagreement is about memory rather than about intent, which is the worst kind of disagreement to have at the end of a project. Fix it with one page: what is being built, what is not, what the price includes, what the delivery date is, how many revision rounds are included, and who approves. For {ind} in {loc}, put that page in the contract rather than in an email, because the contract is the document everybody can find later when they have forgotten the conversation.',
      faq: {
        q: 'How do we stop disagreements about what was agreed?',
        a: 'Put the scope in writing before work starts: what is included, what is not, the price, the delivery date, the revision rounds and who approves. Then reference it in the contract so there is one document to point at.',
      },
    },
    {
      slug: 'desktop-first',
      keyword: 'Designing Desktop First',
      heading: 'Mistake two: designing at desktop and shrinking down',
      body:
        'Designing the desktop layout first and compressing it for phones produces a site that is an adaptation rather than a design. The proportions break, the type becomes unreadable, and the navigation ends up as a cramped menu on a screen where a menu was never the right answer. Most traffic in {loc} arrives on a phone, so the phone is not a secondary version of the site — it is the site. The practical fix is to design the mobile layout first and let the desktop layout use the space it has, rather than letting the desktop design dictate a layout that then has to be squeezed.',
      faq: {
        q: 'Should we design the mobile version first?',
        a: 'Yes. Most traffic arrives on a phone, so designing desktop-first and shrinking produces a compressed adaptation rather than a design. Design the phone layout and let the desktop version use its extra space.',
      },
    },
    {
      slug: 'content-later',
      keyword: 'Treating Content as an Afterthought',
      heading: 'Mistake three: treating content as something to add later',
      body:
        'Content is not the last step; it is the thing the design is built around. Pages with real words are longer than the placeholder version, so a design approved against placeholders usually does not survive contact with the real copy, and the revision round that follows is expensive because it changes the layout rather than the styling. For {ind} in {loc}, the practical discipline is to have the real service descriptions, proof and photography ready before the design review, not after the build. If you cannot write it, that is a content problem worth solving — and it is cheaper to solve it now than after the site is built around thin text.',
      faq: {
        q: 'When should we write the website copy?',
        a: 'Before the design review, not after the build. Real copy is longer than placeholders, so a design approved against placeholders usually cannot survive the real content without a costly layout revision.',
      },
    },
    {
      slug: 'structured-data',
      keyword: 'Skipping Structured Data',
      heading: 'Mistake four: skipping structured data',
      body:
        'Structured data is a small amount of markup that tells a search engine what the page actually is — a service, an organisation, an article, a local business with opening hours and a map position. Skipping it because the site still ranks is a reasonable-sounding argument that happens to be wrong: the ranking you have is for the page, not for the rich result, and the rich result is what takes more space and more clicks. In {ind} the specific wins are local pack placement and price visibility. The cost is a few hours of markup per template type; the cost of not having it is a competitor occupying the space you could have had.',
      faq: {
        q: 'Is structured data really necessary?',
        a: 'It is a few hours of markup per template and it controls whether you appear as a rich result. In {ind} the specific wins are local pack placement and price visibility — features that are not recoverable later.',
      },
    },
    {
      slug: 'feedback',
      keyword: 'Sending Scattered Feedback',
      heading: 'Mistake five: sending feedback as separate messages',
      body:
        'Every stakeholder sends notes individually. The provider receives eight lists, some overlapping, some contradictory, none prioritised, and reconciles them into a change set that nobody asked for. Two weeks disappear and the relationship frays. The fix is structural rather than cultural: one named person on your side compiles every note into a single prioritised list per round, and the provider works only from that list. In {ind} in {loc} this is usually also a governance problem — the person sending the feedback is often not the person who can approve the work, so the list needs an approver as well as a compiler.',
      faq: {
        q: 'How do we handle feedback from multiple stakeholders?',
        a: 'Name one person to compile every note into a single prioritised list per round, and a separate approver for that list. Providers should work only from the compiled version, never from individual messages.',
      },
    },
    {
      slug: 'template',
      keyword: 'Calling a Template Custom',
      heading: 'Mistake six: calling a template custom design',
      body:
        'A purchased theme with the colour changed is a template, and calling it custom is a way of avoiding an uncomfortable conversation about budget. The tell is that there is nothing to decide: no wireframe, no design review, no exploration of alternatives — the theme simply arrived and the logo was placed on it. For {ind} in {loc}, the risk is that competitors are using the same theme, which means the site is not differentiating on anything a buyer can see. If the budget genuinely does not support custom design, say so and buy a good template properly, with the photographs replaced. What does not work is presenting a theme as a design decision.',
      faq: {
        q: 'How do we tell whether a site is really custom design?',
        a: 'There should be decisions to look at: a wireframe, a design review, explored alternatives. A theme with the colour changed has none of those, and in a competitive market your buyers can see the same theme elsewhere.',
      },
    },
    {
      slug: 'handover',
      keyword: 'Launching Without a Handover',
      heading: 'Mistake eight: launching without a handover',
      body:
        'A handover is not a folder of files and a goodbye email. It is the written account of how the site works, who to go to when something breaks, which parts are editable and which are not, and what happens when the provider is no longer involved. In {loc} this is the point where {ind} businesses discover that nobody on their team knows how the site was put together — and the first person to ask for a change is quoted as if it were new work. Build the handover into the schedule, in the same week as launch, while the reasoning is still fresh, and give it to the person who will actually run the site.',
      faq: {
        q: 'What should a website handover include?',
        a: 'A written account of how the site works, who to contact when something breaks, which parts are editable, and what happens after the provider steps away. It belongs in the schedule in the same week as launch.',
      },
    },
    {
      slug: 'device-testing',
      keyword: 'Launching Without Device Testing',
      heading: 'Mistake seven: launching without testing on a real device',
      body:
        'Development happens on a fast machine on office Wi-Fi, and that combination hides more problems than any other. Test on the oldest phone on the premises, over mobile data, from outside. Then submit every form and confirm the email, the notification and the analytics event. In {loc} this matters because broken form routing is close to invisible — the site looks fine, the team assumes it works, and the enquiry loss does not appear anywhere except as a strangely quiet month. The cost of the test is an afternoon. The cost of missing it is a quarter of lost enquiries and a debugging exercise after launch.',
      faq: {
        q: 'What must be tested before a website goes live?',
        a: 'The site on a real phone over mobile data, from outside, and every form submitted end to end — email received, notification delivered, analytics event fired. This is an afternoon of work that prevents a quarter of silent enquiry loss.',
      },
    },
  ],

  'local-guide': [
    {
      slug: 'search-behaviour',
      keyword: 'Local Search Behaviour',
      heading: 'How people actually search in this market',
      body:
        'Search behaviour in {loc} is not a copy of the behaviour in the United States with a different place name. Buyers combine a service term with a place name, they check local proof before they check your price, and they read the address before they read the About page. In {ind} they are comparing against businesses they can visit, which means proximity and hours are not decorative details — they are the reason the click happened. The practical consequence for the site is that a service-area page with genuine local detail outperforms a generic service page, and a proof section showing clients from the same market outperforms testimonials from anywhere.',
      faq: {
        q: 'Should local pages be separate from the main service pages?',
        a: 'Yes, when there is genuine local demand and genuine local proof to put on them. A service-area page with real local detail earns its place; a page with the place name swapped in does not, and can do more harm than good.',
      },
    },
    {
      slug: 'service-areas',
      keyword: 'Service Area Pages',
      heading: 'Service areas that are genuinely different',
      body:
        'Two areas on the same site are not two pages unless something real differs between them. If one area has different regulations, different competitors, a different buying cycle or a different set of questions, then it deserves its own page with its own content. If not, a single page listing areas is better — thinner pages compete with each other and dilute the one that should rank. In {loc}, the test is simple: could a buyer in that area read the page and find something that tells them you operate there and understand the area specifically? If the only difference would be the place name, merge them.',
      faq: {
        q: 'How many service-area pages should we have?',
        a: 'One per area only where something real differs — regulations, competitors, buying cycle or questions asked. Otherwise a single page listing areas is stronger, because thin pages compete with each other.',
      },
    },
    {
      slug: 'proof',
      keyword: 'Local Proof',
      heading: 'Local proof beats global proof',
      body:
        'A testimonial from a client in your own market answers the objections your buyers actually have; a testimonial from anywhere else answers an abstract version of them. For {ind} in {loc}, the proof that converts is named, local, and specific about a result: the kind of client you recognise, the kind of problem they had, and what changed afterwards. Numbers help, but only if the reader can tell what the number is. "Increased enquiries by 40%" is a number; "took their monthly enquiries from 6 to 24" is a result. Ask your clients for the second version, and ask permission to name them — named local proof is one of the highest-return changes most businesses can make.',
      faq: {
        q: 'What kind of testimonials work best for local businesses?',
        a: 'Named clients from your own market, describing a specific before-and-after result. Ask clients for the concrete version of their result — "monthly enquiries went from 6 to 24" — and ask permission to name them.',
      },
    },
    {
      slug: 'pricing',
      keyword: 'Local Pricing',
      heading: 'Local pricing without the currency arithmetic',
      body:
        'Visitors in {loc} price-sensitise early and abandon when the number is hidden or when they have to convert it in their head. Show prices in {currency}, state plainly whether tax is included, and list what is excluded beside what is included. Do not convert a dollar figure and present it as a local number without saying so — buyers in regulated or price-sensitive markets check, and the conversion also makes it obvious that your pricing is an export. A {ind} buyer comparing three providers will convert all three; doing the arithmetic for them and stating the tax treatment is a small courtesy that removes an entire stage from their decision.',
      faq: {
        q: 'Should we show prices in our local currency?',
        a: 'Yes, in {currency}, with the tax treatment stated and exclusions listed. Buyers in {locShort} price-sensitise early and abandon when the number is hidden or needs converting in their head.',
      },
    },
    {
      slug: 'competition',
      keyword: 'Local Competitors',
      heading: 'Reading the local competitive set properly',
      body:
        'Look at the five businesses you actually appear next to in {loc}, not at the national awards. Check whether they answer the question you plan to answer, whether they publish a price, how fast their site loads on a phone, and whether they show local proof. In {ind}, the local set usually wins on proximity and loses on clarity, and that gap is usually the whole opportunity. The mistake is designing for the national market and hoping it travels — the buyer who searches "website design in {locShort}" is not comparing you with a studio in another country, they are choosing between three local businesses and one national one.',
      faq: {
        q: 'How should we research local competitors?',
        a: 'Look at the five businesses you actually appear beside in {locShort} — not the national awards. Check whether they publish prices, how fast they load on a phone, and whether they show local proof. Clarity is usually where the gap is.',
      },
    },
    {
      slug: 'compliance',
      keyword: 'Local Compliance',
      heading: 'The local rules that change what you must build',
      body:
        'Accessibility, consent, and data-handling obligations apply everywhere, but what applies in {loc} is not identical to what applies elsewhere. In {ind} there may be a professional register, a licensing or accreditation requirement, or a sector-specific advertising rule that constrains what a page can claim. None of this is exotic; it simply has to be designed in rather than noticed later. The practical step is to find out which rules apply to your sector in {country} before the copy is written, because several of them change what you are allowed to say on the page rather than only how the page behaves.',
      faq: {
        q: 'What local regulations affect our website?',
        a: 'Accessibility, consent and data-handling rules apply everywhere, and {ind} may add registration, licensing or advertising restrictions that constrain what you can claim on the page. Establish which apply before the copy is written.',
      },
    },
    {
      slug: 'voice',
      keyword: 'Writing for the Market',
      heading: 'Writing for the market, not from a template',
      body:
        'The tell of a templated local page is a sentence that would still be true if you changed the place name. "Serving businesses with a passion for quality" tells a reader in {loc} nothing at all, because it is the sentence every competitor is also using. The alternative is specific and slightly harder: name the actual constraint your buyers in {locShort} face, the price they are working with, the deadline they are up against, and the way work gets bought. For {ind}, buyers in {loc} that often means a payment method they already use, a language they read comfortably, a phone number that reaches someone, and proof from a client they could actually verify.',
      faq: {
        q: 'How do we write copy that does not sound templated?',
        a: 'Name the real constraint your buyers face in {locShort} — the price they are working with, the deadline, the way work gets bought, and proof they can verify. If a sentence would still be true with the place name changed, rewrite it.',
      },
    },
    {
      slug: 'measurement',
      keyword: 'Measuring Locally',
      heading: 'Measuring local performance honestly',
      body:
        'Local performance is not a national ranking average, and a blended report will tell you almost nothing about {locShort}. Separate branded search from non-branded, separate the areas you actually serve from the ones you do not, and track calls and form submissions as seriously as sessions. A rise in branded impressions with flat enquiry numbers usually means your name is becoming known and your offer is not converting — a different problem from a rise in non-branded impressions. For {ind} in {loc}, calls and booked jobs per month are the metric that matters, and everything else is context. If that number has not moved after two quarters, the strategy is wrong regardless of how good the rankings look.',
      faq: {
        q: 'Which metrics should we track for a local website?',
        a: 'Calls and booked jobs per month, segmented by branded and non-branded search and by service area. A blended national report will hide exactly the signals that matter in {locShort}.',
      },
    },
  ],

  'trend-report': [
    {
      slug: 'core-web-vitals',
      keyword: 'Core Web Vitals',
      heading: 'Performance budgets have become a build requirement',
      body:
        'Core Web Vitals are enforced more strictly than at any point in the last decade, and the practical effect is that performance is now a design constraint rather than an optimisation phase. The largest contentful element has to be identified during layout rather than after the build; interaction latency has to be designed against; and cumulative layout shift has to be prevented by reserving space for anything that arrives late. For {ind} in {loc}, the commercial argument is straightforward — most traffic is on a phone, often on a mediocre connection, and the difference between a fast and a slow site is measured in whether the visitor ever sees the offer. Set the budget before the build, not after.',
      faq: {
        q: 'Should we set performance budgets before the build?',
        a: 'Yes. Largest contentful element, interaction latency and layout stability are design constraints now, and a budget agreed before the build is far cheaper than a performance phase after it.',
      },
    },
    {
      slug: 'ai-search',
      keyword: 'AI Search Visibility',
      heading: 'AI assistants became a real discovery channel',
      body:
        'A growing share of discovery now happens inside an assistant answering a question rather than in a list of blue links, and the consequence for a website is that being the best answer matters more than being the top link. In {ind} in {loc}, the practical implications are concrete: the question your buyers actually ask should appear as a question on the page, answered in the first paragraph, without burying the answer under navigation. Structured data helps because it tells a machine what the entity is. But the thing that actually earns the citation is having written something an assistant can quote — a number, a price, a timeframe, a rule explained plainly.',
      faq: {
        q: 'How do we get found inside AI assistants?',
        a: 'Ask the question your buyers ask, answer it in the first paragraph in plain language, and put concrete specifics on the page — prices, timeframes, numbers. Being quotable is what earns the citation; being the top link is no longer sufficient.',
      },
    },
    {
      slug: 'structured-data',
      keyword: 'Structured Data',
      heading: 'Structured data moved from optional to load-bearing',
      body:
        'For years structured data was a cheap way to win a star rating. It is now one of the few ways to tell a machine what your business is, where it operates and what it charges. The work is not complicated: a small block of JSON-LD per template, describing the organisation, the service, the local business with its coordinates and hours, and the articles. The discipline is keeping it consistent with what a visitor actually sees, because a mismatch between the markup and the page is worse than having no markup at all. For {ind} in {loc}, the coverage that matters most is the service schema and the local business schema, because those are what turn a page into a result a buyer can act on.',
      faq: {
        q: 'Which structured data should a service business prioritise?',
        a: 'Service schema and LocalBusiness schema, with organisation details consistent across templates. In {locShort}, these are what turn a page into a result a buyer can act on rather than just a page.',
      },
    },
    {
      slug: 'first-party-data',
      keyword: 'First-Party Data',
      heading: 'First-party data replaced the tracking we relied on',
      body:
        'Third-party cookies and tag-based attribution are being deprecated across major browsers, which means the reporting stack many businesses still depend on is quietly losing data. The shift is towards first-party measurement: server-side events, consent-aware analytics, and conversions recorded directly in your own systems rather than inferred from an ad platform. For {ind} in {loc} this has a practical benefit that goes beyond accuracy — first-party enquiry data is data you own, and it is the only measurement that survives a change of tooling. Set it up while the current stack still works, because retrofitting a measurement layer after it has been running for two years is harder than starting it properly.',
      faq: {
        q: 'What should we replace third-party tracking with?',
        a: 'First-party measurement: server-side events, consent-aware analytics and conversions recorded in your own systems. It is more accurate, it survives changes of tooling, and for {ind} it is data you actually own.',
      },
    },
    {
      slug: 'performance-accessibility',
      keyword: 'Performance and Accessibility',
      heading: 'Performance and accessibility converged into one discipline',
      body:
        'These used to be separate workstreams with separate owners. They are now the same set of decisions: a lean page is easier to navigate with a keyboard, a clear heading structure helps both screen readers and search engines, and a reduced-motion preference is a performance and comfort question as much as an accessibility one. The organisations that treat them separately pay for the overlap twice — once in build and once in remediation. For {ind} in {loc}, where a meaningful share of buyers may be older or on older devices, that convergence is worth more than it is in a market where everyone is on a recent flagship phone.',
      faq: {
        q: 'Why treat performance and accessibility as one discipline?',
        a: 'They are the same decisions: a lean page is easier to navigate by keyboard, clear headings serve screen readers and search engines alike, and reduced motion is a comfort and performance question. Treating them separately pays for the overlap twice.',
      },
    },
    {
      slug: 'design-systems',
      keyword: 'Design Systems',
      heading: 'Design systems became the unit of delivery',
      body:
        'The unit of work has shifted from a page to a component, and that changes what a design system is for. It is no longer a Figma file of polished screens; it is a set of decisions — spacing scale, type ramp, colour pairs, breakpoints, motion rules — applied consistently enough that a new page can be built without anyone inventing a decision. In {ind} in {loc} this pays off because the teams maintaining a site are rarely the team that built it. A site with clear rules can be maintained by the next person; a site made of one-off decisions has to be rebuilt by whoever made them.',
      faq: {
        q: 'Do we need a design system for a small website?',
        a: 'You need consistent decisions, not a formal system. For a small site that means a spacing scale, a type ramp, a fixed set of colour pairs and a breakpoint set — enough that the next person can add a page without inventing anything.',
      },
    },
    {
      slug: 'privacy',
      keyword: 'Privacy and Consent',
      heading: 'Privacy and consent became a build requirement',
      body:
        'Consent management is now a build decision rather than a plugin bolted on afterwards, because what you can load is determined by what the visitor has agreed to. That has a performance consequence worth planning for: every tag loaded before consent is a tag the visitor pays for in page weight. The better pattern is to load nothing that is not needed, defer what is, and ask for consent at the point where a specific purpose requires it rather than in a single modal for everything. For {ind} in {loc}, the commercial risk is symmetric — a site that over-collects is as much of a problem as one that under-collects, and both are easier to avoid when the decision is made during the build.',
      faq: {
        q: 'How should we handle consent and tag loading?',
        a: 'Load nothing that is not needed, defer what is, and ask for consent per purpose rather than in one modal. In {locShort}, over-collecting is as much a problem as under-collecting.',
      },
    },
    {
      slug: 'ignore',
      keyword: 'What to Ignore',
      heading: 'The advice worth ignoring',
      body:
        'Ignore any advice that promises guaranteed rankings, mass-produced content at scale, and frameworks suggested for a site with a hundred pages. None of it holds up. In {ind} in {loc}, the version of this worth naming specifically is the rush to publish more pages than the market can absorb — a hundred thin pages targeting terms nobody types dilute the handful that do matter and make the whole domain harder to read. If a strategy cannot be explained in one sentence and evidenced with a case study, it is a pitch rather than a strategy. The reliable version of growth is unglamorous: a fast site, an honest answer to the question buyers ask, proof from your own market, and a page that works on the phone in someone\'s hand.',
      faq: {
        q: 'Should we publish more pages to get more traffic?',
        a: 'Only where there is real demand and real content to publish. A hundred thin pages targeting terms nobody types dilute the pages that matter and make the domain harder to read for everyone.',
      },
    },
  ],

  'explainer': [
    {
      slug: 'definition',
      keyword: 'The Basics',
      heading: 'What it actually means',
      body:
        'Put simply, {s} is the process of designing, building and launching a website so it does a specific job: present your business credibly, answer the questions your buyers ask, and make the next step obvious. It is not a synonym for visual design, and it is not a synonym for marketing. A beautiful site that confuses the buyer, loads slowly on their phone or leaves them unsure what to do next has failed at the only thing the process exists to achieve. In {ind} in {loc}, the useful framing is to write down the one thing the site must do, then judge every decision against it.',
      faq: {
        q: 'What does {s} actually involve?',
        a: 'Designing, building and launching a site so it presents your business credibly, answers buyer questions and makes the next step obvious. It covers strategy, design, build, SEO, analytics and handover — not just how the site looks.',
      },
    },
    {
      slug: 'included',
      keyword: 'What Is Included',
      heading: 'What is actually included',
      body:
        'Every credible build includes custom responsive design, a working contact mechanism, mobile performance, on-page SEO, analytics and a handover that lets your team use what was built. If a provider omits any of these, that omission is the conversation you should be having — not the price. For {ind} businesses in {loc}, the ones that quietly get dropped are the ones that matter most: mobile performance, on-page SEO and handover. Each is invisible on the day of launch and expensive to add within six months, which is exactly why they belong in the scope rather than in the options list.',
      faq: {
        q: 'What should be included in every website project?',
        a: 'Responsive design, a working contact mechanism, mobile performance, on-page SEO, analytics and a real handover. Anything missing from that list is either an omission or an upsell, and it is worth knowing which before you sign.',
      },
    },
    {
      slug: 'separates',
      keyword: 'Good Versus Average',
      heading: 'What separates good from average',
      body:
        'In practice the difference comes down to three things: whether the design was made for your specific buyers, whether the site loads fast on a real phone, and whether the content answers the questions people actually type. None of those are visible in a mockup. They are only visible after launch, on a real device, with the real copy. That is why the portfolio of a provider who only shows screens tells you very little, and why asking to see a finished live site in your own market is worth the inconvenience of the request. For {ind} in {loc}, the average competitor is competent and quick. The differentiator is almost never visual novelty.',
      faq: {
        q: 'How do we tell a good website from an average one?',
        a: 'Three things: design made for your specific buyers, fast loading on a real phone, and content that answers the questions people actually type. None are visible in a mockup, so judge on a finished live site.',
      },
    },
    {
      slug: 'cost-and-time',
      keyword: 'Cost and Timeline',
      heading: 'What it costs and how long it takes',
      body:
        'From ${price} for a focused build, typically ${timeline}. The variables that move the number are page count, functionality, integrations and how much custom design the work needs. In {loc}, the realistic timeline for a {ind} business is that figure plus two to four weeks for content, approvals and stakeholder availability — the part that is rarely the provider\'s fault and is almost always the reason a project misses its date. Plan the launch backwards from a real deadline rather than forwards from the day the contract is signed, and the whole process becomes considerably calmer.',
      faq: {
        q: 'How long does a website take to build?',
        a: 'Typically ${timeline} for a focused build, plus two to four weeks for content and approvals. In {locShort}, that extra allowance is the difference between hitting a launch date and missing it.',
      },
    },
    {
      slug: 'when-needed',
      keyword: 'When You Need It',
      heading: 'When it is worth doing',
      body:
        'You need {s} when your current online presence is costing you money — through lost trust, poor search visibility, slow load times or an unclear path to enquiry. You do not need it when the site is doing its job and you want a cosmetic refresh; that is a design tweak, not a build. The distinction is worth making carefully in {ind}, because the most common waste we see is a full rebuild commissioned to fix a problem that three pages and a faster host would have solved. A short audit, priced and scoped in writing, usually settles the question faster than any proposal, and it costs less than the mistake of rebuilding the wrong thing.',
      faq: {
        q: 'Do we need a new website or just changes to the current one?',
        a: 'A short audit will usually settle it. If the site is losing enquiries through speed, structure or unclear offers, a targeted fix is cheaper than a rebuild. If it is structurally failing to convert, then it is a build.',
      },
    },
    {
      slug: 'process',
      keyword: 'The Process',
      heading: 'What the process looks like',
      body:
        'Discovery and written scope, then a page list and structure, then design reviewed against that structure, then build, then QA on real devices, then launch and handover. Each stage has an owner and an output, and no stage starts before the previous one is signed off. The stages that get skipped are the expensive ones: skipping the written scope means the build starts on assumptions, and skipping the structure review means the design work is redone. In {loc}, the sequence also protects the timeline, because it surfaces content and approval delays while there is still time to absorb them.',
      faq: {
        q: 'What stages should a website project have?',
        a: 'Discovery and written scope, page list and structure, design review, build, QA on real devices, then launch and handover. The stages that get skipped — scope and structure — are the ones that cost the most to redo.',
      },
    },
    {
      slug: 'who-does-it',
      keyword: 'Who Does the Work',
      heading: 'Who actually does the work',
      body:
        'Ask, and get a specific answer. In {loc} a {ind} project is frequently sold by a senior person and delivered by someone junior, which is a legitimate arrangement when it is disclosed — but it has to be disclosed, because it changes both the price and the quality of the review you are getting. What matters is not the job title but whether the person who will answer your questions during the project is the person whose judgement you trusted during the sale. Good providers answer this without being asked. If the answer is "a team", ask what that team is and how it is structured, because you are about to work with them for weeks.',
      faq: {
        q: 'Will the person we speak to actually do the work?',
        a: 'Ask directly and get a specific answer. Selling by a senior and delivering by a junior is legitimate when disclosed, but you should know, because it changes both the price and the quality of review you get.',
      },
    },
    {
      slug: 'after-launch',
      keyword: 'After Launch',
      heading: 'What happens after launch',
      body:
        'The site is not finished when it goes live; it is finished when someone owns it and improves it. In the first month, watch the form submissions, the search queries that bring people in, and the pages people leave from — those three signals will tell you more than any dashboard. Then set a review cycle: quarterly is usually enough to catch what needs fixing and rare enough to be realistic. For {ind} businesses in {loc}, the honest truth is that most sites decay from neglect rather than from technology, and a two-hour quarterly review prevents almost all of it.',
      faq: {
        q: 'What should we do in the first month after launch?',
        a: 'Watch form submissions, the search queries that bring people in, and the pages people leave from — those three signals beat any dashboard. Then book a quarterly review so something owns the site.',
      },
    },
  ],

  'checklist': [
    {
      slug: 'objective',
      keyword: 'Setting the Objective',
      heading: 'Write the one sentence the site exists to do',
      body:
        'One sentence: what the site is for. "Generate qualified trade enquiries." "Sell products." "Build trust before a sales call." Everything else in the project is downstream from this sentence, and a provider who cannot state it back to you does not understand the brief. In {ind} in {loc}, this is the cheapest and most decisive step in the entire process. A site with two objectives has no objective, and it will show — in the half-hearted home page, the vague calls to action, and the analytics report where nobody agrees which number matters. Pick one. Write it down. Date it.',
      faq: {
        q: 'What is the most important thing to define before starting a website?',
        a: 'One sentence describing what the site is for. Everything else derives from it, and a provider who cannot restate it back to you has not understood the brief.',
      },
    },
    {
      slug: 'pages',
      keyword: 'Listing the Pages',
      heading: 'List the pages, not the features',
      body:
        'Count the pages you actually need. A good site for most {ind} businesses in {locShort} is between seven and fifteen. Beyond that, page count usually signals an information-architecture problem rather than a content problem — it means pages exist because nobody could decide which existing page to extend. For every page, write the single action it exists to drive. If you cannot name the action, the page does not need to exist, or the action needs to be defined. This list becomes the page inventory in your scope, which means it becomes the thing you hold the quote against — a quote is comparable to another quote only when both are pricing the same pages.',
      faq: {
        q: 'How many pages should a small business website have?',
        a: 'Seven to fifteen for most {ind} businesses in {locShort}. Beyond that, extra pages usually mean an information-architecture problem rather than a content shortage — and each one needs a defined action.',
      },
    },
    {
      slug: 'actions',
      keyword: 'Page Actions',
      heading: 'Decide what happens on each page',
      body:
        'One action per page, defined before design: request a quote, call, book, buy, read. Not three. A page with three actions has none, because the layout will eventually try to serve all three and the visitor will be given a choice rather than a next step. For {ind} in {loc}, there is a further consideration: whether the action is one your buyers can actually take. A form that needs a company registration number your clients may not have, or a booking flow that assumes working hours on a Sunday, is a worse action than a phone call even if it converts more on paper. Match the action to how the market actually buys.',
      faq: {
        q: 'Should every page have the same call to action?',
        a: 'Every page should have one action, but not always the same one. Match it to how the market buys — a form that assumes details your buyers may not have is worse than a phone call.',
      },
    },
    {
      slug: 'assets',
      keyword: 'Gathering Assets',
      heading: 'Gather every asset you already own',
      body:
        'Logo in vector format, brand colours, photography you own, service descriptions and your proof — reviews, case studies, numbers, credentials. Providers who must source all of this charge for it and lose days to it. In {loc}, this is the single most common reason a {s} project slips: nobody was assigned to collect content, and the build waited. Put a name against the task. Send everything you have, including the mediocre photographs — a provider can direct a shoot far better than they can invent your business, and knowing what you already own prevents them billing you to replace assets you have.',
      faq: {
        q: 'What assets should we have ready before the project starts?',
        a: 'Logo in vector format, brand colours, photography you own, written service descriptions and your proof. Assign a name to collecting them — most delays come from nobody owning that task.',
      },
    },
    {
      slug: 'non-negotiables',
      keyword: 'Non-Negotiables',
      heading: 'Write your non-negotiables down',
      body:
        'Accessibility standard, performance targets, compliance requirements, hosting constraints, who maintains the site after launch. Written down, these become acceptance criteria rather than opinions, and opinions are what turn a delivery into a debate. For {ind} in {loc}, include the local requirements specifically — the tax and business-registration details that appear on an invoice or a footer, the payment methods buyers actually use, and the accessibility standard you will be held to. A provider who reads that list and says "we can do that" has told you something useful; a provider who says "we do most of that" has told you something more useful.',
      faq: {
        q: 'What should we put in writing before the project starts?',
        a: 'Accessibility standard, performance targets, compliance requirements, hosting constraints and post-launch ownership. In {locShort}, include local tax, registration and payment requirements explicitly.',
      },
    },
    {
      slug: 'feedback',
      keyword: 'Consolidating Feedback',
      heading: 'Consolidate feedback into one message',
      body:
        'Every stakeholder sends notes separately, the provider receives eight conflicting lists, and two weeks disappear. Appoint one decision-maker who compiles a single prioritised list per round, and make it the only channel. This single discipline is the biggest predictor of a smooth project — more predictive than the quality of the design work, and considerably more controllable. In {ind}, where the person most likely to comment is often the person least able to approve, separate the two roles explicitly: one compiles, one approves, one signature commits the round.',
      faq: {
        q: 'How do we stop feedback from slowing the project down?',
        a: 'One named person compiles every note into a single prioritised list per round, and it is the only channel the provider works from. In {ind}, separate the compiler from the approver.',
      },
    },
    {
      slug: 'review-stages',
      keyword: 'Review Stages',
      heading: 'Review at the right stage',
      body:
        'Review wireframes for structure, design for appearance, the built site for detail. Reviewing structure after the site has been built is the most common and most expensive mistake in this whole process, because restructuring then means re-laying-out every page instead of moving a box — and it removes your ability to influence what costs the most to change. Agree the review points in the scope, including how many rounds are included and how long you are expected to take to respond. A review cycle with no agreed response time is a review cycle that stalls indefinitely, and in {loc} that is where launch dates go to die.',
      faq: {
        q: 'When should we review the design?',
        a: 'Wireframes for structure, design for appearance, the built site for detail — and agree the review points and your own response times in the scope, so a round cannot stall indefinitely.',
      },
    },
    {
      slug: 'launch',
      keyword: 'Launch Checks',
      heading: 'Test on a real phone, verify forms, keep the scope',
      body:
        'Open the built site on the cheapest phone your team owns, turn off Wi-Fi, and load it over mobile data from outside. Submit every form and confirm the email arrives, the notification reaches the right person and the analytics event fires. Broken form routing is the most common launch-day defect and the most expensive, because the site looks correct while enquiries quietly disappear. Then keep the written scope with the contract. It is what turns a disagreement about scope into a five-minute conversation instead of a project, and for {ind} in {loc} it is the difference between a dispute you can settle and one you have to escalate.',
      faq: {
        q: 'What must we check on launch day?',
        a: 'Load the site on a real phone over mobile data from outside, submit every form and confirm email, notification and analytics, then keep the signed scope with the contract.',
      },
    },
  ],

  'industry-playbook': [
    {
      slug: 'trigger',
      keyword: 'Buying Triggers',
      heading: 'Build around the buying trigger',
      body:
        'In {ind}, a project usually starts when {trigger}. That is the moment the site has to work hardest, because attention is highest and patience is lowest. In {loc}, that tends to happen at a predictable point in the year, which means the build can be scheduled to land before it rather than during it. The practical implication for the site is that the trigger should be visible on the home page within the first screen, and the offer should be framed in terms of the outcome the buyer is trying to reach that month. A site that buries the reason-to-act under a company history is optimised for the wrong moment.',
      faq: {
        q: 'When do {ind} businesses in {locShort} usually need a new site?',
        a: 'Usually when {trigger}. That is the moment attention is highest and patience is lowest, so the trigger should be visible in the first screen and the offer framed around the outcome being bought.',
      },
    },
    {
      slug: 'objection',
      keyword: 'Common Objections',
      heading: 'Answer the objection directly',
      body:
        'The objection we hear most from {ind} businesses in {locShort} is {objection}. It deserves a straight answer rather than a sales pitch, and the best response is usually to show the specific part of your process that addresses it. Putting that answer on the page — visibly, in plain language, near the point where the doubt arises — does more for conversion than any additional feature. In {ind} the doubt is rarely about whether you can build a website. It is about whether you understand the sector well enough to be trusted with it, and a page that answers the objection correctly is the fastest way to demonstrate exactly that.',
      faq: {
        q: 'What objection should our website answer directly?',
        a: '{objection} — put the straight answer on the page near the point where the doubt appears. For {ind}, the doubt is rarely about capability; it is about whether you understand the sector.',
      },
    },
    {
      slug: 'trust',
      keyword: 'Trust Signals',
      heading: 'Trust signals that are specific to this sector',
      body:
        'Generic trust signals — a client logo wall, a testimonial carousel, a badge nobody can explain — cost money and convert poorly. What works in {ind} is sector-specific: the credential that proves competence, the compliance that demonstrates care, the named result from a business a buyer recognises. In {loc}, the trust signals that carry weight are often the unglamorous ones: a real address, a real phone number, a named person, and a business registration number a buyer can verify. For {ind} buyers specifically, showing the process you follow usually outperforms claiming the outcome you promise, because the process is the part you can actually evidence.',
      faq: {
        q: 'Which trust signals work best for {ind} businesses?',
        a: 'Sector-specific ones: a verifiable credential, a named result from a recognised client, a real address and registration number, and a named person. Showing the process usually outperforms claiming the outcome.',
      },
    },
    {
      slug: 'season',
      keyword: 'Seasonality',
      heading: 'Seasonality is a planning constraint, not a note',
      body:
        '{season} That is a fact about demand, and treating it as a scheduling constraint rather than a footnote changes the build calendar by weeks. For {ind} in {loc}, the right sequence is usually to have the site live before the demand arrives, which means content and approvals need to finish earlier than a standard project would suggest. The other half of this is pricing: providers fill their calendars at different rates across the year, and booking ahead of a peak generally secures both better pricing and a guaranteed slot. If the build has to land before the peak, the discovery phase is what actually has to move.',
      faq: {
        q: 'When should we start a website project in our sector?',
        a: 'Count backwards from the start of your peak, not from the date you feel ready. In {locShort}, content and approvals take two to four weeks, so discovery needs to start roughly six to eight weeks before the season opens.',
      },
    },
    {
      slug: 'metric',
      keyword: 'The Metric That Matters',
      heading: 'Track the metric the sector actually moves',
      body:
        'Track {metric} as the primary metric. Impressions, follower counts and ranking position on a single term are context, not outcomes. If the primary metric has not moved after two quarters, the strategy is wrong regardless of how good the rankings look. In {loc}, the practical complication is that the sector metric is often slower-moving than a traffic number, which makes it tempting to fall back on the thing that moves weekly. Resist it. In {ind} specifically, the metric usually depends on a small number of conversions, so the reporting noise is high enough that weekly movement means very little and a quarterly view tells you the truth.',
      faq: {
        q: 'Which metric should we report on for our sector?',
        a: '{metric}. Impressions and single-term rankings are context, not outcomes. Because this metric moves slowly, review it quarterly — weekly movement in a low-volume sector is mostly noise.',
      },
    },
    {
      slug: 'service-mix',
      keyword: 'Service Mix',
      heading: 'Which services actually belong on the site',
      body:
        'Not every service you offer deserves a page, and some of your best opportunities are not services at all. For {ind} in {loc}, the services worth their own page are the ones with a distinct buyer, a distinct objection and a distinct proof. The rest can live inside a broader service page. It is also worth asking which service has the best margin-to-effort ratio, because that is usually the one that should be prominent on the home page, and it is frequently not the one the business talks about most. A site that leads with the wrong service is optimising for the conversation the team enjoys rather than the revenue the business needs.',
      faq: {
        q: 'How do we decide which services get their own page?',
        a: 'A service deserves its own page when it has a distinct buyer, a distinct objection and a distinct proof. Lead the home page with your best margin-to-effort service, which is often not the one the team discusses most.',
      },
    },
    {
      slug: 'proof',
      keyword: 'Proof That Lands',
      heading: 'Proof that sounds like this sector',
      body:
        'Proof transfers best when it resembles the buyer\'s own situation. A {ind} case study in {loc} should name the constraint the client had, the specific thing that was hard about it, what was changed, and what the outcome was — not "we built a great website and they loved it". The most valuable thing you can put on the page is often the hardest thing you did, because it is the part your competitors will not claim. Ask every client that question directly: what was the bit that made you nervous about hiring someone? Their answer, in their words, is usually the most persuasive paragraph on the whole site, and it is specific to {ind} in a way that nothing written in an office will be.',
      faq: {
        q: 'What should a case study for our sector actually include?',
        a: 'The client\'s specific constraint, the hard part, what changed, and the outcome. Ask each client what made them nervous about hiring someone — that answer is usually the most persuasive paragraph available.',
      },
    },
    {
      slug: 'pricing',
      keyword: 'Price Pressure',
      heading: 'Where pricing pressure actually shows up',
      body:
        'In {ind}, price sensitivity in {loc} usually shows up as a request for scope reduction rather than a request for a discount, which is why the pages that work best are the ones that make the tiers explicit. A published entry price does three things: it filters out buyers who were never going to pay for the work, it gives the mid-tier something to be measured against, and it lets the scope conversation start from a real number. The other thing worth watching is where the margin quietly leaks: bespoke work that nobody scoped, revisions that were never limited in writing, and support that continued because ending it felt awkward. All three are cheap to define up front and expensive to unwind afterwards.',
      faq: {
        q: 'Should we publish a starting price?',
        a: 'Yes. It filters out buyers who will never pay, gives the mid-tier something to measure against, and starts the scope conversation from a real number. Also define revisions and support limits in writing.',
      },
    },
  ],

  'seasonal': [
    {
      slug: 'backwards',
      keyword: 'Planning Backwards',
      heading: 'Plan backwards from the launch date',
      body:
        'Plan backwards from the date you need to be live, not forwards from the day you decide to start. Working backwards is the only method that produces a date you can hold anyone to, because it turns "how long will this take" into "when must each thing be finished". In {loc}, and for {ind} specifically, the two constraints that are usually underestimated are content availability and stakeholder approval, and neither of them belongs to the provider. A plan that assumes a one-week approval cycle and a two-week content delay is realistic. One that assumes everything is ready when the build starts is a plan that slips, and it will slip in the week you can least afford it.',
      faq: {
        q: 'How do we plan a website project around a fixed deadline?',
        a: 'Work backwards from the launch date and fix the date each deliverable is due. Assume two to four weeks for content and approvals, which are usually the binding constraint in {locShort}.',
      },
    },
    {
      slug: 'peak-pricing',
      keyword: 'Peak Period Pricing',
      heading: 'Peak periods cost more and take longer',
      body:
        'Providers fill their calendars at different rates through the year, and booking ahead of a peak generally secures both better pricing and a guaranteed slot, while booking during a peak is usually both more expensive and slower. For {ind} in {loc}, this is not a theory — the demand curve is real and it is visible in the quotes you receive. The trap is waiting because the current quarter looks comfortable, and then discovering that the supplier you wanted is booked, the price has moved and the delivery window no longer fits your season. If you know your peak, the decision about when to start was made months ago and it should be made on that basis.',
      faq: {
        q: 'Is it cheaper to build a website before our busy season?',
        a: 'Usually. Booking ahead of a peak secures better pricing and a guaranteed slot, while booking during a peak costs more and takes longer. In {locShort} the demand curve is visible in the quotes you receive.',
      },
    },
    {
      slug: 'content',
      keyword: 'Content Lead Time',
      heading: 'Content is the part that decides your date',
      body:
        'The build phase is the part that is planned, staffed and predictable. Content is not. In {loc}, businesses routinely lose two to three weeks at exactly this point because nobody was assigned to collect copy, photography and proof — and the delay lands entirely on the launch date. The discipline is unglamorous: assign a name to content, set a deadline, and review it yourself rather than delegating to whoever happens to be free. A provider can edit your words far better than they can write them, and a site built around thin placeholder content is a site that gets rebuilt.',
      faq: {
        q: 'Why do website projects run late?',
        a: 'Content, not design. Nobody is assigned to collect copy, photography and proof, so the delay lands on the launch date. Assign a name to content and set a deadline.',
      },
    },
    {
      slug: 'approvals',
      keyword: 'Approval Bottlenecks',
      heading: 'Approvals need a name and a deadline',
      body:
        'Approval is where projects go quiet. A stakeholder who has not been asked to approve anything by a specific date is not delaying the project — they simply do not know they are holding it. For {ind} in {loc}, the fix is structural: one named approver, a stated turnaround, and a rule about what happens if they do not respond. In most scopes, an approval is assumed to take a fixed number of business days from the point it is requested, and the timeline is written on that basis rather than on the basis that it will happen. Where a decision genuinely sits with a committee, build that committee\'s calendar into the plan from the start rather than discovering it in week three.',
      faq: {
        q: 'How do we stop approval delays from costing us the launch date?',
        a: 'Name one approver, state a turnaround in the scope, and build the approval into the timeline as a fixed number of business days. If a committee decides, put its calendar in the plan from the start.',
      },
    },
    {
      slug: 'launch-window',
      keyword: 'Launch Windows',
      heading: 'Launching into your busiest month',
      body:
        'Launching at the peak is usually a mistake, for two reasons: your team is busiest and least able to answer questions, and any defect lands in front of the largest audience at the worst time. In {loc}, for {ind} businesses, the quiet period before the season is the right launch window — the site is live and warming up before demand arrives, and the team has capacity to fix what surfaces. If you must launch into the peak, then at least build a week of buffer after the launch date, and decide in advance who watches the forms and analytics on launch day, because the launch is precisely when you will not be watching anything else.',
      faq: {
        q: 'Is it a mistake to launch during our busiest month?',
        a: 'Usually yes: the team is least available and any defect reaches the largest audience. Launch in the quiet period before the season, or add a week of buffer and assign someone to watch forms on launch day.',
      },
    },
    {
      slug: 'quiet-season',
      keyword: 'The Quiet Months',
      heading: 'Using the quiet months properly',
      body:
        'The quiet months are when a business can make progress on the site without competing for attention, and for {ind} in {loc} they are also when the internal work that gets skipped during the season becomes possible. That means rewriting the pages that describe what you actually sell now that the offer has changed, adding proof from the season you have just had, and fixing the pages that were quietly underperforming while everyone was busy. A site that is refreshed in the quiet months arrives at the peak in better shape than the one that was launched into it and then left alone for a year.',
      faq: {
        q: 'What should we improve on the site during our quiet months?',
        a: 'Refresh the pages that describe what you actually sell, add proof from the season you just had, and fix pages that quietly underperformed. It means the site arrives at the peak in better shape.',
      },
    },
    {
      slug: 'multi-region',
      keyword: 'Multi-Market Launches',
      heading: 'Launching in more than one market',
      body:
        'If you are launching in several markets at once, the temptation is to build one site and translate it. That produces pages that are grammatically correct and commercially useless, because the buying behaviour, the objection and the proof that works in one market rarely transfer. In {loc}, the workable approach is to share the structure and the design system but write each market\'s pages natively, using local proof and local pricing, and to launch markets in sequence rather than together. A second market launched three months after the first, using what the first taught you, will outperform three markets launched on the same afternoon.',
      faq: {
        q: 'Should we launch several markets at once?',
        a: 'Launch them in sequence. Share the structure and design system, but write each market\'s pages natively with local proof and pricing. A second market three months later, informed by the first, beats three markets on the same afternoon.',
      },
    },
    {
      slug: 'review',
      keyword: 'After-Season Reviews',
      heading: 'Reviewing after the season',
      body:
        'The end of a season is the best review point you will ever have, because the results are fresh and the causes are still traceable. In {loc}, for {ind} businesses, look at three things: which pages actually produced enquiries, which queries brought people in and whether the page answered what they typed, and which enquiries came from a page you would not have expected. That third one is usually the most interesting. Write the review up while it is still specific — a month later it becomes a general sense that things went fine, which is useless for deciding what to build next.',
      faq: {
        q: 'When should we review the website\'s performance?',
        a: 'At the end of the season, while the results are fresh: which pages produced enquiries, which queries brought people in, and which enquiries came from an unexpected page. Write it up immediately.',
      },
    },
  ],

  'regulatory': [
    {
      slug: 'baseline',
      keyword: 'Accessibility',
      heading: 'The accessibility baseline in practice',
      body:
        'WCAG 2.1 Level AA is the working standard, and practically it means: text contrast of at least 4.5:1 for body copy, full keyboard operability, visible focus states, labelled form inputs, alternative text on meaningful images, and captions or transcripts on video. These are not difficult to implement when they are designed for from the start, and they are expensive to retrofit into a finished site. In {loc}, the commercial case is stronger than the compliance case: around one in five people have a significant disability, and a site that excludes them excludes a fifth of your audience — including existing customers who are simply not telling you they cannot use it.',
      faq: {
        q: 'What does WCAG 2.1 Level AA actually require?',
        a: 'In practice: 4.5:1 contrast on body text, full keyboard operability, visible focus states, labelled inputs, alternative text on meaningful images and captions on video. Build it in from the start — retrofitting costs several times more.',
      },
    },
    {
      slug: 'data',
      keyword: 'Data Protection',
      heading: 'Data protection obligations that start on day one',
      body:
        'If you collect email addresses, run analytics, use advertising pixels or process any personal data through your website, you need a clear privacy notice, a lawful basis for processing, working consent management where consent is required, and a documented process for handling data subject requests. For {ind} in {loc}, the point that gets missed is that a contact form is a data-processing activity, not a feature — it makes you a controller of that data from the moment it is switched on, with the obligations that follow. Those obligations are not difficult to meet if they are designed in. They become a project when they are added to a site that is already live and already collecting.',
      faq: {
        q: 'What data protection do we need for a website with a contact form?',
        a: 'A privacy notice, a lawful basis for processing, working consent management where required, and a documented process for data subject requests. A contact form makes you a controller of that data the moment it is switched on.',
      },
    },
    {
      slug: 'consent',
      keyword: 'Consent',
      heading: 'Consent that is specific and revocable',
      body:
        'Consent has to be freely given, specific, informed and as easy to withdraw as it was to give. In practice that means a banner that does not block the page on entry, choices grouped by purpose rather than by vendor, and a persistent way to change your mind. For {ind} in {loc}, the test is whether a visitor who says no to analytics can still use the site fully — because a site that breaks without tracking is a site that has made the wrong thing mandatory. The commercial argument is usually stronger than the legal one: a site that treats visitors as though they were unwelcome converts worse, and in {ind} the trust cost of that shows up in enquiries that never happen.',
      faq: {
        q: 'What makes a cookie consent banner legitimate?',
        a: 'Freely given, specific, informed and revocable: no blocking on entry, choices grouped by purpose, and a persistent way to change your mind. A visitor who declines tracking must still be able to use the site fully.',
      },
    },
    {
      slug: 'third-party',
      keyword: 'Third-Party Scripts',
      heading: 'Third-party scripts are your decision',
      body:
        'Every analytics tool, chat widget, heatmap script and advertising pixel you install is a third party receiving data about your visitors. That is a genuine data-processing decision and you own it, even though you did not write the code. In {loc}, the practical consequences are performance and consent: each script is weight the visitor downloads, and each one needs a lawful basis and a consent decision. The useful discipline is a written inventory of what is installed, why, who receives the data and when it is reviewed — which is also the fastest way to find the three scripts nobody remembers adding and nobody wants to keep.',
      faq: {
        q: 'Who is responsible for third-party scripts on our website?',
        a: 'You are. Every analytics tool, chat widget and pixel is a third party receiving data about your visitors, and each needs a lawful basis, a consent decision and a performance budget. Keep a written inventory.',
      },
    },
    {
      slug: 'records',
      keyword: 'Compliance Records',
      heading: 'Keeping a record of what you decided',
      body:
        'Keep a record of what you have assessed, what you have fixed and what you have consciously deferred with a reason. For {ind} in {loc}, this is what demonstrates good faith if a question is asked later — and questions get asked, particularly around accessibility claims and marketing claims in regulated sectors. The record does not need to be formal; a dated document listing the checks carried out, the tools used, the issues found and the decisions taken is enough. Its value is that it is written at the time, when you actually know what happened, rather than reconstructed a year later when nobody can remember.',
      faq: {
        q: 'What compliance records should we keep for our website?',
        a: 'A dated record of what was assessed, what was fixed and what was deferred with a reason. It is what demonstrates good faith if a question arises later — written at the time, not reconstructed afterwards.',
      },
    },
    {
      slug: 'sector',
      keyword: 'Sector Rules',
      heading: 'Sector-specific rules on top of the general ones',
      body:
        'In {ind} in {loc}, general accessibility, consent and data rules sit underneath sector obligations that constrain what you may claim rather than only how the page behaves: professional registration, licensing, accreditation, advertising rules and record-keeping duties specific to the sector. These are not exotic, but they do need to be identified before the copy is written, because several of them change what is permitted on the page. A sensible first step is to ask the body that registers businesses in your sector what a website must state or must not state, and then check that against your own pages before launch rather than after a complaint.',
      faq: {
        q: 'What sector-specific rules affect our website in {country}?',
        a: 'For {ind}, usually professional registration, licensing, advertising rules and record-keeping duties — mostly constraints on what you may claim on the page. Ask the registering body what a site must state or must not state.',
      },
    },
    {
      slug: 'audit',
      keyword: 'Auditing What You Have',
      heading: 'How to audit what you already have',
      body:
        'Automated tools catch roughly a third of accessibility issues. Manual keyboard testing and screen-reader checks catch much of the rest, and they are the part most sites skip. The most valuable first step for a {ind} business in {locShort} is a straightforward audit followed by fixing the top ten issues, which typically resolves most of the friction real users experience. Do it in order of severity: keyboard traps and missing labels first, then contrast and focus states, then everything else. A site that passes the first two categories is usable by most people, and usability is also the clearest evidence you can produce that the compliance work was real.',
      faq: {
        q: 'How do we find accessibility problems on our existing site?',
        a: 'Automated tools catch about a third. Add manual keyboard and screen-reader testing, then fix in severity order — traps and missing labels first, then contrast and focus states. The top ten issues resolve most real friction.',
      },
    },
    {
      slug: 'commerce',
      keyword: 'Selling Online',
      heading: 'Selling online adds its own obligations',
      body:
        'If you take payments through the site, several additional requirements apply on top of the general ones: clear display of prices and any charges, an unambiguous confirmation step before money moves, a stated returns and cancellation position, and a checkout that works without avoidable friction. In {loc}, the tax and currency treatment has to be right too, and for {ind} in {loc} the local consumption tax position determines what you must show at the point of sale rather than in a footer. The specific thing to avoid is a checkout that introduces surprises — an unannounced fee, a change of currency at the last step, or a return policy that only appears in the small print.',
      faq: {
        q: 'What extra obligations apply if we sell through the website?',
        a: 'Clear price and charge display, an unambiguous confirmation before payment, a stated returns and cancellation position, and a checkout without surprise fees or a currency switch at the last step. Local tax treatment must be right at the point of sale.',
      },
    },
  ],
};
