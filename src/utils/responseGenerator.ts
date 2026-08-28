import { IndianStandard } from '../data/standards';
import { SearchResult } from './searchEngine';

export function generateProductStandardsResponse(
  productQuery: string,
  results: SearchResult[]
): {
  summary: string;
  standards: {
    standard: IndianStandard;
    matchReason: string;
    confidence: 'high' | 'medium' | 'low';
    whyApplicable: string;
    certificationStatus: string;
  }[];
  recommendations: string[];
} {
  const productType = extractProductType(productQuery);

  const summary = results.length > 0
    ? `I understand. You're asking about "${productType}". I've identified ${results.length} standard${results.length > 1 ? 's' : ''} that may be relevant to your product.`
    : `I understand you're asking about "${productType}". Let me check for applicable standards.`;

  const standards = results.map(r => ({
    standard: r.standard,
    matchReason: r.matchReason,
    confidence: r.confidence,
    whyApplicable: generateWhyApplicable(productQuery, r),
    certificationStatus: formatCertificationStatus(r.standard),
  }));

  const recommendations: string[] = [];
  if (results.some(r => r.standard.certificationRequired === 'mandatory')) {
    recommendations.push('Some standards for your product category require mandatory BIS certification. Check the certification roadmap for next steps.');
  }
  if (results.length > 0) {
    recommendations.push('Review the detailed standard information to understand specific requirements.');
    recommendations.push('Start the certification process early, it can take several weeks.');
  }
  if (results.length === 0) {
    recommendations.push('Try describing your product with more specific details, such as the material, size, or intended use.');
    recommendations.push('You can also ask our BIS Assistant for help identifying the right standard.');
  }

  return { summary, standards, recommendations };
}

function extractProductType(query: string): string {
  const cleaned = query
    .replace(/^(i\s+)?(make|manufacture|sell|produce|create|build|assemble)\s+/i, '')
    .replace(/^(a\s+|an\s+|the\s+)/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function generateWhyApplicable(query: string, result: SearchResult): string {
  const queryLower = query.toLowerCase();
  const std = result.standard;

  for (const example of std.productExamples) {
    if (queryLower.includes(example.toLowerCase())) {
      return `Your product directly matches "${example}", which is specifically covered by ${std.id}. This standard defines the requirements for ${std.title.toLowerCase()}.`;
    }
  }

  if (queryLower.includes(std.category.toLowerCase())) {
    return `Your product falls within the "${std.category}" category. ${std.id} (${std.title}) covers products in this category.`;
  }

  return `Based on your description, ${std.id} appears relevant as it covers ${std.category.toLowerCase()} products. The standard addresses ${std.scope.toLowerCase()}.`;
}

function formatCertificationStatus(std: IndianStandard): string {
  switch (std.certificationRequired) {
    case 'mandatory':
      return `Mandatory: BIS certification is required for this product. QCO: ${std.qcoName || 'Check applicable notification'}.`;
    case 'check_qco':
      return 'Check QCO: certification requirements may vary. Please verify the applicable Quality Control Order.';
    case 'voluntary':
      return 'Voluntary: BIS certification is not mandatory but may enhance market credibility.';
    default:
      return 'Please verify the applicable certification requirements.';
  }
}

export function generateConversationalResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('what is isi') || lower.includes('what does isi mean')) {
    return 'The **ISI mark** is a certification mark issued by the Bureau of Indian Standards (BIS). It indicates that a product meets the applicable Indian Standard for quality, safety, and performance. Products like electrical appliances, cement, and kitchen appliances often require this mark to be sold in India.';
  }

  if (lower.includes('what is bis') || lower.includes('what does bis mean')) {
    return '**BIS (Bureau of Indian Standards)** is India\'s national standards body. It develops and publishes Indian Standards (IS codes) for products, processes, and services. BIS also certifies products through various schemes to ensure they meet quality and safety requirements.';
  }

  if (lower.includes('what is huid') || lower.includes('huid')) {
    return '**HUID (Hallmark Unique Identification)** is a unique 6-digit alphanumeric code assigned to each piece of hallmark jewellery. It helps track and verify the purity of gold and silver items. You can verify HUID through the BIS Care app or the BIS website.';
  }

  if (lower.includes('what is qco') || lower.includes('quality control order')) {
    return 'A **QCO (Quality Control Order)** is a legal notification issued by the government that makes compliance with a specific Indian Standard mandatory for certain products. When a QCO is issued for a product, manufacturers must obtain BIS certification before selling it in India.';
  }

  if (lower.includes('how to check') || lower.includes('how can i verify') || lower.includes('is this genuine')) {
    return 'You can verify a product\'s BIS certification by:\n\n1. **Check the product label** for the ISI mark or BIS Standard Mark\n2. **Note the licence number** printed on or near the mark\n3. **Use our verification tool** to check the licence details\n4. **Download the BIS Care app** for official verification\n\nWould you like me to help you verify a specific product?';
  }

  if (lower.includes('is bis certification compulsory') || lower.includes('mandatory') || lower.includes('compulsory')) {
    return 'BIS certification is mandatory for products covered under a Quality Control Order (QCO). Many products like electrical appliances, cement, steel, and packaged drinking water require mandatory certification.\n\nFor other products, BIS certification is voluntary but can enhance market trust and credibility.\n\nTell me what product you make, and I can check the specific requirements.';
  }

  if (lower.includes('documents') || lower.includes('what do i need')) {
    return 'For BIS certification, you typically need:\n\n**Documents Required:**\n1. Product specifications and details\n2. Test reports from a BIS-recognized lab\n3. Manufacturing process details\n4. Quality control procedures\n5. Business registration documents\n6. Factory layout and details\n\nThe exact requirements vary by product category. Tell me your product and I can provide a more specific checklist.';
  }

  return 'I can help you with Indian Standards and BIS certification. You can ask me about:\n\n• What standard applies to your product\n• Whether BIS certification is mandatory\n• How to verify a product\n• What ISI, HUID, or other BIS marks mean\n• Documents needed for certification\n\nOr use the **Find My Standards** or **Verify My Product** tools for guided assistance.';
}
