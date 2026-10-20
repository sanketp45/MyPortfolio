import type { Metadata } from "next";
import PhoneHero, { type PhoneHeroMeta } from "@/components/case-study/PhoneHero";
// Animated prototype of the Simultaneous flow, parked for now.
// import SimultaneousFlow from "@/components/case-study/SimultaneousFlow";
import { NomineeHeroImage } from "@/components/case-study/NomineeScreens";
import Summary from "@/components/case-study/Summary";
import type { CaseFigureProps } from "@/components/case-study/CaseFigure";
import ProblemStatement, { type ProblemPart } from "@/components/case-study/ProblemStatement";
import GettingToWork, { type WorkSubsection } from "@/components/case-study/GettingToWork";
import TypeInspector from "@/components/case-study/TypeInspector";
import Bridge, { AddGlyph, ChooseGlyph, ReviewGlyph, type BridgeCard } from "@/components/case-study/Bridge";
import Testing, { type TestingFact } from "@/components/case-study/Testing";
import Learnings, { type LearningGroup } from "@/components/case-study/Learnings";
import Changes, { type ChangeComparison } from "@/components/case-study/Changes";
import WhatsNext, { type NextItem } from "@/components/case-study/WhatsNext";
import Reflection, { type ReflectionGroup } from "@/components/case-study/Reflection";

// Temporary home for the FD nomination case study; the plan is to move it
// to /work/fd-nomination once the case-study section of the site exists.

export const metadata: Metadata = {
  title: "Multiple nominees for FDs — Sanket Sugaonkar",
  description:
    "Case study: letting FD customers at one of India’s largest NBFCs name up to four nominees, by priority or by percentage.",
};

const META: PhoneHeroMeta[] = [
  { label: "Timeline", value: "3 weeks" },
  { label: "The team", value: "1 PM, 1 Designer (me), 1 Researcher" },
  { label: "My role", value: "Product Design, Prototyping" },
];

const TLDR_TEXT =
  "While booking an FD, you can add a nominee. Today, it’s one short form: you fill in a single person’s details and move on.";

// Exported from Figma (archieve, node 2018:2023) at 2x.
const TLDR_FIGURE: CaseFigureProps = {
  src: "/case-studies/nominee/current-form.png",
  alt: "Today’s Fixed Deposit nominee form: one nominee’s name, date of birth, relationship, email, mobile number, address, and a receipt declaration",
  caption: "Today: one nominee, one short form",
  variant: "phone",
  width: 750,
  height: 2110,
};

const PROBLEM_INTRO = [
  "RBI’s updated rules change this step. Customers can now add up to four nominees instead of one, and every nomination needs a type: Successive or Simultaneous.",
  "The single form had to become a flow that explains both types and helps people set up the right one.",
];

const PROBLEM_PARTS: ProblemPart[] = [
  { text: "RBI’s updated nominee rules", tag: "Trigger" },
  { text: "let FD customers add up to four nominees, in one of two types,", tag: "Change" },
  { text: "so the nominee step has to explain both and help people pick the right one,", tag: "Need" },
  { text: "without turning an optional step into a hurdle.", tag: "Goal", accent: true },
];

