import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User, Calendar, BookOpen, Award, CheckSquare,
  Save, LogOut, GraduationCap, Loader2, RefreshCw,
  Flag, Heart, Microscope, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { submitApplication, getMyApplication } from '../services/api'
import FormSection, { FieldWrapper } from '../components/FormSection'

const CATEGORIES     = ['GEN', 'OBC', 'SC', 'ST']
const STUDY_TYPES    = ['Regular', 'Part-time']
const DIVISIONS      = ['First', 'Second', 'Third', 'Distinction']
const EDU_LEVELS     = ['10th', '12th', 'Graduation', 'Post Graduation']
const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed']
const CSIR_DURATIONS = ['JRF', 'SRF']
const SCORE_TYPES    = ['percentage', 'cgpa']

const blankEdu = (level) => ({
  level, discipline: '', institute: '', study_type: 'Regular',
  year: '', score_type: 'percentage', score_value: '', division: 'First',
})

const blankGate = () => ({
  exam_type: 'GATE', branch: '', year: '', valid_upto: '',
  percentile: '', score: '', air: '',
})

const blankCsir = () => ({
  exam_type: 'CSIR', branch: '', year: '', valid_upto: '',
  percentile: '', score: '', duration: 'JRF',
})

const defaultForm = () => ({
  name: '', email: '', dob: '', category: 'GEN',
  marital_status: 'Single', nationality: 'Indian',
  research_area: '', address: '', phone: '',
  nbhm_eligible: false,
  education: EDU_LEVELS.map(blankEdu),
  gate: blankGate(),
  csir: blankCsir(),
  has_gate: false,
  has_csir: false,
})

