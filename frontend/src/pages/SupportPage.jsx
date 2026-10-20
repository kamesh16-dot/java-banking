import { LifeBuoy, MessageSquare, Phone, Mail, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const faqs = [
  { q: 'How do I transfer money to another account?', a: 'Go to Transfers in the sidebar, enter the destination account number, amount, and confirm. The transfer is instant.' },
  { q: 'What is the minimum balance?', a: 'Savings accounts require ₹500 minimum. Current accounts require ₹1,000 minimum. Withdrawals that would breach the minimum are blocked.' },
  { q: 'How do I download my statement?', a: 'Visit Transaction History, apply any filters you need, then click "Export CSV" to download your transactions.' },
  { q: 'My account is frozen, what do I do?', a: 'Contact support at support@nexabank.demo. An administrator can unfreeze your account.' },
  { q: 'Is this a real bank?', a: 'No — NexaBank is a demo application for educational purposes only. No real money is involved.' },
]

function FAQItem({ q, a, delay }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <span className="font-semibold text-gray-900 dark:text-white text-sm">{q}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
          className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
          {a}
        </motion.div>
      )}
    </motion.div>
  )
}

const channels = [
  { icon: MessageSquare, label: 'Live Chat', sub: 'Available 24/7', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  { icon: Phone,         label: 'Phone',     sub: '+1 800 NEXABANK', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Mail,          label: 'Email',     sub: 'support@nexabank.demo', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
]

export default function SupportPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">We're here to help, 24 hours a day.</p>
      </div>

      {/* Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {channels.map(({ icon: Icon, label, sub, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card card-hover cursor-pointer text-center">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
              <Icon size={26} className={color} />
            </div>
            <p className="font-bold text-gray-900 dark:text-white">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LifeBuoy size={20} className="text-primary-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} {...faq} delay={i * 0.05} />)}
        </div>
      </div>

      {/* Contact Form */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Send us a Message</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <input type="text" placeholder="Account issue" className="input" />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea rows={4} placeholder="Describe your issue..." className="input resize-none" />
          </div>
          <button className="btn-primary">Send Message</button>
        </div>
      </div>
    </div>
  )
}