const WORK: WorkSubsection[] = [
  {
    heading: "Competitive analysis",
    paragraphs: [
      "No FD app had built this yet, so there was nothing to benchmark directly. I looked sideways at stock and mutual fund apps, where adding several nominees and splitting shares between them is already common, to see how they explain the choice and where people get stuck.",
    ],
  },
  {
    heading: "Groww",
    paragraphs: [
      "Groww keeps it light: one short form per person, then a separate step that only asks how to split the holdings.",
    ],
    screens: [
      {
        src: "/case-studies/nominee/groww-empty.png",
        alt: "Groww Nominees screen: a warning illustration, “Nominees missing for all future stocks and mutual fund investments”, and an Add nominee button",
        caption: "Empty state",
      },
      {
        src: "/case-studies/nominee/groww-form.png",
        alt: "Groww nominee form: name, relation, email, mobile, ID proof, and checkboxes for same address and under 18",
        caption: "Nominee details",
      },
      {
        src: "/case-studies/nominee/groww-split.png",
        alt: "Groww share screen listing three nominees with 34%, 33% and 33% share fields",
        caption: "Split by share",
      },
      {
        src: "/case-studies/nominee/groww-split-error.png",
        alt: "Groww share screen with all three fields in red and the message “Total share percentage must be exactly 100%. Exceeded share percentage is 10%.”",
        caption: "Share error",
      },
    ],
    notes: {
      good: [
        "One short screen per nominee. “Address same as mine” is ticked by default, and guardian details only come in if the nominee is under 18.",
        "Splitting shares is its own step, showing just names and percentages, and it starts from an even split.",
        "The error says how far off the total is (“exceeded by 10%”), not just that it’s wrong.",
      ],
      bad: [
        "Percentage is the only option. There’s no way to set an order of priority between nominees.",
        "Every field turns red on an error, even ones the person didn’t touch, and there’s no one-tap fix like “split equally”.",
      ],
    },
  },
  {
    heading: "Angel One",
    paragraphs: [
      "Angel One explains more and handles the split better, but it puts everything into one long, formal form and nudges people toward opting out.",
    ],
    screens: [
      {
        src: "/case-studies/nominee/angel-empty.png",
        alt: "Angel One “No Nominee Added” screen explaining why nominees matter, with an outlined Add Nominee button and a filled Opt Out button",
        caption: "Empty state",
      },
      {
        src: "/case-studies/nominee/angel-form.png",
        alt: "Angel One nominee form: name, relationship, share %, date of birth, document type and number, mobile number",
        caption: "One long form",
      },
      {
        src: "/case-studies/nominee/angel-summary.png",
        alt: "Angel One nominee summary: cards for Rohit, Rahul and Usha with relationship, allocation, edit and delete, followed by declaration checkboxes",
        caption: "Nominee summary",
      },
      {
        src: "/case-studies/nominee/angel-allocation.png",
        alt: "Angel One Edit Holdings Allocation sheet with three fields, a red “Total : 90 %”, an Allocate equally link, and a disabled Proceed to eSign button",
        caption: "Edit allocation",
      },
    ],
    notes: {
      good: [
        "The empty state says why a nominee matters and that opting out is a valid choice.",
        "The summary cards show name, relationship and share for each nominee, with edit and delete right there.",
        "The allocation sheet keeps a running total, offers “Allocate equally”, and keeps “Proceed” disabled until the total is 100%.",
      ],
      bad: [
        "“Opt out” is the filled, primary button and “Add nominee” is the secondary one, so the design pushes people away from adding a nominee.",
        "Share, ID document, contact details and five address fields all come in one long scroll, and the share is asked before you know how many nominees you’ll add.",
        "The allocation sheet labels fields by relationship, not by name, so two of them both read “Mother Allocation %”.",
      ],
    },
  },
];

const BRIDGE_CARDS: BridgeCard[] = [
  { title: "Choose", text: "Help people pick the right type", glyph: <ChooseGlyph /> },
  { title: "Add", text: "Up to four people, without one long form", glyph: <AddGlyph /> },
  { title: "Review", text: "Make the order or split obvious before confirming", glyph: <ReviewGlyph /> },
];

