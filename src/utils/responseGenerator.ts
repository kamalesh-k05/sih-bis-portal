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

const CONV: Record<string, Record<string, string>> = {
  hi: {
    isi: '**ISI चिह्न** BIS द्वारा जारी प्रमाणन चिह्न है। यह बताता है कि उत्पाद लागू भारतीय मानक पर खरा है।',
    bis: '**BIS (भारतीय मानक ब्यूरो)** भारत का राष्ट्रीय मानक निकाय है। यह IS कोड बनाता है और उत्पादों को प्रमाणित करता है।',
    huid: '**HUID** प्रत्येक हॉलमार्क आभूषण का 6-अंकीय कोड है। BIS Care ऐप से सत्यापित करें।',
    qco: '**QCO** सरकारी अधिसूचना है जो किसी मानक का पालन अनिवार्य करती है।',
    verify: 'उत्पाद सत्यापित करने के लिए:\n\n1. **लेबल पर ISI चिह्न** देखें\n2. **लाइसेंस नंबर** नोट करें\n3. **हमारा सत्यापन टूल** इस्तेमाल करें\n4. **BIS Care ऐप** डाउनलोड करें',
    mandatory: 'QCO वाले उत्पादों के लिए BIS प्रमाणन **अनिवार्य** है। बाकी के लिए स्वैच्छिक। अपना उत्पाद बताएं, मैं जांच दूंगा।',
    docs: 'आमतौर पर चाहिए:\n\n1. उत्पाद विवरण\n2. BIS मान्यता प्राप्त लैब रिपोर्ट\n3. निर्माण प्रक्रिया\n4. गुणवत्ता प्रक्रिया\n5. व्यवसाय दस्तावेज',
    fallback: 'मैं भारतीय मानकों में मदद कर सकता हूँ। पूछें:\n\n• आपके उत्पाद पर कौन-सा मानक\n• प्रमाणन अनिवार्य है या नहीं\n• उत्पाद कैसे सत्यापित करें\n• ISI, HUID का अर्थ',
  },
  ta: {
    isi: '**ISI முத்திரை** BIS வழங்கும் சான்றிதழ் முத்திரை. பொருள் இந்திய தரநிலையை பூர்த்தி செய்கிறது என்பதைக் காட்டுகிறது.',
    bis: '**BIS** இந்தியாவின் தேசிய தரநிலை அமைப்பு. IS குறியீடுகளை உருவாக்கி சான்றிதழ் வழங்குகிறது.',
    huid: '**HUID** ஒவ்வொரு ஹால்மார்க் நகைக்குமான 6-இலக்க குறியீடு. BIS Care செயலி மூலம் சரிபார்க்கவும்.',
    qco: '**QCO** என்பது ஒரு தரநிலையை கட்டாயமாக்கும் அரசு அறிவிப்பு.',
    verify: 'பொருளை சரிபார்க்க:\n\n1. **ISI முத்திரை** பாருங்கள்\n2. **உரிம எண்** குறிக்கவும்\n3. **எங்கள் சரிபார்ப்பு கருவி** பயன்படுத்தவும்\n4. **BIS Care செயலி** பதிவிறக்கவும்',
    mandatory: 'QCO உள்ள பொருட்களுக்கு BIS சான்றிதழ் **கட்டாயம்**. மற்றவை தன்னார்வம். உங்கள் பொருளைச் சொல்லுங்கள்.',
    docs: 'பொதுவாக தேவை:\n\n1. பொருள் விவரங்கள்\n2. BIS அங்கீகரித்த ஆய்வக அறிக்கை\n3. உற்பத்தி செயல்முறை\n4. தரக் கட்டுப்பாடு',
    fallback: 'இந்திய தரநிலைகளில் உதவ முடியும். கேளுங்கள்:\n\n• உங்கள் பொருளுக்கான தரநிலை\n• சான்றிதழ் கட்டாயமா\n• பொருளை எப்படி சரிபார்ப்பது',
  },
  te: {
    isi: '**ISI మార్క్** BIS జారీ చేసే ధృవీకరణ గుర్తు. ఉత్పత్తి భారతీయ ప్రమాణానికి అనుగుణంగా ఉందని చూపుతుంది.',
    bis: '**BIS** భారత జాతీయ ప్రమాణాల సంస్థ. IS కోడ్‌లను రూపొందించి ధృవీకరిస్తుంది.',
    huid: '**HUID** ప్రతి హాల్‌మార్క్ ఆభరణానికి 6-అంకెల కోడ్. BIS Care యాప్‌లో ధృవీకరించండి.',
    qco: '**QCO** అనేది ఒక ప్రమాణాన్ని తప్పనిసరి చేసే ప్రభుత్వ నోటిఫికేషన్.',
    verify: 'ఉత్పత్తిని ధృవీకరించడానికి:\n\n1. **ISI మార్క్** చూడండి\n2. **లైసెన్స్ నంబర్** నోట్ చేయండి\n3. **మా ధృవీకరణ సాధనం** వాడండి\n4. **BIS Care యాప్** డౌన్‌లోడ్ చేయండి',
    mandatory: 'QCO ఉన్న ఉత్పత్తులకు BIS ధృవీకరణ **తప్పనిసరి**. మీ ఉత్పత్తి చెప్పండి.',
    docs: 'సాధారణంగా కావాలి:\n\n1. ఉత్పత్తి వివరాలు\n2. BIS గుర్తింపు ల్యాబ్ నివేదిక\n3. తయారీ విధానం',
    fallback: 'భారతీయ ప్రమాణాలలో సహాయం చేయగలను. అడగండి:\n\n• మీ ఉత్పత్తికి ప్రమాణం\n• ధృవీకరణ తప్పనిసరా\n• ఉత్పత్తిని ఎలా ధృవీకరించాలి',
  },
};

