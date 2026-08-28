from typing import List, Dict
from search_engine import SearchResult
from standards_data import IndianStandard


def generate_standards_response(query: str, results: List[SearchResult]) -> Dict:
    summary = (
        f'I identified {len(results)} standard(s) relevant to your product.'
        if results else 'I could not find specific standards for this description.'
    )

    standards = []
    for r in results[:5]:
        std = r.standard
        cert = {
            'mandatory': 'Mandatory',
            'voluntary': 'Voluntary',
            'check_qco': 'Check QCO',
        }.get(std.certification_required, 'Unknown')

        standards.append({
            'id': std.id,
            'title': std.title,
            'category': std.category,
            'match_reason': r.match_reason,
            'confidence': r.confidence,
            'certification_status': cert,
            'qco': std.qco_name,
            'description': std.description,
            'what_it_covers': std.what_it_covers,
            'documents_needed': std.documents_needed,
            'source': std.source,
            'last_updated': std.last_updated,
            'evidence_text': std.evidence_text,
            'why_applicable': std.applicability_reason,
        })

    return {
        'query': query,
        'summary': summary,
        'standards': standards,
        'disclaimer': 'This information is for guidance only. Confirm all requirements with BIS or the applicable official notification.',
    }


def generate_conversational_response(query: str) -> Dict:
    q = query.lower()
    if 'isi' in q and ('what' in q or 'mean' in q or 'explain' in q):
        body = 'The ISI mark is a certification mark issued by the Bureau of Indian Standards (BIS). It indicates that a product meets the applicable Indian Standard for quality, safety, and performance.'
    elif 'huid' in q or 'hallmark' in q:
        body = 'HUID (Hallmark Unique Identification) is a unique 6-character alphanumeric code assigned to each gold jewellery item at hallmarking time. It helps verify gold purity through the BIS Care app.'
    elif 'qco' in q or 'quality control' in q:
        body = 'A Quality Control Order (QCO) is a legal government notification making BIS certification mandatory for specified products sold in India.'
    elif 'crs' in q or 'compulsory registration' in q:
        body = 'CRS (Compulsory Registration Scheme) requires manufacturers of certain electronic and IT products to register with BIS before selling them in India.'
    elif 'verify' in q or 'genuine' in q or 'check' in q:
        body = 'You can verify a product by checking its ISI mark or BIS licence number. Note the licence number (CM/L-XXXXXXXX) and verify through BIS or use our verification tool.'
    elif 'mandatory' in q or 'compulsory' in q or 'required' in q:
        body = 'BIS certification is mandatory for products under a Quality Control Order (QCO) — like electrical appliances, cement, toys, and packaged water. For others it is voluntary.'
    elif 'document' in q:
        body = 'Typical BIS certification documents: product specs, test reports, manufacturing details, business registration, and quality control procedures.'
    else:
        body = 'I can help with Indian Standards and BIS. Ask about applicable standards, certification requirements, product verification, or what BIS marks mean.'

    return {
        'response': body,
        'confidence': 'high',
        'sources': ['Bureau of Indian Standards'],
        'is_whitelist_valid': True,
    }