// Screens exported from Figma (archieve + Nomination Enhancement files) at
// 1x. V2's empty summary is the V1 summary with its share fields cleared.
// The parts/ components are 2x exports of just what each approach changes;
// their dark board background was swapped for white.
const APPROACHES: WorkSubsection[] = [
  {
    heading: "Every iteration starts by choosing the type",
    paragraphs: [
      "Before adding anyone, people pick Successive or Simultaneous. Each option says in plain words what happens to the money and shows a worked example, priority 1 to 4 or a percentage split, so people choose by outcome rather than by legal term.",
    ],
    flow: [{ steps: ["Type", "Form", "Summary"], highlight: [0] }],
    parts: [
      {
        src: "/case-studies/fd-nomination/parts/type-choice.png",
        alt: "Select nomination type: Successive (priority-based) with a priority 1 to 4 example, and Simultaneous (percentage-based) with a 50/30/10/10 example",
        label: "Choosing the type",
        width: 750,
        height: 1098,
      },
    ],
  },
  {
    heading: "Iteration 1 · Share or priority asked in the form",
    tag: "Iteration #1",
    thinking:
      "The existing form already collected one nominee’s details, so the smallest change was one more field on it. If each person’s share or priority sat next to their details, everything would be set in one pass, and the summary would only be there to check.",
    movedOn:
      "Changing one share meant reopening several forms. Taking A from 30% to 25% meant editing A, then opening another nominee’s form to place the 5%, with no total in sight.",
    paragraphs: [
      "Each nominee’s form gets one more field: a share percentage for Simultaneous, or a P1–P4 priority for Successive. Once everyone is added, a summary lists them all to review and edit.",
    ],
    flow: [{ steps: ["Type", "Form", "Summary"], highlight: [1] }],
    parts: [
      {
        src: "/case-studies/fd-nomination/parts/v1-share-field.png",
        alt: "Nominee Share field in the nominee form, asking for a share percentage",
        label: "Simultaneous",
        width: 686,
        height: 140,
        padded: true,
      },
      {
        src: "/case-studies/fd-nomination/parts/v1-priority-chips.png",
        alt: "Priority chips P1 to P4 in the nominee form, with P1 selected and a note that the order can be changed later",
        label: "Successive",
        width: 686,
        height: 158,
        padded: true,
      },
    ],
    screens: [
      {
        src: "/case-studies/fd-nomination/nominee-form.png",
        alt: "Add Nominee details form with full name, date of birth, relationship, address, PIN code, mobile number and email",
        caption: "Nominee form",
      },
      {
        src: "/case-studies/fd-nomination/v1-summary.png",
        alt: "Nominee details summary with four nominee cards, each showing relation, a 25% share field, and edit and delete icons",
        caption: "Summary to edit",
      },
    ],
  },
  {
    heading: "Iteration 2 · Share or priority asked on the summary",
    tag: "Iteration #2",
    thinking:
      "The form asked for a share before people knew how many nominees they would add. Moving the split to the summary meant they would see everyone side by side first, and do the maths in one place.",
    movedOn:
      "The split was finally in one place, but as four inputs sitting among names, relations and icons, it was too much to take in while getting the numbers right.",
    paragraphs: [
      "The form goes back to details only. Each nominee’s card on the summary asks for their percentage, or their priority for Successive.",
    ],
    flow: [{ steps: ["Type", "Form", "Summary"], highlight: [2] }],
    parts: [
      {
        src: "/case-studies/fd-nomination/parts/v2-card-share.png",
        alt: "Nominee card on the summary with an empty Percentage field",
        label: "Simultaneous",
        width: 686,
        height: 272,
      },
      {
        src: "/case-studies/fd-nomination/parts/v2-card-priority.png",
        alt: "Nominee card on the summary with an empty Priority field",
        label: "Successive",
        width: 686,
        height: 272,
      },
    ],
    screens: [
      {
        src: "/case-studies/fd-nomination/nominee-form.png",
        alt: "Add Nominee details form with full name, date of birth, relationship, address, PIN code, mobile number and email",
        caption: "Nominee form",
      },
      {
        src: "/case-studies/fd-nomination/v2-summary-empty.png",
        alt: "Nominee details summary with four nominee cards and empty percentage fields",
        caption: "Shares empty",
      },
      {
        src: "/case-studies/fd-nomination/v2-summary-filled.png",
        alt: "The same summary with each nominee’s percentage filled in at 25%",
        caption: "Shares filled",
      },
    ],
  },
  {
    heading: "Iteration 3 · Share or priority set in a drawer",
    tag: "Iteration #3",
    thinking:
      "Putting the split on the summary turned it into another long form. The idea here was to separate who gets the money from how much they get: the form asks only for details, and the split appears only once there is something to split, so someone adding one nominee never sees it.",
    paragraphs: [
      "The first nominee goes straight to the summary at 100%, or as priority 1 for Successive, so one nominee never sees a split. From the second nominee on, a drawer handles the split with a live total and a one-tap Allocate equally. The summary shows everyone in a table to edit, delete or switch type.",
    ],
    flow: [
      { label: "First nominee", steps: ["Type", "Form", "Summary at 100% or P1"], highlight: [2] },
      { label: "Nominees 2 to 4", steps: ["Form", "Drawer", "Summary"], highlight: [1, 2] },
    ],
    parts: [
      {
        src: "/case-studies/fd-nomination/parts/v3-first-100.png",
        alt: "Nominee summary with one nominee at a 100% share",
        label: "First nominee · Simultaneous",
        width: 750,
        height: 496,
      },
      {
        src: "/case-studies/fd-nomination/parts/v3-first-p1.png",
        alt: "Nominee summary with one nominee at First priority, and the note that if the priority 1 nominee is deceased the full amount goes to the next surviving nominee",
        label: "First nominee · Successive",
        width: 750,
        height: 492,
      },
      {
        src: "/case-studies/fd-nomination/parts/v3-drawer.png",
        alt: "Nominee added drawer with share inputs for three nominees, a total distribution bar at 100% and Allocate equally",
        label: "Split drawer",
        width: 750,
        height: 1184,
      },
      {
        src: "/case-studies/fd-nomination/parts/v3-summary.png",
        alt: "Nominee summary table with three nominees and their shares, edit and delete icons, and Edit Allocation",
        label: "Summary",
        width: 750,
        height: 768,
      },
    ],
    screens: [
      {
        src: "/case-studies/fd-nomination/nominee-form.png",
        alt: "Add Nominee details form with full name, date of birth, relationship, address, PIN code, mobile number and email, and no share field",
        caption: "Nominee form",
      },
      {
        src: "/case-studies/fd-nomination/v3-drawer.png",
        alt: "Nominee added drawer listing three nominees with share inputs, a total distribution bar at 100% and Allocate equally",
        caption: "Split drawer",
      },
      {
        src: "/case-studies/fd-nomination/v3-summary.png",
        alt: "Nominee summary table with three nominees, their shares adding to 100%, edit and delete icons, Edit Allocation and Switch to Successive",
        caption: "Summary table",
      },
    ],
  },
  {
    heading: "Why iteration 3",
    paragraphs: [
      "Iteration 1 spread the maths across separate forms, and iteration 2 piled it onto one long summary with no help to get it right.",
    ],
    decision: {
      title: "Iteration 3 was the best solution",
      body: "Even though the drawer opening after every add was a real demerit, the merits outweighed it. Iteration 3 separates who gets it from how much they get: the form only asks for details, the drawer handles the split with a live total, and the summary keeps every change in one place.",
    },
  },
];