export default function ApplicationForm() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState(defaultForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [isEdit, setIsEdit]   = useState(false)

  // Load existing application
  useEffect(() => {
    getMyApplication()
      .then(res => {
        if (res.data?.application) {
          const app = res.data.application
          setIsEdit(true)

          const gate = app.exam_scores?.find(e => e.exam_type === 'GATE')
          const csir = app.exam_scores?.find(e => e.exam_type === 'CSIR')

          setForm({
            name:           app.name || '',
            email:          app.email || '',
            dob:            app.dob  || '',
            category:       app.category || 'GEN',
            marital_status: app.marital_status || 'Single',
            nationality:    app.nationality || 'Indian',
            research_area:  app.research_area || '',
            address:        app.address  || '',
            phone:          app.phone    || '',
            nbhm_eligible:  app.nbhm_eligible ?? false,
            education: EDU_LEVELS.map(level => {
              const found = app.education?.find(e => e.level === level)
              return found ? { ...blankEdu(level), ...found } : blankEdu(level)
            }),
            gate:     gate ? { ...blankGate(), ...gate, air: gate.air ?? '' } : blankGate(),
            csir:     csir ? { ...blankCsir(), ...csir } : blankCsir(),
            has_gate: !!gate,
            has_csir: !!csir,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setField     = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setEdu       = (idx, key, val) => setForm(f => {
    const ed = [...f.education]; ed[idx] = { ...ed[idx], [key]: val }; return { ...f, education: ed }
  })
  const setGateField = (key, val) => setForm(f => ({ ...f, gate: { ...f.gate, [key]: val } }))
  const setCsirField = (key, val) => setForm(f => ({ ...f, csir: { ...f.csir, [key]: val } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required.')
    if (!form.dob)         return toast.error('Date of birth is required.')
    if (!form.has_gate && !form.has_csir)
      return toast.error('At least one qualifying exam (GATE or CSIR) is required.')

    const exam_scores = []
    if (form.has_gate) exam_scores.push({ ...form.gate })
    if (form.has_csir) exam_scores.push({ ...form.csir })

    setSaving(true)
    try {
      await submitApplication({
        name:           form.name,
        email:          form.email,
        dob:            form.dob,
        category:       form.category,
        marital_status: form.marital_status,
        nationality:    form.nationality,
        research_area:  form.research_area,
        address:        form.address,
        phone:          form.phone,
        nbhm_eligible:  form.nbhm_eligible,
        education:      form.education,
        exam_scores,
      })
      toast.success(isEdit ? 'Application updated!' : 'Application submitted!')
      setIsEdit(true)
    } catch (err) {
      const detail = err.response?.data
      if (detail?.formErrors?.length) {
        toast.error(detail.formErrors[0])
      } else {
        toast.error(detail?.error || 'Something went wrong.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-3" />
          <p className="text-white/40">Loading your application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">PhD Application</p>
              <p className="text-xs text-white/40">Mathematics Department · IIT Ropar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40 hidden sm:block">{user?.email}</span>
            <button id="btn-signout" onClick={handleSignOut} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold font-heading text-white">
              {isEdit ? 'Edit Your Application' : 'PhD Application Form'}
            </h1>
            {isEdit && (
              <span className="badge bg-success-500/20 text-success-500 border border-success-500/30">
                Submitted
              </span>
            )}
          </div>
          <p className="text-white/50">
            {isEdit ? 'Your application has been submitted. You can update it below.' : 'Complete all sections and submit your application.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── 1. Personal Details ── */}
          <FormSection icon={User} title="Personal Details" subtitle="Your basic information">
            <FieldWrapper label="Full Name" required>
              <input id="field-name" type="text" value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="As per official records" className="form-input" required />
            </FieldWrapper>

            <FieldWrapper label="Email Address">
              <input id="field-email" type="email" value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="your@email.com" className="form-input" />
            </FieldWrapper>

            <FieldWrapper label="Date of Birth" required>
              <input id="field-dob" type="date" value={form.dob}
                onChange={e => setField('dob', e.target.value)}
                className="form-input" required />
            </FieldWrapper>

            <FieldWrapper label="Category" required>
              <select id="field-category" value={form.category}
                onChange={e => setField('category', e.target.value)}
                className="form-input appearance-none">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-800">{c}</option>)}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Marital Status">
              <select id="field-marital" value={form.marital_status}
                onChange={e => setField('marital_status', e.target.value)}
                className="form-input appearance-none">
                {MARITAL_STATUS.map(m => <option key={m} value={m} className="bg-dark-800">{m}</option>)}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Nationality">
              <input id="field-nationality" type="text" value={form.nationality}
                onChange={e => setField('nationality', e.target.value)}
                placeholder="e.g. Indian" className="form-input" />
            </FieldWrapper>

            <FieldWrapper label="Phone Number">
              <input id="field-phone" type="tel" value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX" className="form-input" />
            </FieldWrapper>

            <FieldWrapper label="Address" className="md:col-span-2">
              <textarea id="field-address" rows={3} value={form.address}
                onChange={e => setField('address', e.target.value)}
                placeholder="Permanent address" className="form-input resize-none" />
            </FieldWrapper>

            <FieldWrapper label="Research Area of Interest" className="md:col-span-2">
              <input id="field-research" type="text" value={form.research_area}
                onChange={e => setField('research_area', e.target.value)}
                placeholder="e.g. Algebraic Topology, Number Theory, Differential Equations"
                className="form-input" />
            </FieldWrapper>
          </FormSection>

          {/* ── 2. Education Details ── */}
          {form.education.map((edu, idx) => (
            <FormSection key={edu.level} icon={BookOpen}
              title={`${edu.level} Education`} subtitle="Academic qualification details">
              <FieldWrapper label="Discipline / Stream">
                <input id={`edu-${idx}-discipline`} type="text" value={edu.discipline}
                  onChange={e => setEdu(idx, 'discipline', e.target.value)}
                  placeholder="e.g. Mathematics, Science" className="form-input" />
              </FieldWrapper>

              <FieldWrapper label="Institute / School / University">
                <input id={`edu-${idx}-institute`} type="text" value={edu.institute}
                  onChange={e => setEdu(idx, 'institute', e.target.value)}
                  placeholder="Name of institution" className="form-input" />
              </FieldWrapper>

              <FieldWrapper label="Study Type">
                <select id={`edu-${idx}-type`} value={edu.study_type}
                  onChange={e => setEdu(idx, 'study_type', e.target.value)}
                  className="form-input appearance-none">
                  {STUDY_TYPES.map(t => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
                </select>
              </FieldWrapper>

              <FieldWrapper label="Year of Passing">
                <input id={`edu-${idx}-year`} type="number" min="1950" max={new Date().getFullYear()}
                  value={edu.year} onChange={e => setEdu(idx, 'year', e.target.value)}
                  placeholder="e.g. 2020" className="form-input" />
              </FieldWrapper>

              {/* Score Type Toggle + Value */}
              <FieldWrapper label="Score">
                <div className="flex gap-2">
                  {/* Toggle buttons */}
                  <div className="flex rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                    {SCORE_TYPES.map(st => (
                      <button key={st} type="button"
                        onClick={() => setEdu(idx, 'score_type', st)}
                        className={`px-3 py-2 text-xs font-semibold uppercase transition-all ${
                          edu.score_type === st
                            ? 'bg-primary-600 text-white'
                            : 'bg-white/5 text-white/40 hover:text-white/70'
                        }`}>
                        {st === 'percentage' ? '%' : 'CGPA'}
                      </button>
                    ))}
                  </div>
                  <input id={`edu-${idx}-score`} type="number" step="0.01" min="0"
                    max={edu.score_type === 'cgpa' ? 10 : 100}
                    value={edu.score_value}
                    onChange={e => setEdu(idx, 'score_value', e.target.value)}
                    placeholder={edu.score_type === 'cgpa' ? '0 – 10' : '0 – 100'}
                    className="form-input flex-1" />
                </div>
              </FieldWrapper>

              <FieldWrapper label="Division">
                <select id={`edu-${idx}-div`} value={edu.division}
                  onChange={e => setEdu(idx, 'division', e.target.value)}
                  className="form-input appearance-none">
                  {DIVISIONS.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
                </select>
              </FieldWrapper>
            </FormSection>
          ))}

          {/* ── 3. Qualifying Exams ── */}
          <FormSection icon={Award} title="Qualifying Examinations"
            subtitle="At least one of GATE or CSIR-NET is required">

            {/* GATE Toggle Header */}
            <div className="md:col-span-2">
              <button type="button"
                onClick={() => setField('has_gate', !form.has_gate)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  form.has_gate
                    ? 'bg-primary-600/15 border-primary-500/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    form.has_gate ? 'bg-primary-600 border-primary-600' : 'border-white/30'
                  }`}>
                    {form.has_gate && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>}
                  </div>
                  <span className="font-semibold text-white">GATE Score</span>
                  <span className="text-xs text-white/40">Graduate Aptitude Test in Engineering</span>
                </div>
                <ChevronDown size={16} className={`text-white/40 transition-transform ${form.has_gate ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {form.has_gate && (
              <>
                <FieldWrapper label="Branch / Subject">
                  <input id="gate-branch" type="text" value={form.gate.branch}
                    onChange={e => setGateField('branch', e.target.value)}
                    placeholder="e.g. Mathematics (MA)" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Year of Exam">
                  <input id="gate-year" type="number" min="2000" max={new Date().getFullYear()}
                    value={form.gate.year} onChange={e => setGateField('year', e.target.value)}
                    placeholder="e.g. 2023" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Valid Upto">
                  <input id="gate-valid" type="text" value={form.gate.valid_upto}
                    onChange={e => setGateField('valid_upto', e.target.value)}
                    placeholder="e.g. March 2026" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Percentile">
                  <input id="gate-percentile" type="number" step="0.01" min="0" max="100"
                    value={form.gate.percentile} onChange={e => setGateField('percentile', e.target.value)}
                    placeholder="e.g. 98.5" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Score" required>
                  <input id="gate-score" type="number" step="0.01" min="0"
                    value={form.gate.score} onChange={e => setGateField('score', e.target.value)}
                    placeholder="GATE score out of 100" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="All India Rank (AIR)">
                  <input id="gate-air" type="number" min="1"
                    value={form.gate.air} onChange={e => setGateField('air', e.target.value)}
                    placeholder="e.g. 250" className="form-input" />
                </FieldWrapper>
              </>
            )}

            {/* CSIR Toggle Header */}
            <div className="md:col-span-2">
              <button type="button"
                onClick={() => setField('has_csir', !form.has_csir)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  form.has_csir
                    ? 'bg-accent-500/15 border-accent-500/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    form.has_csir ? 'bg-accent-500 border-accent-500' : 'border-white/30'
                  }`}>
                    {form.has_csir && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>}
                  </div>
                  <span className="font-semibold text-white">CSIR-NET Score</span>
                  <span className="text-xs text-white/40">Council of Scientific &amp; Industrial Research</span>
                </div>
                <ChevronDown size={16} className={`text-white/40 transition-transform ${form.has_csir ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {form.has_csir && (
              <>
                <FieldWrapper label="Branch / Subject">
                  <input id="csir-branch" type="text" value={form.csir.branch}
                    onChange={e => setCsirField('branch', e.target.value)}
                    placeholder="e.g. Mathematical Sciences" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Year of Exam">
                  <input id="csir-year" type="number" min="2000" max={new Date().getFullYear()}
                    value={form.csir.year} onChange={e => setCsirField('year', e.target.value)}
                    placeholder="e.g. 2023" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Valid Upto">
                  <input id="csir-valid" type="text" value={form.csir.valid_upto}
                    onChange={e => setCsirField('valid_upto', e.target.value)}
                    placeholder="e.g. June 2026" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Percentile">
                  <input id="csir-percentile" type="number" step="0.01" min="0" max="100"
                    value={form.csir.percentile} onChange={e => setCsirField('percentile', e.target.value)}
                    placeholder="e.g. 95.0" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Score" required>
                  <input id="csir-score" type="number" step="0.01" min="0"
                    value={form.csir.score} onChange={e => setCsirField('score', e.target.value)}
                    placeholder="CSIR NET score" className="form-input" />
                </FieldWrapper>
                <FieldWrapper label="Duration / Fellowship">
                  <select id="csir-duration" value={form.csir.duration}
                    onChange={e => setCsirField('duration', e.target.value)}
                    className="form-input appearance-none">
                    {CSIR_DURATIONS.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
                  </select>
                </FieldWrapper>
              </>
            )}

            {!form.has_gate && !form.has_csir && (
              <div className="md:col-span-2">
                <p className="text-amber-400/80 text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                  ⚠️ At least one qualifying exam (GATE or CSIR-NET) is required to submit the application.
                </p>
              </div>
            )}
          </FormSection>

          {/* ── 4. NBHM Eligibility ── */}
          <FormSection icon={CheckSquare} title="NBHM Eligibility" subtitle="National Board for Higher Mathematics">
            <div className="md:col-span-2">
              <label htmlFor="field-nbhm"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-primary-500/50 transition-all">
                <div className="relative">
                  <input id="field-nbhm" type="checkbox"
                    checked={form.nbhm_eligible}
                    onChange={e => setField('nbhm_eligible', e.target.checked)}
                    className="sr-only" />
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    form.nbhm_eligible ? 'bg-primary-600 border-primary-600' : 'border-white/30 bg-white/5'
                  }`}>
                    {form.nbhm_eligible && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white font-medium">I am eligible for NBHM</p>
                  <p className="text-white/40 text-sm mt-0.5">National Board for Higher Mathematics scholarship eligibility</p>
                </div>
              </label>
            </div>
          </FormSection>

          {/* ── Submit Button ── */}
          <div className="flex justify-end gap-4 pt-2 pb-8">
            <button id="btn-submit-application" type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 px-8">
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : isEdit ? (
                <><RefreshCw size={16} /> Update Application</>
              ) : (
                <><Save size={16} /> Submit Application</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
