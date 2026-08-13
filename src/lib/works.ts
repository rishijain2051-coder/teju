import { type CatalogueKey } from './imagery';

/**
 * The works: how a piece is made (Craft) and where it is made (Factory).
 *
 * FIGURES TO CONFIRM WITH THE WORKS. The 9,000 sq.mt total and the nine export
 * markets are the company's own numbers. The floor breakdown, headcounts and
 * week-by-week timeline below are written to be consistent with them — correct
 * any that differ from what the shop floor actually looks like. Both pages read
 * from here, so one edit fixes both.
 */

/* ── Craft ───────────────────────────────────────────────────────────────── */

export interface CraftStage {
  index: string;
  title: string;
  /** Where in the building this happens. Set as the stage's dateline. */
  place: string;
  detail: string;
  /** Only some stages carry a plate; the page alternates deliberately. */
  image?: CatalogueKey;
}

export const craftStages: CraftStage[] = [
  {
    index: '01',
    title: 'Selection',
    place: 'The yard',
    detail:
      'Plantation mango arrives in the round and is graded before it is bought, not after. Boards with the interlocking grain that carves well are set aside for the carving benches; straight, quiet stock goes to the plain ranges where nothing should distract. Certified stock is stacked and tagged separately from the moment it is unloaded.',
    image: 'hero-mango-light',
  },
  {
    index: '02',
    title: 'Seasoning',
    place: 'Stack and kiln',
    detail:
      'Air-dried in open stacks first, then brought down to eight to ten per cent moisture in the kiln. This is the stage that decides whether a piece survives its first winter in a heated European room, and it is the one that cannot be shortened by working faster.',
  },
  {
    index: '03',
    title: 'Milling',
    place: 'Machine shop',
    detail:
      'Cut oversize on purpose. Timber released from a stack will move once it is opened up, so final dimensions are taken later — cutting to size on day one guarantees planing a bow out of it on day twenty.',
  },
  {
    index: '04',
    title: 'Joinery',
    place: 'Frame bench',
    detail:
      'Carcasses are framed rather than slab-built: more joints, more time, and the reason a two-metre cabinet arrives with its doors still in line. Everything is dry-fitted and squared before glue goes anywhere near it.',
    image: 'craft-barn-door',
  },
  {
    index: '05',
    title: 'Carving',
    place: 'Chisel benches',
    detail:
      'One piece, one hand, start to finish. Splitting a carved front between two carvers to save a day produces two different depths of cut on the same door, and it is visible from across a room in raking light.',
    image: 'pr-mandala-carved',
  },
  {
    index: '06',
    title: 'Surface work',
    place: 'Parquet and tile',
    detail:
      'Parquet, marquetry and tile are separate trades in this building. A diamond front can run to three hundred laid pieces, sanded afterwards as a single face so the joints disappear. Tiles are painted and fired in Jodhpur, then set into a rebate to finish flush.',
    image: 'pr-parquet-green',
  },
  {
    index: '07',
    title: 'Finishing',
    place: 'Spray and wax',
    detail:
      'Sand, seal, sand back, colour, cure, wax. Colour is mixed against the signed sample retained at approval rather than against a code, because two batches of timber take the same stain differently and the correction is made by eye at the booth.',
    image: 'craft-round-table',
  },
  {
    index: '08',
    title: 'Inspection',
    place: 'Before the carton',
    detail:
      'Assembled, opened, closed, and taken apart again where it ships knocked down. Drawers return to the openings they were fitted to and hardware is bagged to the unit rather than the order. Around one piece in forty goes back to a bench at this stage.',
  },
];

/* ── Factory ─────────────────────────────────────────────────────────────── */

export interface FloorArea {
  name: string;
  size: string;
  detail: string;
}

/** Sums to the 9,000 sq.mt in `facts.factory`. Keep it that way. */
export const floorAreas: FloorArea[] = [
  { name: 'Timber yard & kiln', size: '2,100 sq.mt', detail: 'Open stacks, tagged certified stock, two kiln chambers.' },
  { name: 'Machine shop', size: '1,600 sq.mt', detail: 'Sawing, planing, thicknessing, moulding.' },
  { name: 'Joinery & assembly', size: '2,400 sq.mt', detail: 'Frame benches, dry-fit bays, clamping.' },
  { name: 'Carving & surface work', size: '1,100 sq.mt', detail: 'Chisel benches, parquet laying, tile setting.' },
  { name: 'Finishing', size: '1,000 sq.mt', detail: 'Spray booths, curing racks, wax bench.' },
  { name: 'Inspection, packing & loading', size: '800 sq.mt', detail: 'Assembly check, carton line, container bay.' },
];

export interface TimelineStep {
  when: string;
  title: string;
  detail: string;
}

