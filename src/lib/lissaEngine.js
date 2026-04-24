/**
 * LISSA — Lenovo Intelligent Sustainability & Solutions Advisor
 * Placeholder response engine for POC.
 *
 * ── Future integration points ────────────────────────────────────────────────
 * 1. Replace generateLissaResponse() body with an API call to your chosen
 *    LLM endpoint (OpenAI Chat Completions, Azure OpenAI, Anthropic Claude).
 * 2. Pass `history` to the API for multi-turn conversation context.
 * 3. Add a retrieval layer (RAG) to ground responses in:
 *      - Lenovo Product Carbon Footprint (PCF) database
 *      - Lenovo ESG reports and corporate sustainability disclosures
 *      - Lenovo product catalogue and pricing data
 *      - LCA calculation outputs from this portal
 *      - Quote and product-comparison workflows
 * 4. The message schema { id, role, content, timestamp } is compatible with
 *    OpenAI and Anthropic message formats. The `content` field can be a
 *    string (user messages, welcome) or a StructuredResponse object
 *    (assistant responses). A real API should return structured JSON that
 *    maps to the same StructuredResponse shape.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const LISSA_VERSION = '0.1.0-poc'

// ── Keyword sets for placeholder category routing ─────────────────────────────

const KEYWORDS = {
  sustainability: [
    'carbon', 'emission', 'emissions', 'sustainability', 'sustainable',
    'lifecycle', 'life cycle', 'environment', 'environmental', 'green',
    'footprint', 'pcf', 'scope', 'ghg', 'co2', 'climate', 'lca',
    'refurbish', 'circular', 'end of life', 'manufacturing', 'embodied',
    'net zero', 'net-zero', 'decarbonise', 'decarbonize',
  ],
  lenovo: [
    'lenovo', 'thinkpad', 'thinkcentre', 'thinkstation', 'ideapad',
    'ars', 'asset recovery', 'esg', 'esrs', 'csrd', 'corporate',
    'sustainability report', 'sbti', 'science based', 'annual report',
  ],
  procurement: [
    'buy', 'buying', 'lease', 'leasing', 'daas', 'device as a service',
    'refresh', 'device', 'devices', 'laptop', 'laptops', 'desktop',
    'desktops', 'workstation', 'workstations', 'procurement', 'purchase',
    'purchasing', 'tablet', 'monitor', 'hardware', 'fleet', 'compare',
    'comparison', 'options', 'quote', 'cost', 'price', 'budget',
  ],
}

function detectCategory(message) {
  const lower = message.toLowerCase()
  // Sustainability checked first — most specific to this portal's purpose
  if (KEYWORDS.sustainability.some(k => lower.includes(k))) return 'sustainability'
  if (KEYWORDS.lenovo.some(k => lower.includes(k))) return 'lenovo'
  if (KEYWORDS.procurement.some(k => lower.includes(k))) return 'procurement'
  return 'general'
}

// ── Structured response shape ─────────────────────────────────────────────────
// All six fields are required. A future AI/RAG backend should populate
// the same shape so the rendering layer needs no changes.

function sr(recommendation, carbonPerspective, commercialPerspective, lenovoRelevance, assumptions, nextStep) {
  return { recommendation, carbonPerspective, commercialPerspective, lenovoRelevance, assumptions, nextStep }
}

// ── Placeholder responses (one per category) ─────────────────────────────────

const PLACEHOLDER_RESPONSES = {
  sustainability: sr(
    'Evaluate the full lifecycle carbon footprint of each device option as a core input to your procurement decision — not just upfront cost or performance.',
    'IT hardware generates 70–90% of its total lifetime emissions during manufacturing. A typical business laptop carries 250–400 kg CO₂e of embodied carbon before it is ever switched on. Extending refresh cycles, selecting energy-efficient models, and choosing refurbished devices where appropriate can substantially reduce your Scope 3 Category 1 inventory. Use phase emissions are driven by grid carbon intensity and device wattage — factoring in regional electricity mix improves accuracy.',
    'Reducing device refreshes from a 3-year to a 4-year cycle can lower both capital expenditure and embodied carbon. Total cost of ownership modelling should incorporate carbon cost alongside financial cost, particularly as internal carbon pricing and Scope 3 reporting obligations become more prevalent. Carbon-adjusted TCO can shift the relative merits of refurbished, new, and DaaS options significantly.',
    'Lenovo publishes Product Carbon Footprint (PCF) data for major ThinkPad, ThinkCentre, and ThinkStation product lines. These PCF values can be used directly in Scope 3 Category 1 inventories. Lenovo Asset Recovery Services (ARS) supports responsible end-of-life device recovery, and Device-as-a-Service (DaaS) can be structured to include circular economy and sustainability clauses.',
    'This response draws on general IT hardware lifecycle principles. Specific PCF values vary by product model, manufacturing location, electricity grid mix, and organisational usage profile. All figures are illustrative.',
    'Request Lenovo PCF data sheets for the specific models under consideration. Map PCF values against your Scope 3 reporting requirements and current refresh cycle to quantify the emissions impact of different procurement scenarios.',
  ),

  lenovo: sr(
    'Engage Lenovo\'s sustainability and commercial teams to access verified product carbon footprint data, ESG documentation, and circular economy service options aligned with your reporting requirements.',
    'Lenovo tracks and publicly discloses Scope 1, 2, and 3 emissions across its value chain. Product Carbon Footprint (PCF) data is published for major device families, enabling customers to include hardware emissions in their own Scope 3 Category 1 inventories with a verifiable, manufacturer-provided basis. PCF methodology follows ISO 14040/44 and the GHG Protocol Product Standard.',
    'Lenovo\'s DaaS (Device-as-a-Service) model bundles hardware, lifecycle management, and recovery services into a predictable per-seat operational cost. Lenovo Asset Recovery Services (ARS) provides financial return on retired devices while ensuring responsible disposal, data security, and circular economy compliance — reducing net capital cost of the next refresh cycle.',
    'Lenovo is aligned with the Science Based Targets initiative (SBTi) and publishes an annual ESG report covering climate, circular economy, supply chain, and diversity topics. Customers can reference Lenovo\'s public disclosures when preparing their own GRI 305, ESRS E1, CDP Climate, or IFRS S2 submissions, providing a consistent and credible upstream data source.',
    'Corporate sustainability commitments and programme availability may have evolved since this POC was built. Always verify current disclosures, PCF data, and service availability directly with Lenovo. This response reflects publicly available information at the time of development.',
    'Contact your Lenovo account team to request the latest PCF documentation, current ARS and DaaS programme details, and Lenovo\'s most recent annual ESG report. Ask specifically about PCF data aligned to the device models in your fleet.',
  ),

  procurement: sr(
    'Evaluate device procurement through a total lifecycle lens — combining financial cost, carbon impact, service model flexibility, and end-of-life obligations — before committing to buy, lease, or Device-as-a-Service.',
    'Procurement model choice directly affects when and how devices are retired, which in turn affects net embodied carbon. DaaS and managed lease models, when structured with circular economy clauses, ensure devices are recovered and refurbished rather than disposed of, reducing end-of-life carbon. Extending refresh cycles under any model reduces the frequency of new manufacturing cycles — the single largest source of device-related emissions.',
    'Outright purchase gives full control over asset refresh timing and may offer the lowest total financial cost at scale, but carries full refresh and disposal burden. Operating lease shifts to OpEx and reduces asset management complexity. DaaS bundles hardware, Premier Support, and lifecycle management into a predictable per-seat fee — simplifying sustainability reporting as the service provider takes responsibility for lifecycle management. Financial and carbon-adjusted TCO should be modelled across a 3–5 year horizon.',
    'Lenovo offers all three models: direct purchase through commercial channels, leasing via financial partners, and DaaS through Lenovo\'s managed service portfolio. Lenovo ARS can be integrated with any procurement model to ensure responsible recovery at end of contract or refresh. Lenovo\'s account teams can provide scenario modelling for fleet-level cost and carbon comparisons.',
    'Optimal procurement model depends on organisational size, capital versus operating budget preference, IT management capability, sustainability reporting commitments, and current refresh cycle maturity. Fleet size and device mix affect per-unit economics significantly.',
    'Model total cost of ownership for each option across a 3–5 year horizon, incorporating a carbon cost per tonne alongside financial cost. Engage your Lenovo account team to explore DaaS and ARS options for your specific fleet profile and refresh timeline.',
  ),

  general: sr(
    'LISSA is designed to guide IT procurement decisions through a carbon, lifecycle, commercial, and Lenovo knowledge lens. Try a more specific question to receive structured guidance on any of these dimensions.',
    'Carbon and lifecycle impact are increasingly central to enterprise IT strategy. Future versions of LISSA will connect directly to Lenovo\'s Product Carbon Footprint database and the LCA calculation outputs from this portal to provide model-specific, verified emissions guidance in real time.',
    'Commercial IT decisions involve total cost of ownership, service model selection, refresh cycle optimisation, residual value, and sustainability compliance. LISSA is designed to bring these factors together with carbon and ESG context in a single advisory interface.',
    'Lenovo offers a range of devices, services, and corporate sustainability resources. Future versions of LISSA will use retrieval-augmented generation against approved Lenovo product data, PCF records, ESG reports, and quote workflows to provide accurate, traceable, and up-to-date responses.',
    'This is a POC response using simplified placeholder logic. Future versions of LISSA will use approved Lenovo sources, verified PCF data, and real-time product information rather than generalised content. Responses should not be used for formal reporting or commercial decisions.',
    'Try one of the suggested prompts to explore a specific topic, or ask a focused question about carbon impact, device procurement options, Lenovo sustainability programmes, or buy vs lease vs DaaS.',
  ),
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generates a structured LISSA response for a user message.
 *
 * FUTURE INTEGRATION POINT — replace this function body:
 *
 *   const response = await fetch('/api/lissa/chat', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ message, history }),
 *   })
 *   return response.json()
 *
 * Or directly via an SDK:
 *
 *   const completion = await openai.chat.completions.create({
 *     model: 'gpt-4o',
 *     messages: [systemPrompt, ...history, { role: 'user', content: message }],
 *     response_format: { type: 'json_object' },  // enforce StructuredResponse schema
 *   })
 *   return JSON.parse(completion.choices[0].message.content)
 *
 * @param {string} message - The latest user message
 * @param {Array<{id:string, role:string, content:any, timestamp:string}>} history
 * @returns {Promise<StructuredResponse>}
 */
export async function generateLissaResponse(message, history = []) {
  // Simulate realistic network latency (600–1200 ms) for demo feel
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600))
  return PLACEHOLDER_RESPONSES[detectCategory(message)]
}

export const SUGGESTED_PROMPTS = [
  'Compare two device options from a carbon perspective',
  'Explain how IT purchasing choices affect emissions',
  'What Lenovo sustainability information should I consider?',
  'Help me prepare questions for a client refresh discussion',
  'Explain buy vs lease vs Device-as-a-Service',
]

// Initial message — plain string content (not structured)
export const WELCOME_MESSAGE = {
  id: 'lissa-welcome',
  role: 'assistant',
  content: "Hi, I'm LISSA — your Lenovo Intelligent Sustainability & Solutions Advisor. I can help you explore IT purchase choices through a carbon, lifecycle, commercial, and Lenovo corporate-information lens. This POC uses simplified responses, but it is designed to connect to richer product, sustainability, and AI services later.",
  timestamp: new Date().toISOString(),
}
