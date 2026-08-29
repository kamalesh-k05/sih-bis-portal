import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, AlertTriangle, MessageSquare, ExternalLink, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { BIS_EDUCATIONAL_CONTENT } from '../data/standards';
import { useAppStore } from '../store/appStore';
import Seo, { SITE_URL, SITE_NAME } from '../components/Seo';

export default function HelpPage() {
  const location = useLocation();
  const { toggleAssistant } = useAppStore();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(
    location.hash ? location.hash.slice(1) : null
  );

  const faqs = [
    {
      id: 'what-is-bis',
      question: 'What is BIS?',
      answer: 'BIS (Bureau of Indian Standards) is India\'s national standards body. It develops and publishes Indian Standards (IS codes) for products, processes, and services. BIS also certifies products through various schemes to ensure they meet quality and safety requirements.',
    },
    {
      id: 'is-certification-mandatory',
      question: 'Is BIS certification mandatory for all products?',
      answer: 'No. BIS certification is mandatory only for products covered under a Quality Control Order (QCO). Many products like electrical appliances, cement, steel, toys, and packaged drinking water require mandatory certification. For other products, certification is voluntary but can enhance market trust.',
    },
    {
      id: 'how-to-verify',
      question: 'How can I verify if a product has genuine BIS certification?',
      answer: 'You can verify by: (1) Checking for the ISI mark or BIS Standard Mark on the product. (2) Noting the licence number near the mark. (3) Using the BIS Care app or BIS website to verify the licence. (4) Using our Verify Product tool for quick checking.',
    },
    {
      id: 'how-long',
      question: 'How long does BIS certification take?',
      answer: 'The timeline varies by product category. Simple products may take 4-8 weeks, while complex products may take 3-6 months. The process includes product testing, documentation, application submission, and facility inspection.',
    },
    {
      id: 'cost',
      question: 'What are the costs involved in BIS certification?',
      answer: 'Costs include: testing fees at BIS-recognized labs, application fees, annual minimum marking fees, and costs for any facility modifications needed. The exact amounts vary by product category. Visit bis.gov.in for current fee schedules.',
    },
    {
      id: 'foreign-manufacturers',
      question: 'Can foreign manufacturers get BIS certification?',
      answer: 'Yes. Foreign manufacturers can apply for BIS certification. They need to appoint an authorized Indian representative and follow the same testing and certification process. Additional documentation may be required.',
    },
  ];

  return (
    <div className="min-h-screen">
      <Seo
        title="Help & Learning Center | BIS Smart Portal"
        description="FAQ and guides about Indian Standards, BIS certification, how to verify products, costs, and timelines — from the BIS Smart Portal learning center."
        path="/help"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Help & Learning Center',
            url: `${SITE_URL}/help`,
            description:
              'Everything you need to know about Indian Standards and BIS: FAQs, guides on BIS marks, and certification help.',
            inLanguage: 'en',
            isPartOf: {
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'Help', item: `${SITE_URL}/help` },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Help', item: `${SITE_URL}/help` },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="hover:text-saffron-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-saffron-400 font-medium">Help</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-50 mb-2">Help & Learning Center</h1>
        <p className="text-slate-300 mb-8">Everything you need to know about Indian Standards and BIS.</p>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link to="/consumer" className="card p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-saffron-500/100/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-saffron-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-50">Verify a Product</h3>
              <p className="text-xs text-slate-400">Check if your product has genuine BIS certification</p>
            </div>
          </Link>
          <button onClick={toggleAssistant} className="card p-5 flex items-center gap-4 hover:shadow-md transition-all text-left">
            <div className="w-12 h-12 bg-saffron-500/100/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-saffron-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-50">Ask the BIS Assistant</h3>
              <p className="text-xs text-slate-400">Get instant answers to your questions</p>
            </div>
          </button>
        </div>

        {/* Learn about marks */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-slate-50 mb-4">Understanding BIS Marks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BIS_EDUCATIONAL_CONTENT.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="card p-5 scroll-mt-20"
              >
                <div className="w-12 h-12 mb-4 bg-saffron-500/100/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-saffron-400" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-50 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{item.detailed}</p>
                <div className="bg-saffron-500/100/10 rounded-lg px-3 py-2">
                  <p className="text-xs text-saffron-400"><strong>Where to find:</strong> {item.whereToFind}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-slate-50 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div key={faq.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <span className="font-semibold text-sm text-slate-50">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-5 pb-4 border-t border-white/10">
                    <p className="text-sm text-slate-300 leading-relaxed mt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Complaint section */}
        <section className="card-elevated p-6 sm:p-8">
          <h2 className="font-display font-bold text-xl text-slate-50 mb-3">Report a Problem</h2>
          <p className="text-sm text-slate-300 mb-4">
            Found a quality issue, fake BIS mark, or safety concern? Here's how to report it.
          </p>
          
          <div className="space-y-3 mb-6">
            {[
              { label: 'Product quality issue', desc: 'Report products that don\'t meet expected quality standards' },
              { label: 'Fake or misleading BIS mark', desc: 'Report products with counterfeit BIS/ISI marks' },
              { label: 'Product safety concern', desc: 'Report products that may pose safety risks' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.04] rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-50">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="https://bis.gov.in" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2">
              File Complaint on BIS Portal
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={toggleAssistant} className="btn-secondary flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask Assistant for Help
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