export const orderTimeline: TimelineStep[] = [
  {
    when: 'Day 0',
    title: 'Enquiry and quotation',
    detail: 'Specification in, price and lead time out. If a date cannot be held, it is not quoted.',
  },
  {
    when: 'Day 3–10',
    title: 'Sample or drawing sign-off',
    detail: 'One approval sample for a new design or a contract programme. It is retained and becomes the reference for colour and finish.',
  },
  {
    when: 'Week 2',
    title: 'Timber released',
    detail: 'Stock selected against the works order and released from the yard. Certification claims are recorded here, at the stack.',
  },
  {
    when: 'Week 3–5',
    title: 'Joinery and surface work',
    detail: 'Carcasses framed and squared while fronts run in parallel on the carving, parquet and tile benches.',
  },
  {
    when: 'Week 6',
    title: 'Finishing',
    detail: 'Coats and cure times, matched to the retained sample. The one stage that cannot be compressed by adding people.',
  },
  {
    when: 'Week 7',
    title: 'Inspection and packing',
    detail: 'Every unit assembled and checked, then packed with three centimetres of protection per face.',
  },
  {
    when: 'Week 8–9',
    title: 'Container loaded, documents issued',
    detail: 'Loaded by hand to a plan drawn before anything moves. Paperwork is issued against what went in, not what was ordered.',
  },
];

/** Nine active destinations — the figure in `facts.countries`. */
export const exportMarkets = [
  'Germany',
  'United Kingdom',
  'Italy',
  'France',
  'Netherlands',
  'Spain',
  'United States',
  'Australia',
  'United Arab Emirates',
] as const;

export const logistics = [
  { key: 'Ports', value: 'Mundra & Nhava Sheva' },
  { key: 'Road to port', value: '8–10 hours from the works' },
  { key: 'Terms', value: 'FOB, CIF, EXW' },
  { key: 'Loads', value: '20 ft, 40 ft HQ, mixed containers' },
  { key: 'Documents', value: 'Invoice, packing list, BL, CoO, fumigation' },
  { key: 'Minimum', value: 'From two pieces per design' },
] as const;

/**
 * The honest list. Reads better than another capability grid, and it stops the
 * conversations that were never going to work at the enquiry stage rather than
 * three weeks in.
 */
export const notOurWork = [
  'Upholstery. We build frames and casegoods; seating pads and covers are not made here.',
  'Flat-pack knock-down engineered for self-assembly retail. Our pieces ship assembled or part-assembled.',
  'MDF, particle board or veneered panel construction, in any range, at any price.',
  'Container-only minimums. If you need forty pieces rather than four hundred, that is a normal order here.',
] as const;

/* ── Certification ───────────────────────────────────────────────────────── */

export const certification = {
  fsc: {
    /**
     * The chain-of-custody code from your FSC certificate — format FSC-C123456.
     * Left empty on purpose: FSC's trademark rules require the code to travel
     * with the claim, and an invented code would be worse than none. Fill this
     * in and every FSC block on the site starts printing it automatically.
     */
    code: '',
    holder: 'Vardhman Impex',
    scope: 'Chain of custody — solid wood furniture and casegoods',
    /** Why it is offered on request rather than claimed across the board. */
    position:
      'Certified stock costs more and is not always available in the volume a given order needs, so quoting every piece as certified regardless would be a false claim. We hold the certification, keep certified stock tagged in the yard, and supply against it when a buyer asks — with the claim and our certificate code on the invoice and the packing list.',
    claims: [
      {
        claim: 'FSC 100%',
        detail:
          'Every input traces to certified forest management. Available on plantation mango where a whole batch comes from one certified source.',
      },
      {
        claim: 'FSC Mix',
        detail:
          'Certified and controlled inputs combined under a percentage or credit system. The usual claim on multi-material designs — a timber carcass, an iron frame and a stone top rarely share one source.',
      },
      {
        claim: 'FSC Recycled',
        detail:
          'Reclaimed material verified as recovered rather than newly felled. This is the claim that covers our reclaimed hardwood ranges.',
      },
    ],
    custody: [
      {
        index: '01',
        detail:
          'Certified stock is bought against the supplier’s own code and the claim is recorded on the invoice rather than assumed.',
      },
      {
        index: '02',
        detail:
          'It is stacked and tagged apart in the yard. Certified and uncertified timber never share a stack, because once they touch the claim is gone.',
      },
      {
        index: '03',
        detail:
          'Any job carrying a claim gets its own works order, so the batch stays traceable from the stack to the carton.',
      },
      {
        index: '04',
        detail:
          'The claim transfers onto your invoice and packing list with our certificate code — which is what your broker and your own buyers will ask to see.',
      },
      {
        index: '05',
        detail:
          'Volumes in and out are reconciled. You cannot sell more certified furniture than you bought certified timber, and the audit checks exactly that.',
      },
    ],
  },
} as const;
