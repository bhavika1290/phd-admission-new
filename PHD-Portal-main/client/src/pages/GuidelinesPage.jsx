import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap, ChevronDown, ChevronUp, Mail, Phone, MapPin,
  Clock, CheckCircle, AlertCircle, FileText, Users, Calendar
} from 'lucide-react'

const FAQ_CATEGORIES = [
  {
    title: 'Eligibility',
    icon: CheckCircle,
    faqs: [
      {
        q: 'What is the minimum eligibility for PhD admission?',
        a: 'Candidates must have a valid GATE score or be eligible for CSIR/UGC JRF. For general category, a minimum of 60% aggregate in the qualifying examination is required. For SC/ST/OBC/PwD categories, the minimum is 55%.',
      },
      {
        q: 'Can I apply without a GATE score?',
        a: 'No, a valid GATE score is mandatory for PhD admission in the Mathematics Department. However, candidates with CSIR/UGC JRF are also eligible.',
      },
      {
        q: 'What is the validity period for GATE score?',
        a: 'Generally, GATE score is valid for 3 years from the year of appearance. However, candidates with scores expiring before the admission process are advised to check the current notification for specific validity requirements.',
      },
    ],
  },
  {
    title: 'Application Process',
    icon: FileText,
    faqs: [
      {
        q: 'How do I apply for PhD admission?',
        a: 'Create an account on the portal, fill in your personal and academic details, upload required documents, and submit your application before the deadline. You can save your application as a draft and complete it later.',
      },
      {
        q: 'Is there an application fee?',
        a: 'Yes, there is a non-refundable application fee of ₹500 for general/OBC candidates and ₹250 for SC/ST/PwD candidates. The fee can be paid online through the payment gateway.',
      },
      {
        q: 'Can I edit my application after submission?',
        a: 'Once submitted, you cannot edit your application. However, you can save your application as a draft and make changes before the final submission deadline.',
      },
    ],
  },
  {
    title: 'Selection Process',
    icon: Users,
    faqs: [
      {
        q: 'What is the selection process?',
        a: 'The selection process includes shortlisting based on GATE score and academic record, followed by an interview. The final selection is based on the combined performance in the interview and academic credentials.',
      },
      {
        q: 'When will the interview be conducted?',
        a: 'Interviews are typically conducted in May-June. The exact dates will be announced on the portal and sent via email to shortlisted candidates.',
      },
      {
        q: 'How many candidates are called for interview?',
        a: 'The number of candidates called for interview varies each year based on the number of applications and available seats. Generally, candidates with GATE score above the cutoff are called.',
      },
    ],
  },
  {
    title: 'Important Dates',
    icon: Calendar,
    faqs: [
      {
        q: 'When does the application process start?',
        a: 'The application process usually starts in January-February each year. Please check the announcements section for exact dates.',
      },
      {
        q: 'What is the last date to submit the application?',
        a: 'The last date to submit the application is usually in March. Late applications are not accepted under any circumstances.',
      },
      {
        q: 'When are the results announced?',
        a: 'The results are typically announced in June-July, after the interview process is completed.',
      },
    ],
  },
  {
    title: 'Fellowship & Stipend',
    icon: Clock,
    faqs: [
      {
        q: 'What is the stipend for PhD students?',
        a: 'Selected candidates receive a monthly stipend as per IIT Ropar norms. Currently, the stipend is ₹37,000 per month for the first 2 years (JRF) and ₹42,000 per month for the next 3 years (SRF), subject to satisfactory progress.',
      },
      {
        q: 'Do I need to apply separately for fellowship?',
        a: 'No, the fellowship is automatically provided to selected candidates based on their eligibility and performance in the interview.',
      },
      {
        q: 'Can I avail external fellowship?',
        a: 'Yes, students can avail external fellowships like CSIR, UGC, NBHM, etc., subject to approval from the institute.',
      },
    ],
  },
]

