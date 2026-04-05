import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User, BookOpen, Award, CheckSquare,
  Save, LogOut, GraduationCap, Loader2, RefreshCw,
  Plus, Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { submitApplication, getMyApplication } from '../services/api'
import FormSection, { FieldWrapper } from '../components/FormSection'
import {
  BOARD_OPTIONS,
  CATEGORY_OPTIONS,
  DEGREE_OPTIONS,
  DIVISION_OPTIONS,
  EXAM_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RESEARCH_OPTIONS,
  STUDY_MODE_OPTIONS,
} from '../constants/applicationOptions'

const SCHOOL_LEVELS = ['10th', '12th']

const blankEducation = (level) => ({
  level,
  board: '',
  degree_name: '',
  custom_degree_name: '',
  cfti_status: '',
  discipline: '',
  institute: '',
  study_type: 'Regular',
  year_of_passing: '',
  score_type: 'percentage',
  score_value: '',
  division: 'First',
})

const blankExam = () => ({
  exam_name: 'GATE',
  custom_exam_name: '',
  branch: '',
  year: '',
  valid_upto: '',
  score: '',
  percentile: '',
  rank: '',
  air: '',
})

const buildDefaultForm = () => ({
  first_name: '',
  last_name: '',
  gender: 'Male',
  email: '',
  dob: '',
  category: 'GEN',
  marital_status: 'Single',
  nationality: 'Indian',
  study_mode: 'Regular',
  address: '',
  phone: '',
  research_pref_1: '',
  research_pref_1_custom: '',
  research_pref_2: '',
  research_pref_2_custom: '',
  education: {
    '10th': blankEducation('10th'),
    '12th': blankEducation('12th'),
  },
  graduation: [blankEducation('Graduation')],
  postGraduation: [blankEducation('Post Graduation')],
  examDetails: [],
  declaration_accepted: false,
  nbhm_eligible: false,
})

function combineChoice(choice, customValue) {
  if (!choice) return ''
  if (choice === 'Other') return customValue.trim()
  return choice
}

function normalizeEducationRow(row) {
  return {
    ...blankEducation(row.level),
    ...row,
    board: row.board || '',
    degree_name: row.degree_name || '',
    custom_degree_name: row.custom_degree_name || '',
    cfti_status: row.cfti_status || '',
    discipline: row.discipline || '',
    institute: row.institute || '',
    study_type: row.study_type || 'Regular',
    year_of_passing: row.year_of_passing ?? row.year ?? '',
    score_type: row.score_type || 'percentage',
    score_value: row.score_value ?? '',
    division: row.division || 'First',
  }
}

function normalizeExamRow(row) {
  return {
    ...blankExam(),
    ...row,
    exam_name: row.exam_name || row.exam_type || 'GATE',
    custom_exam_name: row.custom_exam_name || '',
    branch: row.branch || '',
    year: row.year ?? '',
    valid_upto: row.valid_upto || '',
    score: row.score ?? '',
    percentile: row.percentile ?? '',
    rank: row.rank ?? '',
    air: row.air ?? '',
  }
}

function flattenEducationErrors(errors) {
  return Object.entries(errors || {}).reduce((acc, [key, value]) => {
    if (Array.isArray(value) && value.length) {
      acc[key] = value[0]
    }
    return acc
  }, {})
}

function getThreshold(category) {
  return category === 'GEN' ? 60 : 55
}

function isBlankEducationRow(row) {
  return !String(row.board || '').trim()
    && !String(row.degree_name || '').trim()
    && !String(row.custom_degree_name || '').trim()
    && !String(row.cfti_status || '').trim()
    && !String(row.discipline || '').trim()
    && !String(row.institute || '').trim()
    && !String(row.year_of_passing || '').trim()
    && !String(row.score_value || '').trim()
}

function isBlankExamRow(row) {
  return !String(row.exam_name || '').trim()
    && !String(row.custom_exam_name || '').trim()
    && !String(row.branch || '').trim()
    && !String(row.year || '').trim()
    && !String(row.valid_upto || '').trim()
    && !String(row.score || '').trim()
    && !String(row.percentile || '').trim()
    && !String(row.air || '').trim()
}

