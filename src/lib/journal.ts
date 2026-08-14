import { type CatalogueKey } from './imagery';

/**
 * The journal. Each article carries its own body, so /journal/[slug] renders
 * from here rather than from a CMS — there are four pieces, and a headless CMS
 * for four pieces is infrastructure pretending to be a feature.
 *
 * Add an entry, add a route. Order is newest first; nothing sorts by date.
 */

export interface JournalBlock {
  heading?: string;
  paragraphs: readonly string[];
  /** Set as an indented statement rather than body copy. */
  pull?: string;
}

export interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  standfirst: string;
  image: CatalogueKey;
  body: readonly JournalBlock[];
}

export const journal: Article[] = [
  {
    slug: 'solid-mango-wood',
    title: 'The enduring appeal of solid mango wood',
    category: 'Material',
    date: 'June 2026',
    readTime: '4 min',
    excerpt:
      'Why the most overlooked hardwood in Indian furniture is quietly becoming the material of choice for European buyers.',
    standfirst:
      'Mango was a by-product before it was a material. Understanding why it was ignored explains most of what makes it good.',
    image: 'craft-barn-door',
    body: [
      {
        paragraphs: [
          'Mango is a fruiting tree first. An orchard tree stops producing usefully somewhere between fifteen and thirty years, and for most of the last century what happened next was firewood. The timber was a by-product of an agricultural decision that had already been made, which is precisely why it was cheap and why nobody wrote about it.',
          'That origin is also the argument for it. No forest is cleared to produce mango furniture. The felling schedule is set by fruit yield, not by joinery demand, and replanting is what an orchard does anyway. Almost nothing else at this price point can say that.',
        ],
      },
      {
        heading: 'What it is like to work',
        paragraphs: [
          'It sits around 640 to 700 kg per cubic metre, heavier than most pine and lighter than teak. Hard enough to hold a carved edge, soft enough that a chisel does not fight it, which is the combination the carving bench cares about. The grain is usually straight but interlocks often enough to be interesting, and it takes a stain evenly, which is not true of every hardwood at this density.',
          'The catch is moisture. Mango comes off the saw wet and it will move if you rush it. Every board we cut is air-dried and then brought down to eight to ten per cent in the kiln before it goes anywhere near a joint. Skip that and the piece is fine in Jodhpur and open at the seams by its first European winter, which is the single most common reason a container of mango furniture arrives as a claim.',
        ],
        pull: 'A piece that is fine in Jodhpur and open at the seams in Hamburg was not badly built. It was badly dried.',
      },
      {
        heading: 'Why buyers are moving to it now',
        paragraphs: [
          'Three things changed at once. Sheesham supply tightened and prices followed. Documentation requirements got serious enough that buyers started asking where timber came from before they asked what it cost. And the finish fashion turned towards pale, matt, visible grain, which happens to be exactly what mango does best and what teak does not.',
          'The result is that a material chosen for economy is now being chosen on merit. We have watched the same buyers who specified mango as the budget option four years ago put it at the top of the range.',
        ],
      },
      {
        heading: 'What to ask a supplier',
        paragraphs: [
          'Ask for the moisture content, not the drying method: anyone can say kiln-dried. Ask whether the carcass is framed or slab-built, because slab panels in a wide door are where movement shows first. Ask whether certified stock is available and what claim it carries, since the answer tells you whether the yard tracks its inputs at all.',
          'And ask to see the third container, not the first. Any factory can build one good piece.',
        ],
      },
    ],
  },
  {
    slug: 'timber-to-container',
    title: 'From timber to container',
    category: 'Factory',
    date: 'May 2026',
    readTime: '5 min',
    excerpt:
      'A rare look at how a piece moves from raw stock to a finished, export-ready container on the floor at Boranada.',
    standfirst:
      'Nine weeks, six benches, one roof. What actually happens between a signed order and a sealed container.',
    image: 'pr-industrial-drawers',
    body: [
      {
        paragraphs: [
          'Buyers usually see two moments: the sample and the delivery. Everything between is taken on trust, which is a strange thing to ask of a stranger nine thousand kilometres away. So here is the middle.',
        ],
      },
      {
        heading: 'Weeks one and two: release',
        paragraphs: [
          'An order does not start at the saw. It starts in the yard, where stock is selected against the specification and released to a works order. If the job carries a certification claim, the stack it comes from is tagged and recorded now, because a claim reconstructed later is not a claim.',
          'Boards are cut oversize deliberately. Timber that has been sitting in a stack will move once it is opened up, and cutting to final size on day one guarantees you will be planing a bow out of it on day twenty.',
        ],
      },
      {
        heading: 'Weeks three to five: the frame and the front',
        paragraphs: [
          'Carcasses are framed rather than slab-built. It uses more joints and more time, and it is the reason a two-metre cabinet arrives with its doors still aligned. Frames are squared, dry-fitted, then glued and clamped.',
          'The fronts run in parallel on their own benches. Carving, parquet, marquetry and tile are separate trades in this building; a carver does not lay parquet, and a patterned front will spend longer in this stage than the entire carcass did.',
        ],
        pull: 'A patterned front can take four days of one bench’s time. The carcass behind it takes two.',
      },
      {
        heading: 'Week six: finishing',
        paragraphs: [
          'Finishing is where a piece is made or ruined, and it is the stage that cannot be hurried by adding people. Sand, seal, sand back, colour, cure, wax. Each coat has a waiting time and the waiting time is not negotiable, whatever the shipping date says.',
          'Colour is mixed against a signed sample retained from approval, not against a code. Two batches of timber take the same stain differently, so matching is done by eye at the spray booth and corrected there.',
        ],
      },
      {
        heading: 'Weeks seven to nine: inspection, packing, loading',
        paragraphs: [
          'Every unit is assembled, checked, opened and closed, and then taken apart again where it ships knocked down. Drawers go back into the openings they were fitted to. Hardware is bagged to the unit, not to the order, because a bag of hinges for a container is a bag of hinges for nobody.',
          'Packing allows three centimetres of protection per face: corner boards, corrugate, and a stretch wrap that goes on last. Then the container is loaded by hand, in a plan drawn before anything moves, and the documents are issued against what actually went in rather than what was ordered.',
        ],
      },
      {
        heading: 'The part nobody advertises',
        paragraphs: [
          'Roughly one piece in forty comes off the line and goes back. Not for a fault a buyer would ever find, but for a drawer that is a fraction stiff, a colour that has gone half a shade warm, a joint that sounds wrong under a knuckle. Catching those on our floor costs us a week. Catching them in your warehouse costs both of us the relationship.',
        ],
      },
    ],
  },
  {
    slug: 'european-retail-2027',
    title: 'What European retail is ordering for 2027',
    category: 'Trade',
    date: 'April 2026',
    readTime: '3 min',
    excerpt:
      'Wabi-sabi finishes, reclaimed materials, and the return of the sideboard, read straight from the order book.',
    standfirst:
      'Forecasts are guesses. An order book is not. Here is what actually changed in ours over four seasons.',
    image: 'pr-chevron-terracotta',
    body: [
      {
        paragraphs: [
          'We do not run a trend department. What we have instead is nine markets, four seasons of repeat orders, and a reasonably clear view of what stopped selling. That is a narrower lens than a forecast but a more honest one.',
        ],
      },
      {
        heading: 'The sideboard is back, and it is longer',
        paragraphs: [
          'Two years ago the average sideboard we shipped was 150 cm. It is now closer to 175. Open-plan rooms need a piece that divides without walling off, and buyers have worked out that a long low run does that better than anything taller.',
          'Four doors are outselling three. Legs are outselling plinths by a wide margin, because a raised base makes a heavy piece read light and makes the floor easier to clean, which is the reason retailers actually give.',
        ],
      },
      {
        heading: 'Finish is moving quieter, not paler',
        paragraphs: [
          'The bleached-everything phase has settled. What is selling now is mid-tone, matt, and visibly wooden: washed naturals, thinned whitewash that lets grain through, waxes rather than lacquers. Gloss is gone from every market we ship to except one.',
          'Colour has not disappeared, it has moved to the front. A natural carcass with a painted, tiled or parquet front is the single fastest-growing configuration in our book.',
        ],
        pull: 'Gloss has gone from eight of our nine markets. Pattern has moved from the whole piece to the front of it.',
      },
      {
        heading: 'Reclaimed is now a documentation question',
        paragraphs: [
          'Reclaimed timber used to be specified for how it looked. It is now specified for what it lets a retailer say, and increasingly the buyer wants that in writing. The questions we field about recovered-material claims have roughly tripled, and they now arrive from buying teams rather than from marketing.',
          'Which means the paperwork is part of the product. A range that cannot be documented is, for a growing number of European retailers, a range they cannot list.',
        ],
      },
      {
        heading: 'Volumes down, frequency up',
        paragraphs: [
          'The clearest shift is commercial rather than aesthetic. Orders are smaller and more frequent: mixed containers four times a year instead of two full ones. Retailers are holding less stock and asking their suppliers to absorb the flexibility.',
          'For a factory that can only quote a full container, that is a problem. For one set up around mixed loads and low minimums, it is the whole opportunity.',
        ],
      },
    ],
  },
  {
    slug: 'what-fsc-actually-certifies',
    title: 'What FSC actually certifies',
    category: 'Certification',
    date: 'March 2026',
    readTime: '4 min',
    excerpt:
      'Chain of custody is a bookkeeping standard, not a stamp on a plank. What that means when you buy certified furniture.',
    standfirst:
      'Most people think FSC certifies wood. It certifies the paper trail the wood travels with, and that distinction decides what you can legally claim.',
    image: 'craft-round-table',
    body: [
      {
        paragraphs: [
          'There are two halves to the system and they are easy to confuse. Forest management certification looks at how a forest is run. Chain of custody certification looks at whether every business between that forest and your shop floor can prove what passed through its hands. A factory holds the second one.',
          'That matters commercially, because a certified forest with an uncertified factory in the middle produces furniture you cannot make a claim about. The chain is only as good as its weakest link, and the standard is designed to find that link.',
        ],
      },
      {
        heading: 'Three claims, not one',
        paragraphs: [
          'Certified stock does not all carry the same label. FSC 100% means every input traces to certified forest management. FSC Mix means certified and controlled material combined under a percentage or credit system, the usual claim on a piece that has a timber carcass, an iron frame and a stone top, because those three rarely share one source. FSC Recycled covers reclaimed material verified as recovered rather than newly felled.',
          'A supplier who says only "we are FSC" has told you nothing you can put on a label. Ask which claim, on which range.',
        ],
        pull: 'A supplier who says only “we are FSC” has told you nothing you can put on a label. Ask which claim, on which range.',
      },
      {
        heading: 'What it looks like on a factory floor',
        paragraphs: [
          'Mostly, it looks like separation and arithmetic. Certified stock is bought against the supplier’s own code and the claim is recorded on the invoice rather than assumed. It is stacked and tagged apart from uncertified stock, because once two stacks touch the claim is gone. Jobs carrying a claim get their own works order so the batch is traceable from the stack to the carton.',
          'Then the volumes are reconciled. You cannot sell more certified furniture than you bought certified timber, and an audit checks precisely that. It is unglamorous, and it is the entire value of the thing: a claim that can be verified after the fact.',
        ],
      },
      {
        heading: 'Why it is on request rather than standard',
        paragraphs: [
          'Certified stock costs more and is not always available in the volume a specific order needs. Quoting every piece as certified regardless would be the easy marketing answer and a false one. So we hold the certification, keep certified stock in the yard, and supply against it when a buyer asks, with the claim and our certificate code on the invoice and the packing list.',
          'If your market needs the paperwork, say so at the quote stage rather than the shipping stage. It is a sourcing decision, and sourcing happens in week one.',
        ],
      },
    ],
  },
];

export const findArticle = (slug: string) => journal.find((article) => article.slug === slug);