const TESTING_BODY = [
  "Before building the full flow, our research team checked whether people actually understood the new rules. They ran an unmoderated Maze survey for breadth and moderated sessions for depth, both on the nomination type screen. The question wasn’t whether people could tap through. It was whether they knew what their nomination would do.",
];

const TESTING_FACTS: TestingFact[] = [
  { label: "Sessions", value: "15 people · 1:1 moderated · about 34 min · Hindi and English" },
  { label: "Survey", value: "Maze, unmoderated" },
  { label: "Tested", value: "Nomination type screen with worked examples" },
  { label: "My part", value: "Designed the type screen and examples we tested, then turned the findings into the changes below" },
];

const LEARNING_GROUPS: LearningGroup[] = [
  {
    title: "What worked (keep)",
    tone: "good",
    cards: [
      {
        stat: "13 / 15",
        statLabel: "explained both types in their own words",
        title: "The labels teach the concept",
        quoteHi: "परसेंटेज में डिवाइड करो, टोटल 100 परसेंट होना चाहिए.",
        quoteEn: "Divide it by percentage. The total has to be 100 percent.",
        attribution: "P03",
      },
      {
        stat: "44 / 45",
        statLabel: "right answers across the three simple scenarios",
        title: "Simple wishes were easy to set up",
        body: "Almost everyone set these up correctly.",
      },
      {
        stat: "7 / 15",
        statLabel: "only understood after reading the example",
        title: "The example does the teaching",
        quoteEn: "If this opened directly, I wouldn’t understand why I’m being given two options.",
        attribution: "P03",
      },
    ],
  },
  {
    title: "What didn’t work",
    tone: "bad",
    cards: [
      {
        stat: "10 / 14",
        statLabel: "got “wife first, then the kids 50/50” wrong",
        title: "Wishes that need both types fail silently",
        body: "6 people invented a “use both” mode that doesn’t exist.",
        quoteHi: "ये दोनों तरीके का mix हो गया. इस तरह का method नहीं है.",
        quoteEn: "This is a mix of both. There’s no option like that.",
        attribution: "P04 · one of only 3 who got it right",
      },
      {
        stat: "12 / 14",
        statLabel: "assumed a surviving nominee gets 100%",
        title: "Where the screen is silent, people invent the rule",
        body: "Asked what happens to a share if a nominee passes away, 6 of 15 confidently made up three different rules.",
        quoteHi: "अगर कोई नहीं रहेगा तो automatic 100% हो जाएगा.",
        quoteEn: "If one of them isn’t there, it automatically becomes 100%.",
        attribution: "P12",
      },
      {
        stat: "72%",
        statLabel: "of survey respondents thought a nominee must be family",
        title: "The example taught limits that aren’t real",
        body: "65% also thought shares had to be round numbers, and 3 of 15 read “up to four” as “exactly four”.",
        quoteHi: "Maximum तो clear है कि 4 कर सकता हूँ, तो minimum भी 4?",
        quoteEn: "The maximum of 4 is clear. So is the minimum 4 as well?",
        attribution: "P03",
      },
      {
        stat: "Unclear",
        statLabel: "whether nominees could be changed later",
        title: "People treated it as a one time decision",
        quoteHi: "क्या है कुछ गलती न हो जाए, क्योंकि इन्वेस्टमेंट से related है.",
        quoteEn: "What if I make a mistake? This is about my investment.",
        attribution: "P15",
      },
    ],
  },
];