const ELIGIBILITY_CRITERIA = [
  {
    category: 'General / OBC',
    minScore: '60% aggregate or 6.5 CGPA',
    gateScore: 'Valid GATE score',
    notes: 'Must meet minimum eligibility in all qualifying exams',
  },
  {
    category: 'SC / ST',
    minScore: '55% aggregate or 6.0 CGPA',
    gateScore: 'Valid GATE score',
    notes: 'Relaxation as per government norms',
  },
  {
    category: 'PwD',
    minScore: '55% aggregate or 6.0 CGPA',
    gateScore: 'Valid GATE score',
    notes: '5% relaxation in eligibility criteria',
  },
]

export default function GuidelinesPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [openCategory, setOpenCategory] = useState(0)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Guidelines & FAQ</p>
              <p className="text-xs text-white/40">PhD Admissions</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary py-2 px-4 text-sm"
          >
            Apply Now
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="text-center animate-slide-up">
          <h1 className="text-4xl font-bold font-heading text-white">
            PhD Admission Guidelines
          </h1>
          <p className="text-white/50 mt-2">
            Everything you need to know about the admission process
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-6">Eligibility Criteria</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 text-white/70 font-semibold">Min. Score</th>
                  <th className="text-left py-3 px-4 text-white/70 font-semibold">GATE Requirement</th>
                  <th className="text-left py-3 px-4 text-white/70 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {ELIGIBILITY_CRITERIA.map((criteria, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{criteria.category}</td>
                    <td className="py-3 px-4 text-white/70">{criteria.minScore}</td>
                    <td className="py-3 px-4 text-white/70">{criteria.gateScore}</td>
                    <td className="py-3 px-4 text-white/50 text-sm">{criteria.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-6">Important Instructions</h2>
          
          <div className="space-y-4">
            {[
              'Candidates must fill all fields marked as mandatory in the application form.',
              'The application form must be submitted before the last date. No extension will be granted.',
              'Candidates must carry a valid ID proof and all original documents at the time of interview.',
              'Any false or incorrect information will lead to cancellation of application and admission.',
              'Candidates must check their email regularly for updates and announcements.',
              'The decision of the selection committee will be final and binding.',
            ].map((instruction, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/70">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {FAQ_CATEGORIES.map((category, catIndex) => {
              const CategoryIcon = category.icon
              const isOpen = openCategory === catIndex
              
              return (
                <div key={catIndex} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setOpenCategory(isOpen ? null : catIndex)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon size={20} className="text-primary-400" />
                      <span className="text-white font-semibold">{category.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={20} className="text-white/40" />
                    ) : (
                      <ChevronDown size={20} className="text-white/40" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="border-t border-white/10">
                      {category.faqs.map((faq, faqIndex) => {
                        const globalIndex = `${catIndex}-${faqIndex}`
                        const isFaqOpen = openFaq === globalIndex
                        
                        return (
                          <div key={faqIndex} className="border-b border-white/5 last:border-b-0">
                            <button
                              onClick={() => toggleFaq(globalIndex)}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                            >
                              <span className="text-white/80 pr-4">{faq.q}</span>
                              {isFaqOpen ? (
                                <ChevronUp size={16} className="text-white/40 flex-shrink-0" />
                              ) : (
                                <ChevronDown size={16} className="text-white/40 flex-shrink-0" />
                              )}
                            </button>
                            {isFaqOpen && (
                              <div className="px-4 pb-4">
                                <p className="text-white/50 pl-0">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-primary-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Email</p>
                <p className="text-white/50 text-sm">phdadmission@iitrpr.ac.in</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone size={20} className="text-primary-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Phone</p>
                <p className="text-white/50 text-sm">+91-1881-242345</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary-400 mt-0.5" />
              <div>
                <p className="text-white font-medium">Address</p>
                <p className="text-white/50 text-sm">
                  Department of Mathematics<br />
                  IIT Ropar, Punjab - 140001
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Disclaimer</p>
              <p className="text-white/60 text-sm mt-1">
                The information provided here is for general guidance. Candidates are advised to check the official IIT Ropar website and this portal for the most updated information. The institute reserves the right to modify the admission process without prior notice.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}