export default function ApplicationForm() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const paymentUrl = import.meta.env.VITE_SBI_COLLECT_URL || 'https://www.onlinesbi.sbi/sbicollect/'
  const [form, setForm] = useState(buildDefaultForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const threshold = useMemo(() => getThreshold(form.category), [form.category])

  useEffect(() => {
    getMyApplication()
      .then((res) => {
        if (!res.data?.application) return

        const app = res.data.application
        const educationRows = app.education || []
        const examRows = app.exam_scores || []
        const graduationRows = educationRows.filter((row) => row.level === 'Graduation')
        const postGradRows = educationRows.filter((row) => row.level === 'Post Graduation')
        const firstPostGrad = postGradRows[0] || blankEducation('Post Graduation')

        setIsEdit(true)
        setForm({
          first_name: app.first_name || app.name?.split(' ')?.[0] || '',
          last_name: app.last_name || app.name?.split(' ')?.slice(1).join(' ') || '',
          gender: app.gender || 'Male',
          email: app.email || '',
          dob: app.dob ? String(app.dob).slice(0, 10) : '',
          category: app.category || 'GEN',
          marital_status: app.marital_status || 'Single',
          nationality: app.nationality || 'Indian',
          study_mode: app.study_mode || 'Regular',
          address: app.address || '',
          phone: app.phone || '',
          research_pref_1: app.research_pref_1 || app.research_area || '',
          research_pref_1_custom: '',
          research_pref_2: app.research_pref_2 || '',
          research_pref_2_custom: '',
          education: {
            '10th': normalizeEducationRow(educationRows.find((row) => row.level === '10th') || blankEducation('10th')),
            '12th': normalizeEducationRow(educationRows.find((row) => row.level === '12th') || blankEducation('12th')),
          },
          graduation: graduationRows.length ? graduationRows.map((row) => normalizeEducationRow(row)) : [blankEducation('Graduation')],
          postGraduation: postGradRows.length ? postGradRows.map((row) => normalizeEducationRow(row)) : [normalizeEducationRow(firstPostGrad)],
          examDetails: examRows.length ? examRows.map((row) => normalizeExamRow(row)) : [],
          declaration_accepted: !!app.declaration_accepted,
          nbhm_eligible: app.nbhm_eligible ?? false,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const setEducationField = (level, key, value) => {
    setForm((current) => ({
      ...current,
      education: {
        ...current.education,
        [level]: { ...current.education[level], [key]: value },
      },
    }))
  }

  const setPostGradField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      postGraduation: current.postGraduation.map((row, rowIndex) => (
        rowIndex === index ? { ...row, [key]: value } : row
      )),
    }))
  }

  const setGraduationField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      graduation: current.graduation.map((row, rowIndex) => (
        rowIndex === index ? { ...row, [key]: value } : row
      )),
    }))
  }

  const addGraduation = () => setForm((current) => ({
    ...current,
    graduation: [...current.graduation, blankEducation('Graduation')],
  }))

  const removeGraduation = (index) => {
    setForm((current) => ({
      ...current,
      graduation: current.graduation.length > 1
        ? current.graduation.filter((_, rowIndex) => rowIndex !== index)
        : current.graduation,
    }))
  }

  const addPostGrad = () => setForm((current) => ({
    ...current,
    postGraduation: [...current.postGraduation, blankEducation('Post Graduation')],
  }))

  const removePostGrad = (index) => {
    setForm((current) => ({
      ...current,
      postGraduation: current.postGraduation.length > 1
        ? current.postGraduation.filter((_, rowIndex) => rowIndex !== index)
        : current.postGraduation,
    }))
  }

  const setExamField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      examDetails: current.examDetails.map((row, rowIndex) => (
        rowIndex === index ? { ...row, [key]: value } : row
      )),
    }))
  }

  const addExam = () => setForm((current) => ({
    ...current,
    examDetails: [...current.examDetails, blankExam()],
  }))

  const removeExam = (index) => {
    setForm((current) => ({
      ...current,
      examDetails: current.examDetails.length > 1
        ? current.examDetails.filter((_, rowIndex) => rowIndex !== index)
        : current.examDetails,
    }))
  }

  const validate = () => {
    const nextErrors = {}
    const addError = (path, message) => {
      if (!nextErrors[path]) nextErrors[path] = message
    }

    const graduationRows = form.graduation.filter((row) => !isBlankEducationRow(row))
    const postGraduationRows = form.postGraduation.filter((row) => !isBlankEducationRow(row))
    const examRows = form.examDetails.filter((row) => !isBlankExamRow(row))

    if (!form.first_name.trim()) addError('first_name', 'First name is required.')
    if (!form.last_name.trim()) addError('last_name', 'Last name is required.')
    if (!form.gender.trim()) addError('gender', 'Gender is required.')
    if (!form.dob) addError('dob', 'Date of birth is required.')
    if (!form.research_pref_1.trim()) addError('research_pref_1', 'First research preference is required.')

    const tenth = form.education['10th']
    const twelfth = form.education['12th']
    if (!tenth.board.trim()) addError('education.10th.board', 'Board is required.')
    if (!tenth.year_of_passing) addError('education.10th.year_of_passing', 'Year of passing is required.')

    if (!twelfth.board.trim()) addError('education.12th.board', 'Board is required.')
    if (!twelfth.year_of_passing) addError('education.12th.year_of_passing', 'Year of passing is required.')
    if (!twelfth.score_value) addError('education.12th.score_value', `12th must be at least ${threshold}%.`)

    graduationRows.forEach((row, index) => {
      if (!row.degree_name.trim()) addError(`graduation.${index}.degree_name`, 'Degree is required.')
      if (row.degree_name === 'Other' && !row.custom_degree_name.trim()) {
        addError(`graduation.${index}.custom_degree_name`, 'Custom degree name is required.')
      }
      if (!row.institute.trim()) addError(`graduation.${index}.institute`, 'College / University is required.')
      if (!row.year_of_passing) addError(`graduation.${index}.year_of_passing`, 'Year of passing is required.')
      if (!row.score_value) addError(`graduation.${index}.score_value`, `Graduation must be at least ${threshold}%.`)
    })

    postGraduationRows.forEach((row, index) => {
      if (!row.degree_name.trim()) addError(`postGraduation.${index}.degree_name`, 'Degree is required.')
      if (row.degree_name === 'Other' && !row.custom_degree_name.trim()) {
        addError(`postGraduation.${index}.custom_degree_name`, 'Custom degree name is required.')
      }
      if (row.degree_name === 'MSc' && !row.cfti_status) {
        addError(`postGraduation.${index}.cfti_status`, 'Select CFTI or Non-CFTI for MSc.')
      }
      if (!row.institute.trim()) addError(`postGraduation.${index}.institute`, 'Institute is required.')
      if (!row.year_of_passing) addError(`postGraduation.${index}.year_of_passing`, 'Year of passing is required.')
      if (!row.score_value && row.division !== 'First' && row.division !== 'Distinction') {
        addError(`postGraduation.${index}.score_value`, `Post Graduation must be at least ${threshold}% or First Class.`)
      }
    })

    examRows.forEach((row, index) => {
      if (!row.exam_name.trim()) addError(`examDetails.${index}.exam_name`, 'Exam name is required.')
      if (row.exam_name === 'Any Other' && !row.custom_exam_name.trim()) {
        addError(`examDetails.${index}.custom_exam_name`, 'Custom exam name is required.')
      }
      if (row.score === '' || row.score === null || row.score === undefined) {
        addError(`examDetails.${index}.score`, 'Score is required.')
      }
      if (row.air === '' || row.air === null || row.air === undefined) {
        addError(`examDetails.${index}.air`, 'All India Rank is required.')
      }
      if (row.percentile === '' || row.percentile === null || row.percentile === undefined) {
        addError(`examDetails.${index}.percentile`, 'Percentile is required.')
      }
    })

    if (examRows.length === 0) {
      addError('examDetails', 'Please add at least one exam.')
    }

    if (!form.declaration_accepted) {
      addError('declaration_accepted', 'You must accept the declaration before submission.')
    }

    console.log('Validation errors:', nextErrors)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const buildPayload = () => {
    const education = [
      form.education['10th'],
      form.education['12th'],
      ...form.graduation.filter((row) => !isBlankEducationRow(row)),
      ...form.postGraduation.filter((row) => !isBlankEducationRow(row)),
    ].map((row) => ({
      ...row,
      year_of_passing: row.year_of_passing || row.year || '',
    }))

    const exam_details = form.examDetails
      .filter((row) => !isBlankExamRow(row))
      .map((row) => ({
      ...row,
      exam_name: row.exam_name,
      custom_exam_name: row.exam_name === 'Any Other' ? row.custom_exam_name : '',
      score: row.score === '' ? null : row.score,
      percentile: row.percentile === '' ? null : row.percentile,
      rank: null,
      air: row.air === '' ? null : row.air,
    }))
    return {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      gender: form.gender,
      email: form.email.trim() || null,
      dob: form.dob,
      category: form.category,
      marital_status: form.marital_status,
      nationality: form.nationality,
      study_mode: form.study_mode,
      address: form.address,
      phone: form.phone,
      research_pref_1: combineChoice(form.research_pref_1, form.research_pref_1_custom),
      research_pref_2: combineChoice(form.research_pref_2, form.research_pref_2_custom),
      research_area: combineChoice(form.research_pref_1, form.research_pref_1_custom),
      nbhm_eligible: form.nbhm_eligible,
      declaration_accepted: form.declaration_accepted,
      education,
      exam_details,
    }
  }

  const saveApplication = async () => {
    const payload = buildPayload()
    console.log('Submitting application payload:', payload)
    const response = await submitApplication(payload)
    toast.success(response.data?.message || (isEdit ? 'Application updated!' : 'Application submitted!'))
    setIsEdit(true)
    return response
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!validate()) {
      toast.error('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      await saveApplication()
    } catch (error) {
      const detail = error.response?.data
      if (detail?.details) {
        const flattened = flattenEducationErrors(detail.details)
        setErrors((current) => ({ ...current, ...flattened }))
      }
      setSubmitError(detail?.error || 'Something went wrong.')
      toast.error(detail?.error || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleProceedToPayment = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!validate()) {
      toast.error('Please fix the highlighted fields before payment.')
      return
    }

    if (!paymentUrl) {
      toast.error('Payment link is not configured. Please contact the administrator.')
      return
    }

    setSaving(true)
    try {
      await saveApplication()
      window.location.assign(paymentUrl)
    } catch (error) {
      const detail = error.response?.data
      if (detail?.details) {
        const flattened = flattenEducationErrors(detail.details)
        setErrors((current) => ({ ...current, ...flattened }))
      }
      setSubmitError(detail?.error || 'Unable to save application before payment.')
      toast.error(detail?.error || 'Unable to save application before payment.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const renderError = (path) => errors[path] || ''

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
            Complete all sections and submit your application.
          </p>
          {submitError && (
            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {submitError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection icon={User} title="Personal Info" subtitle="Applicant identity and contact details">
            <FieldWrapper label="First Name" required error={renderError('first_name')}>
              <input
                id="field-first-name"
                type="text"
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
                className="form-input"
                placeholder="First name"
              />
            </FieldWrapper>

            <FieldWrapper label="Last Name" required error={renderError('last_name')}>
              <input
                id="field-last-name"
                type="text"
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
                className="form-input"
                placeholder="Last name"
              />
            </FieldWrapper>

            <FieldWrapper label="Gender" required error={renderError('gender')}>
              <select
                id="field-gender"
                value={form.gender}
                onChange={(e) => setField('gender', e.target.value)}
                className="form-input appearance-none"
              >
                {GENDER_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Email Address">
              <input
                id="field-email"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="your@email.com"
                className="form-input"
              />
            </FieldWrapper>

            <FieldWrapper label="Date of Birth" required error={renderError('dob')}>
              <input
                id="field-dob"
                type="date"
                value={form.dob}
                onChange={(e) => setField('dob', e.target.value)}
                className="form-input"
                required
              />
            </FieldWrapper>

            <FieldWrapper label="Category" required>
              <select
                id="field-category"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                className="form-input appearance-none"
              >
                {CATEGORY_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Marital Status">
              <select
                id="field-marital"
                value={form.marital_status}
                onChange={(e) => setField('marital_status', e.target.value)}
                className="form-input appearance-none"
              >
                {MARITAL_STATUS_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Nationality">
              <input
                id="field-nationality"
                type="text"
                value={form.nationality}
                onChange={(e) => setField('nationality', e.target.value)}
                className="form-input"
                placeholder="Indian"
              />
            </FieldWrapper>

            <FieldWrapper label="Mode of Study" required>
              <select
                id="field-study-mode"
                value={form.study_mode}
                onChange={(e) => setField('study_mode', e.target.value)}
                className="form-input appearance-none"
              >
                {STUDY_MODE_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
              </select>
            </FieldWrapper>

            <FieldWrapper label="Phone Number (WhatsApp Number)">
              <input
                id="field-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="form-input"
              />
            </FieldWrapper>

            <FieldWrapper label="Address" className="md:col-span-2">
              <textarea
                id="field-address"
                rows={3}
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Permanent address"
                className="form-input resize-none"
              />
            </FieldWrapper>
          </FormSection>

          <FormSection icon={BookOpen} title="Education" subtitle="Academic history and degree details">
            {SCHOOL_LEVELS.map((level) => {
              const row = form.education[level]
              return (
                <div key={level} className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold">{level}</h4>
                      <p className="text-xs text-white/40">Academic details for {level}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FieldWrapper label="Board" required={level !== 'Graduation'} error={renderError(`education.${level}.board`)}>
                      <select
                        value={row.board}
                        onChange={(e) => setEducationField(level, 'board', e.target.value)}
                        className="form-input appearance-none"
                      >
                        <option value="" className="bg-dark-800">Select board</option>
                        {BOARD_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                      </select>
                    </FieldWrapper>

                    <FieldWrapper label="Year of Passing" required error={renderError(`education.${level}.year_of_passing`)}>
                      <input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear() + 1}
                        value={row.year_of_passing}
                        onChange={(e) => setEducationField(level, 'year_of_passing', e.target.value)}
                        className="form-input"
                        placeholder="2024"
                      />
                    </FieldWrapper>

                    <FieldWrapper label="Division" error={renderError(`education.${level}.division`)}>
                      <select
                        value={row.division}
                        onChange={(e) => setEducationField(level, 'division', e.target.value)}
                        className="form-input appearance-none"
                      >
                        {DIVISION_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                      </select>
                    </FieldWrapper>

                    <FieldWrapper label="Score Type">
                      <select
                        value={row.score_type}
                        onChange={(e) => setEducationField(level, 'score_type', e.target.value)}
                        className="form-input appearance-none"
                      >
                        <option value="percentage" className="bg-dark-800">Percentage</option>
                        <option value="cgpa" className="bg-dark-800">CGPA</option>
                      </select>
                    </FieldWrapper>

                    <FieldWrapper label="Score" error={renderError(`education.${level}.score_value`)}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={row.score_type === 'cgpa' ? 10 : 100}
                        value={row.score_value}
                        onChange={(e) => setEducationField(level, 'score_value', e.target.value)}
                        className="form-input"
                        placeholder={row.score_type === 'cgpa' ? '0 - 10' : '0 - 100'}
                      />
                    </FieldWrapper>
                  </div>

                </div>
              )
            })}

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-white font-semibold">Graduation</h4>
                  <p className="text-xs text-white/40">Add one or more graduation degrees</p>
                </div>
                <button type="button" onClick={addGraduation} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                  <Plus size={14} /> Add Degree
                </button>
              </div>

              <div className="space-y-4">
                {form.graduation.map((row, index) => (
                  <div key={index} className="rounded-xl border border-white/10 bg-dark-900/30 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Graduation #{index + 1}</p>
                      {form.graduation.length > 1 && (
                        <button type="button" onClick={() => removeGraduation(index)} className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldWrapper label="Degree" required error={renderError(`graduation.${index}.degree_name`)}>
                        <select
                          value={row.degree_name}
                          onChange={(e) => setGraduationField(index, 'degree_name', e.target.value)}
                          className="form-input appearance-none"
                        >
                          <option value="" className="bg-dark-800">Select degree</option>
                          {['BA', 'BSc', 'BTech'].map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                          <option value="Other" className="bg-dark-800">Other</option>
                        </select>
                      </FieldWrapper>

                      {row.degree_name === 'Other' && (
                        <FieldWrapper label="Custom Degree Name" required error={renderError(`graduation.${index}.custom_degree_name`)}>
                          <input
                            type="text"
                            value={row.custom_degree_name}
                            onChange={(e) => setGraduationField(index, 'custom_degree_name', e.target.value)}
                            className="form-input"
                            placeholder="Enter degree name"
                          />
                        </FieldWrapper>
                      )}

                      <FieldWrapper label="College / University" required error={renderError(`graduation.${index}.institute`)}>
                        <input
                          type="text"
                          value={row.institute}
                          onChange={(e) => setGraduationField(index, 'institute', e.target.value)}
                          className="form-input"
                          placeholder="College or university name"
                        />
                      </FieldWrapper>

                      <FieldWrapper label="Year of Passing" required error={renderError(`graduation.${index}.year_of_passing`)}>
                        <input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear() + 1}
                          value={row.year_of_passing}
                          onChange={(e) => setGraduationField(index, 'year_of_passing', e.target.value)}
                          className="form-input"
                          placeholder="2024"
                        />
                      </FieldWrapper>

                      <FieldWrapper label="Division" error={renderError(`graduation.${index}.division`)}>
                        <select
                          value={row.division}
                          onChange={(e) => setGraduationField(index, 'division', e.target.value)}
                          className="form-input appearance-none"
                        >
                          {DIVISION_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                        </select>
                      </FieldWrapper>

                      <FieldWrapper label="Score Type">
                        <select
                          value={row.score_type}
                          onChange={(e) => setGraduationField(index, 'score_type', e.target.value)}
                          className="form-input appearance-none"
                        >
                          <option value="percentage" className="bg-dark-800">Percentage</option>
                          <option value="cgpa" className="bg-dark-800">CGPA</option>
                        </select>
                      </FieldWrapper>

                      <FieldWrapper label="Score" error={renderError(`graduation.${index}.score_value`)}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={row.score_type === 'cgpa' ? 10 : 100}
                          value={row.score_value}
                          onChange={(e) => setGraduationField(index, 'score_value', e.target.value)}
                          className="form-input"
                          placeholder={row.score_type === 'cgpa' ? '0 - 10' : '0 - 100'}
                        />
                      </FieldWrapper>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-white font-semibold">Post Graduation</h4>
                  <p className="text-xs text-white/40">Add one or more postgraduate degrees</p>
                </div>
                <button type="button" onClick={addPostGrad} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                  <Plus size={14} /> Add Degree
                </button>
              </div>

              <div className="space-y-4">
                {form.postGraduation.map((row, index) => (
                  <div key={index} className="rounded-xl border border-white/10 bg-dark-900/30 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Post Graduation #{index + 1}</p>
                      {form.postGraduation.length > 1 && (
                        <button type="button" onClick={() => removePostGrad(index)} className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldWrapper label="Degree" required error={renderError(`postGraduation.${index}.degree_name`)}>
                        <select
                          value={row.degree_name}
                          onChange={(e) => setPostGradField(index, 'degree_name', e.target.value)}
                          className="form-input appearance-none"
                        >
                          <option value="" className="bg-dark-800">Select degree</option>
                          {DEGREE_OPTIONS.slice(3, 5).map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                          <option value="Other" className="bg-dark-800">Other</option>
                        </select>
                      </FieldWrapper>

                      {row.degree_name === 'Other' && (
                        <FieldWrapper label="Custom Degree Name" required error={renderError(`postGraduation.${index}.custom_degree_name`)}>
                          <input
                            type="text"
                            value={row.custom_degree_name}
                            onChange={(e) => setPostGradField(index, 'custom_degree_name', e.target.value)}
                            className="form-input"
                            placeholder="Enter degree name"
                          />
                        </FieldWrapper>
                      )}

                      {row.degree_name === 'MSc' && (
                        <FieldWrapper label="MSc College Type" required error={renderError(`postGraduation.${index}.cfti_status`)}>
                          <select
                            value={row.cfti_status}
                            onChange={(e) => setPostGradField(index, 'cfti_status', e.target.value)}
                            className="form-input appearance-none"
                          >
                            <option value="" className="bg-dark-800">Select option</option>
                            <option value="CFTI" className="bg-dark-800">CFTI</option>
                            <option value="Non-CFTI" className="bg-dark-800">Non-CFTI</option>
                          </select>
                        </FieldWrapper>
                      )}

                      <FieldWrapper label="College / University" required error={renderError(`postGraduation.${index}.institute`)}>
                        <input
                          type="text"
                          value={row.institute}
                          onChange={(e) => setPostGradField(index, 'institute', e.target.value)}
                          className="form-input"
                          placeholder="College or university name"
                        />
                      </FieldWrapper>

                      <FieldWrapper label="Year of Passing" required error={renderError(`postGraduation.${index}.year_of_passing`)}>
                        <input
                          type="number"
                          min="1950"
                          max={new Date().getFullYear() + 1}
                          value={row.year_of_passing}
                          onChange={(e) => setPostGradField(index, 'year_of_passing', e.target.value)}
                          className="form-input"
                          placeholder="2024"
                        />
                      </FieldWrapper>

                      <FieldWrapper label="Division" error={renderError(`postGraduation.${index}.division`)}>
                        <select
                          value={row.division}
                          onChange={(e) => setPostGradField(index, 'division', e.target.value)}
                          className="form-input appearance-none"
                        >
                          {DIVISION_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                        </select>
                      </FieldWrapper>

                      <FieldWrapper label="Score Type">
                        <select
                          value={row.score_type}
                          onChange={(e) => setPostGradField(index, 'score_type', e.target.value)}
                          className="form-input appearance-none"
                        >
                          <option value="percentage" className="bg-dark-800">Percentage</option>
                          <option value="cgpa" className="bg-dark-800">CGPA</option>
                        </select>
                      </FieldWrapper>

                      <FieldWrapper label="Score" error={renderError(`postGraduation.${index}.score_value`)}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={row.score_type === 'cgpa' ? 10 : 100}
                          value={row.score_value}
                          onChange={(e) => setPostGradField(index, 'score_value', e.target.value)}
                          className="form-input"
                          placeholder={row.score_type === 'cgpa' ? '0 - 10' : '0 - 100'}
                        />
                      </FieldWrapper>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          <FormSection icon={Award} title="Exam Details" subtitle="Add one or more qualifying exam records">
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-white font-semibold">Exam Records</h4>
                  <p className="text-xs text-white/40">Exam name, score, All India Rank and percentile</p>
                </div>
                <button type="button" onClick={addExam} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                  <Plus size={14} /> Add Exam
                </button>
              </div>

              {form.examDetails.length === 0 ? (
                <div className="rounded-xl border border-white/20 border-dashed bg-white/5 p-6 text-center">
                  <p className="text-white/60 text-sm mb-3">No exams added yet</p>
                  <button type="button" onClick={addExam} className="btn-primary px-4 py-2 text-sm">
                    + Add Your First Exam
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.examDetails.map((row, index) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-dark-900/30 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Exam #{index + 1}</p>
                        {form.examDetails.length > 1 && (
                          <button type="button" onClick={() => removeExam(index)} className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1">
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldWrapper label="Exam Name" required error={renderError(`examDetails.${index}.exam_name`)}>
                          <select
                            value={row.exam_name}
                            onChange={(e) => setExamField(index, 'exam_name', e.target.value)}
                            className="form-input appearance-none"
                          >
                            {EXAM_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
                          </select>
                        </FieldWrapper>

                        {row.exam_name === 'Any Other' && (
                          <FieldWrapper label="Custom Exam Name" required error={renderError(`examDetails.${index}.custom_exam_name`)}>
                            <input
                              type="text"
                              value={row.custom_exam_name}
                              onChange={(e) => setExamField(index, 'custom_exam_name', e.target.value)}
                              className="form-input"
                              placeholder="Enter exam name"
                            />
                          </FieldWrapper>
                        )}

                        <FieldWrapper label="Score" required error={renderError(`examDetails.${index}.score`)}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.score}
                            onChange={(e) => setExamField(index, 'score', e.target.value)}
                            className="form-input"
                            placeholder="Enter score"
                          />
                        </FieldWrapper>

                        <FieldWrapper label="All India Rank" required error={renderError(`examDetails.${index}.air`)}>
                          <input
                            type="number"
                            min="1"
                            value={row.air}
                            onChange={(e) => setExamField(index, 'air', e.target.value)}
                            className="form-input"
                            placeholder="All India Rank"
                          />
                        </FieldWrapper>

                        <FieldWrapper label="Percentile" required error={renderError(`examDetails.${index}.percentile`)}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={row.percentile}
                            onChange={(e) => setExamField(index, 'percentile', e.target.value)}
                            className="form-input"
                            placeholder="Enter percentile"
                          />
                        </FieldWrapper>

                        <FieldWrapper label="Year of Exam">
                          <input
                            type="number"
                            min="2000"
                            max={new Date().getFullYear() + 1}
                            value={row.year}
                            onChange={(e) => setExamField(index, 'year', e.target.value)}
                            className="form-input"
                            placeholder="2024"
                          />
                        </FieldWrapper>

                        <FieldWrapper label="Branch / Subject">
                          <input
                            type="text"
                            value={row.branch}
                            onChange={(e) => setExamField(index, 'branch', e.target.value)}
                            className="form-input"
                            placeholder="Optional"
                          />
                        </FieldWrapper>
                      </div>

                      <FieldWrapper label="Valid Upto" className="md:col-span-2">
                        <input
                          type="text"
                          value={row.valid_upto}
                          onChange={(e) => setExamField(index, 'valid_upto', e.target.value)}
                          className="form-input"
                          placeholder="Optional"
                        />
                      </FieldWrapper>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection icon={CheckSquare} title="Research Preferences" subtitle="Select your preferred research directions">
            <FieldWrapper label="First Preference" required error={renderError('research_pref_1')}>
              <select
                value={form.research_pref_1}
                onChange={(e) => setField('research_pref_1', e.target.value)}
                className="form-input appearance-none"
              >
                <option value="" className="bg-dark-800">Select preference</option>
                {RESEARCH_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
              </select>
            </FieldWrapper>

            {form.research_pref_1 === 'Other' && (
              <FieldWrapper label="Custom First Preference">
                <input
                  type="text"
                  value={form.research_pref_1_custom}
                  onChange={(e) => setField('research_pref_1_custom', e.target.value)}
                  className="form-input"
                  placeholder="Enter your preference"
                />
              </FieldWrapper>
            )}

            <FieldWrapper label="Second Preference" error={renderError('research_pref_2')}>
              <select
                value={form.research_pref_2}
                onChange={(e) => setField('research_pref_2', e.target.value)}
                className="form-input appearance-none"
              >
                <option value="" className="bg-dark-800">Optional</option>
                {RESEARCH_OPTIONS.map((option) => <option key={option} value={option} className="bg-dark-800">{option}</option>)}
              </select>
            </FieldWrapper>

            {form.research_pref_2 === 'Other' && (
              <FieldWrapper label="Custom Second Preference">
                <input
                  type="text"
                  value={form.research_pref_2_custom}
                  onChange={(e) => setField('research_pref_2_custom', e.target.value)}
                  className="form-input"
                  placeholder="Enter your preference"
                />
              </FieldWrapper>
            )}

            <div className="md:col-span-2">
              <label htmlFor="field-nbhm" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-primary-500/50 transition-all">
                <div className="relative">
                  <input
                    id="field-nbhm"
                    type="checkbox"
                    checked={form.nbhm_eligible}
                    onChange={(e) => setField('nbhm_eligible', e.target.checked)}
                    className="sr-only"
                  />
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

          <FormSection icon={CheckSquare} title="Declaration" subtitle="Please read and accept before submission">
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 leading-relaxed">
              <p className="font-semibold text-white mb-2">DECLARATION</p>
              <p>
                I hereby declare that I have carefully read the instructions and particulars supplied to me and that the entries
                made in this application form are correct to the best of my knowledge and belief. If selected for admission,
                I promise to abide by the rules and discipline of the Institute. I note that the decision of the Institute is
                final in regards to selection. The Institute shall have the right to expel me from the Institute at any time
                after my admission, provided it is satisfied that I was admitted on false particulars furnished by me or my
                antecedents prove that my continuance in the Institute is not desirable. I agree that I shall abide by the
                decision of the Institute, which shall be final.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="field-declaration" className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-primary-500/50 transition-all">
                <input
                  id="field-declaration"
                  type="checkbox"
                  checked={form.declaration_accepted}
                  onChange={(e) => setField('declaration_accepted', e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="text-white font-medium">I have read and accept the declaration.</p>
                  {renderError('declaration_accepted') && (
                    <p className="text-xs text-red-300 mt-1">{renderError('declaration_accepted')}</p>
                  )}
                </div>
              </label>
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 pt-2 pb-8">
            <button id="btn-submit-application" type="submit" disabled={saving} className="btn-secondary flex items-center gap-2 px-8">
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : isEdit ? (
                <><RefreshCw size={16} /> Save Application</>
              ) : (
                <><Save size={16} /> Save Application</>
              )}
            </button>

            <button
              id="btn-proceed-payment"
              type="button"
              onClick={handleProceedToPayment}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <>Proceed to Payment</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