const CHANGES_INTRO = [
  "Research said not to rename the labels. So we kept Successive and Simultaneous, and changed what the example and summary teach. A new nomination mode needs Product and Legal, so we started with the changes that could ship now and close the riskiest gap: people confidently booking something they didn’t mean.",
];

// Before and after testing, exported from Figma (archieve, 1:10674 and
// section 2056:2183) at 2x, with crops of just the parts that changed. The
// old summary is the V3 one; its footer line is a 1x crop scaled up.
const SHOTS = "/case-studies/fd-nomination/after-testing";

const CHANGE_COMPARISONS: ChangeComparison[] = [
  {
    title: "Nomination type screen",
    pairs: [
      {
        label: "Successive",
        before: {
          src: `${SHOTS}/parts/type-successive-before.png`,
          alt: "Before: “If the priority 1 nominee is deceased, the full amount will go to the next surviving nominee.” with the example Priority 1: Father, 2: Mother, 3: Spouse, 4: Son",
          width: 750,
          height: 566,
        },
        after: {
          src: `${SHOTS}/parts/type-successive-after.png`,
          alt: "After: “Add 1 to 4 nominees. You can change them later.” under the title, “Money goes to nominee 1 first. If they’re not around, it goes to nominee 2.” and neutral person icons 1st to 4th",
          width: 750,
          height: 563,
        },
      },
      {
        label: "Simultaneous",
        before: {
          src: `${SHOTS}/parts/type-simultaneous-before.png`,
          alt: "Before: the example Nominee A 50%, B 30%, C 10%, D 10%, and “Total allocation must be 100%”",
          width: 750,
          height: 520,
        },
        after: {
          src: `${SHOTS}/parts/type-simultaneous-after.png`,
          alt: "After: neutral person icons at 45%, 35%, 12% and 8%, and “Shares stay fixed. If a nominee passes away first, their share goes to your legal heirs, not the others.”",
          width: 750,
          height: 475,
        },
      },
    ],
    screens: [
      { src: `${SHOTS}/type-before.png`, alt: "Select nomination type before testing", caption: "Before" },
      { src: `${SHOTS}/type-after.png`, alt: "Select nomination type after testing", caption: "After" },
    ],
  },
  {
    title: "Nominee summary",
    pairs: [
      {
        label: "Simultaneous",
        before: {
          src: "/case-studies/fd-nomination/parts/v3-summary.png",
          alt: "Before: Nominee Summary with a share table and “The amount is divided among nominees based on the percentages you assign”",
          width: 750,
          height: 768,
        },
        after: {
          src: `${SHOTS}/parts/summary-simultaneous-after.png`,
          alt: "After: “3 of 4 added · You can add 1 more” under the title, and “Shares stay fixed. If a nominee passes away first, their share goes to your legal heirs.” in the note",
          width: 750,
          height: 822,
        },
      },
      {
        label: "Successive",
        before: {
          src: `${SHOTS}/parts/summary-successive-before.png`,
          alt: "Before: nominees listed as First, Second and Third, “If the priority 1 nominee is deceased, the full amount will go to the next surviving nominee.” and Edit Priority",
          width: 750,
          height: 760,
        },
        after: {
          src: `${SHOTS}/parts/summary-successive-after.png`,
          alt: "After: nominees listed as First, Second and Third, “The full amount goes to First. Second gets it only if First has passed away.” and Edit Priority",
          width: 750,
          height: 754,
        },
      },
      {
        label: "Under the buttons",
        before: {
          src: `${SHOTS}/parts/footer-before.png`,
          alt: "Before: “You can add up to 4 nominees in a FD as per RBI”",
          width: 750,
          height: 50,
        },
        after: {
          src: `${SHOTS}/parts/footer-after.png`,
          alt: "After: “You can change nominees any time while your FD is active”",
          width: 750,
          height: 50,
        },
      },
    ],
    screens: [
      { src: "/case-studies/fd-nomination/v3-summary.png", alt: "Nominee summary before testing", caption: "Before" },
      { src: `${SHOTS}/summary-simultaneous-after.png`, alt: "Simultaneous summary after testing", caption: "After · Simultaneous" },
      { src: `${SHOTS}/summary-successive-after.png`, alt: "Successive summary after testing", caption: "After · Successive" },
    ],
  },
];