export function generateConversationalResponse(query: string, lang = 'en'): string {
  const lower = query.toLowerCase();
  const L = CONV[lang] || null;

  const pick = (key: string, en: string) => (L && L[key]) || en;

  if (lower.includes('what is isi') || lower.includes('what does isi mean') || query.includes('ISI क्या') || query.includes('ISI என்றால்')) {
    return pick('isi', 'The **ISI mark** is a certification mark issued by the Bureau of Indian Standards (BIS). It indicates that a product meets the applicable Indian Standard for quality, safety, and performance. Products like electrical appliances, cement, and kitchen appliances often require this mark to be sold in India.');
  }

  if (lower.includes('what is bis') || lower.includes('what does bis mean')) {
    return pick('bis', '**BIS (Bureau of Indian Standards)** is India\'s national standards body. It develops and publishes Indian Standards (IS codes) for products, processes, and services. BIS also certifies products through various schemes to ensure they meet quality and safety requirements.');
  }

  if (lower.includes('what is huid') || lower.includes('huid')) {
    return pick('huid', '**HUID (Hallmark Unique Identification)** is a unique 6-digit alphanumeric code assigned to each piece of hallmark jewellery. It helps track and verify the purity of gold and silver items. You can verify HUID through the BIS Care app or the BIS website.');
  }

  if (lower.includes('what is qco') || lower.includes('quality control order')) {
    return pick('qco', 'A **QCO (Quality Control Order)** is a legal notification issued by the government that makes compliance with a specific Indian Standard mandatory for certain products. When a QCO is issued for a product, manufacturers must obtain BIS certification before selling it in India.');
  }

  if (lower.includes('how to check') || lower.includes('how can i verify') || lower.includes('is this genuine')) {
    return pick('verify', 'You can verify a product\'s BIS certification by:\n\n1. **Check the product label** for the ISI mark or BIS Standard Mark\n2. **Note the licence number** printed on or near the mark\n3. **Use our verification tool** to check the licence details\n4. **Download the BIS Care app** for official verification\n\nWould you like me to help you verify a specific product?');
  }

  if (lower.includes('is bis certification compulsory') || lower.includes('mandatory') || lower.includes('compulsory')) {
    return pick('mandatory', 'BIS certification is mandatory for products covered under a Quality Control Order (QCO). Many products like electrical appliances, cement, steel, and packaged drinking water require mandatory certification.\n\nFor other products, BIS certification is voluntary but can enhance market trust and credibility.\n\nTell me what product you make, and I can check the specific requirements.');
  }

  if (lower.includes('documents') || lower.includes('what do i need')) {
    return pick('docs', 'For BIS certification, you typically need:\n\n**Documents Required:**\n1. Product specifications and details\n2. Test reports from a BIS-recognized lab\n3. Manufacturing process details\n4. Quality control procedures\n5. Business registration documents\n6. Factory layout and details\n\nThe exact requirements vary by product category. Tell me your product and I can provide a more specific checklist.');
  }

  return pick('fallback', 'I can help you with Indian Standards and BIS certification. You can ask me about:\n\n• What standard applies to your product\n• Whether BIS certification is mandatory\n• How to verify a product\n• What ISI, HUID, or other BIS marks mean\n• Documents needed for certification\n\nOr use the **Find My Standards** or **Verify My Product** tools for guided assistance.');
}
