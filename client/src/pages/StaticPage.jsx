import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, HelpCircle, Shield, Truck, RotateCcw, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const FAQS = [
  {
    q: 'How long will my order take to arrive?',
    a: 'Deliveries across major cities in Pakistan typically take 2-4 business days. Regional and distant areas take 4-6 business days.',
  },
  {
    q: 'Is Cash on Delivery (COD) available?',
    a: 'Yes, Cash on Delivery is available nationwide on all orders without any hidden surcharges.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'We offer a hassle-free 7-day return and exchange policy on all unworn items in original packaging with intact tags.',
  },
  {
    q: 'Are all products authentic and genuine?',
    a: 'Every timepiece, fragrance, jewelry piece, and apparel item curated at All Available is 100% authentic, brand-new, and quality certified.',
  },
  {
    q: 'How can I track my order?',
    a: 'Once your order is dispatched, you will receive tracking updates in your account order history dashboard under My Orders.',
  },
]

export default function StaticPage() {
  const location = useLocation()
  const path = location.pathname.replace('/', '')

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting]   = useState(false)

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      toast.success('Thank you for reaching out! Our team will respond within 24 hours.')
      setContactForm({ name: '', email: '', subject: '', message: '' })
      setSubmitting(false)
    }, 600)
  }

  // Render specific content depending on path
  const renderContent = () => {
    switch (path) {
      case 'contact':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-gold text-xs tracking-[0.3em] uppercase font-sans mb-3">Get in Touch</p>
              <h1 className="font-serif text-4xl font-bold text-white mb-6">We'd Love to Hear From You</h1>
              <p className="text-gray-mid text-sm font-sans leading-relaxed mb-8">
                Whether you have an inquiry about an order, custom sizing advice, or product authentication, our dedicated luxury concierge team is available to assist you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold font-sans uppercase tracking-wider mb-1">Flagship Studio</h3>
                    <p className="text-gray-mid text-sm font-sans">Gulberg III, MM Alam Road, Lahore, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold font-sans uppercase tracking-wider mb-1">Customer Care Line</h3>
                    <p className="text-gray-mid text-sm font-sans">+92 (300) 123-4567 / Mon - Sat (10am - 8pm PKT)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gold/30 flex items-center justify-center text-gold flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-white text-xs font-bold font-sans uppercase tracking-wider mb-1">Direct Inquiries</h3>
                    <p className="text-gray-mid text-sm font-sans">concierge@allavailable.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black-surface border border-white/5 p-8">
              <h2 className="font-serif text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="label-xs">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="label-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="label-xs">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="label-xs">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-luxury resize-none"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-gold w-full flex items-center justify-center gap-2">
                  <Send size={14} />
                  {submitting ? 'SENDING...' : 'SEND INQUIRY'}
                </button>
              </form>
            </div>
          </div>
        )

      case 'delivery':
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <Truck size={40} className="text-gold mx-auto mb-4" />
              <h1 className="font-serif text-4xl font-bold text-white mb-2">Delivery Information</h1>
              <p className="text-gray-mid text-sm font-sans">Reliable, insured doorstep delivery nationwide.</p>
            </div>

            <div className="bg-black-surface border border-white/5 p-8 space-y-6 text-sm font-sans text-gray-luxury leading-relaxed">
              <h2 className="text-white font-serif text-xl font-bold">Shipping Rates & Speed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gold/20 bg-gold/5">
                  <h3 className="font-bold text-gold text-base mb-1">Standard Delivery</h3>
                  <p className="text-white text-xs">Rs. 200 Flat Rate across Pakistan.</p>
                  <p className="text-gray-mid text-xs mt-1">2 to 4 business days.</p>
                </div>
                <div className="p-4 border border-gold/20 bg-gold/5">
                  <h3 className="font-bold text-gold text-base mb-1">Complimentary Shipping</h3>
                  <p className="text-white text-xs">FREE for orders exceeding Rs. 5,000.</p>
                  <p className="text-gray-mid text-xs mt-1">Automatically applied at checkout.</p>
                </div>
              </div>

              <h2 className="text-white font-serif text-xl font-bold pt-4">Tracking & Dispatch</h2>
              <p>
                Every order is carefully inspected, packed in signature All Available luxury packaging, and handed over to our premier courier partners. You will receive an SMS and email notification with your tracking number upon dispatch.
              </p>
            </div>
          </div>
        )

      case 'returns':
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <RotateCcw size={40} className="text-gold mx-auto mb-4" />
              <h1 className="font-serif text-4xl font-bold text-white mb-2">Return & Exchange Policy</h1>
              <p className="text-gray-mid text-sm font-sans">Your satisfaction is guaranteed.</p>
            </div>

            <div className="bg-black-surface border border-white/5 p-8 space-y-6 text-sm font-sans text-gray-luxury leading-relaxed">
              <h2 className="text-white font-serif text-xl font-bold">7-Day Complimentary Returns</h2>
              <p>
                If your purchase does not meet your expectations or sizing is incorrect, you may request an exchange or return within <strong>7 days</strong> of delivery.
              </p>
              <h2 className="text-white font-serif text-xl font-bold pt-2">Eligibility Criteria</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-mid">
                <li>Item must remain unworn, unwashed, and undamaged.</li>
                <li>All original brand tags, seals, and luxury boxes must remain intact.</li>
                <li>For hygiene reasons, intimate apparel, earrings, and unsealed fragrances are non-returnable unless defective.</li>
              </ul>
              <h2 className="text-white font-serif text-xl font-bold pt-2">How to Initiate a Return</h2>
              <p>
                Simply reach out to our Concierge team at <span className="text-gold">concierge@allavailable.com</span> with your Order ID, and our courier will arrange a reverse pickup from your address.
              </p>
            </div>
          </div>
        )

      case 'faqs':
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <HelpCircle size={40} className="text-gold mx-auto mb-4" />
              <h1 className="font-serif text-4xl font-bold text-white mb-2">Frequently Asked Questions</h1>
              <p className="text-gray-mid text-sm font-sans">Answers to common inquiries about orders, shipping, and products.</p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-black-surface border border-white/5 p-6 hover:border-gold/30 transition-all">
                  <h3 className="font-serif text-lg font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-mid text-sm font-sans leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'privacy':
      case 'terms':
      default:
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <Shield size={40} className="text-gold mx-auto mb-4" />
              <h1 className="font-serif text-4xl font-bold text-white mb-2">
                {path === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
              </h1>
              <p className="text-gray-mid text-sm font-sans">Legal transparency and commitment to user security.</p>
            </div>

            <div className="bg-black-surface border border-white/5 p-8 space-y-6 text-sm font-sans text-gray-luxury leading-relaxed">
              <h2 className="text-white font-serif text-xl font-bold">1. Introduction</h2>
              <p>
                Welcome to <strong>All Available</strong>. By accessing our platform, products, and services, you agree to comply with our Terms of Service and data protection standards.
              </p>
              <h2 className="text-white font-serif text-xl font-bold pt-2">2. Data Confidentiality</h2>
              <p>
                We value your privacy. Personal data including customer credentials, contact numbers, and delivery addresses are encrypted and never shared with third-party advertising brokers.
              </p>
              <h2 className="text-white font-serif text-xl font-bold pt-2">3. Intellectual Property</h2>
              <p>
                All brand identity assets, imagery, curated product narratives, and design aesthetics displayed on All Available are protected under copyright and intellectual property laws.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black-premium border-b border-white/5 py-10">
        <div className="container-luxury">
          <nav className="flex items-center gap-2 text-xs text-gray-mid font-sans">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <span className="text-white capitalize">{path.replace('-', ' ')}</span>
          </nav>
        </div>
      </div>

      <div className="container-luxury py-14">
        <motion.div
          key={path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}