const NEXT_ITEMS: NextItem[] = [
  { title: "How many bookings add a nominee", text: "Whether an optional step still gets used." },
  { title: "Edits soon after booking", text: "A spike would mean people weren’t sure the first time." },
  { title: "Support questions about nominees", text: "What the screen still isn’t answering." },
];

const REFLECTION_GROUPS: ReflectionGroup[] = [
  {
    title: "What I’d do differently",
    cards: [
      {
        title: "Start from real families, not my examples",
        body: "My example taught limits that don’t exist: family only, round numbers, exactly four. Next time I’d collect people’s own family setups first and write the examples from those.",
      },
      {
        title: "Test the summary, not just the type screen",
        body: "We tested understanding on the type screen, but the wrong setups only showed up in what people chose. The summary is where a wrong nomination can still be caught, so that’s what I’d test next.",
      },
    ],
  },
  {
    title: "What I’m taking with me",
    cards: [
      {
        title: "The example is part of the interface",
        body: "7 of 15 people only understood after reading the example. When a screen explains a rule, the example does more teaching than the label, so it deserves the same design and testing as any button.",
      },
      {
        title: "Understanding the words isn’t getting it right",
        body: "13 of 15 could explain both types, yet 10 of 14 still set up the wrong one for a mixed wish. Next time I’d test whether people end up with the result they wanted, not only whether they understand the screen.",
      },
    ],
  },
];

export default function NomineeCaseStudyPage() {
  return (
    <main data-surface="white" className="flex flex-1 flex-col pb-[clamp(80px,12.1vw,160px)]">
      <PhoneHero
        eyebrow="One of India’s largest NBFCs"
        title="Multiple nominees for FDs"
        intro="RBI’s updated rules let FD customers name up to four nominees instead of one, either by priority or by percentage. I redesigned the single nominee form at one of India’s largest NBFCs into a flow that explains both types and helps people set up the right one, on mobile and desktop."
        meta={META}
        screen={<NomineeHeroImage />}
        cursor={false}
        // Animated prototype, parked for now:
        // screen={<SimultaneousFlow />}
        // fullPhone
      />

      <Summary text={TLDR_TEXT} figure={TLDR_FIGURE} />
      <ProblemStatement intro={PROBLEM_INTRO} parts={PROBLEM_PARTS} />
      <GettingToWork subsections={WORK} stickyNotes />
      <Bridge
        label="From research to design"
        heading="What stock apps couldn’t teach me"
        body="Stock apps showed how to collect several nominees. They didn’t show how to explain two types, order people by priority, or switch between them. That gap became the brief."
        cards={BRIDGE_CARDS}
        closing="Each went through a few rounds. Here’s how they evolved."
      />

      <GettingToWork
        id="case-design"
        title={null}
        label="Design approaches"
        subsections={APPROACHES}
      />

      <Testing
        label="Testing · with the research team"
        heading="Testing understanding, not just taps"
        body={TESTING_BODY}
        facts={TESTING_FACTS}
        note="Directional findings from a small sample (n = 15), tested on a mockup."
      />
      <Learnings
        label="Learnings · what testing showed"
        heading="The words worked. The product didn’t."
        intro="Most people understood both types. They still set up the wrong nomination when a real family wish didn’t fit one type, and most never realised it."
        groups={LEARNING_GROUPS}
      />
      <Changes
        label="What we changed · after testing"
        heading="Keep the words, change what the example teaches"
        intro={CHANGES_INTRO}
        comparisons={CHANGE_COMPARISONS}
      />
      <WhatsNext
        label="What’s next"
        heading="Before and after launch"
        intro="The flow is in development and not live yet. Once it ships, these are the signals I’d watch."
        items={NEXT_ITEMS}
      />
      <Reflection
        label="Reflection"
        heading="What this project taught me"
        intro="The words were never the hard part. The hard part was the gap between what people understood and what they set up."
        groups={REFLECTION_GROUPS}
      />

      {/* Dev-only: tags every piece of text with its rendered size. */}
      {process.env.NODE_ENV === "development" && <TypeInspector />}
    </main>
  );
}
