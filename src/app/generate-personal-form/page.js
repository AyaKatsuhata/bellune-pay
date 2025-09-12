'use client'

import '@/style/main.css'
import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { useRouter } from 'next/navigation'

export default function GeneratePersonalForm() {
  const [lineId, setLineId] = useState('')
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    birthplace: '',
    birthtime: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const router = useRouter()
  useEffect(() => {
    const initLiff = async () => {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_PERSONAL || '' })
      if (!liff.isLoggedIn()) {
        liff.login()
      } else {
        const profile = await liff.getProfile()
        setLineId(profile.userId)

        const res = await fetch('/api/generate-personal-form', {
          method: 'POST',
          body: JSON.stringify({ 
            mode: 'check',
            lineId: profile.userId 
          }),
          headers: { 'Content-Type': 'application/json' },
        })
        const result = await res.json()
        if (result) {
          router.push('/generate-personal-already')
        }
        setLoading(false)
      }
    }
    initLiff()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (formErrors.birthdate && (e.target.name === 'year' || e.target.name === 'month' || e.target.name === 'day')) {
      // Remove birthdate error on change
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.birthdate
        return newErrors
      })
    }
    if (formErrors[e.target.name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[e.target.name]
        return newErrors
      })
    }
  }

  const handleBlur = (e) => {
    if (formErrors.birthdate && (e.target.name === 'year' || e.target.name === 'month' || e.target.name === 'day')) {
      if (formData.year && formData.month && formData.day) {
        setFormErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.birthdate
          return newErrors
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValidDate = (y, m, d) => {
      const date = new Date(y, m - 1, d)
      return (
        date.getFullYear() === parseInt(y, 10) &&
        date.getMonth() === parseInt(m, 10) - 1 &&
        date.getDate() === parseInt(d, 10)
      )
    }

    const errors = {}
    if (!formData.name.trim()) errors.name = '入力必須です。'
    if (!formData.year || !formData.month || !formData.day) {
      errors.birthdate = '入力必須です。'
    } else if (!isValidDate(formData.year, formData.month, formData.day)) {
      errors.birthdate = '存在しない日付です'
    }
    if (!formData.birthplace.trim()) errors.birthplace = '入力必須です。'
    if (formData.birthtime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(formData.birthtime)) errors.birthtime = ':区切りで入力してください。例：12:05'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({}) // エラーがない場合リセット
    const birthdate = `${formData.year}-${formData.month}-${formData.day}`
    const res = await fetch('/api/generate-personal-form', {
      method: 'POST',
      body: JSON.stringify({
        mode: null,
        lineId,
        name: formData.name,
        birthdate,
        birthplace: formData.birthplace,
        birthtime: formData.birthtime
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const result = await res.json()
    alert(result.message)
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  return (
    <>
      <div className="wrapper" style={{ marginBottom: '50px' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-form">
            <div className="birthdate-form">
              <label className="form-label">生年月日<span className="required-badge">必須</span></label>
              <div className="birthdate-grid">
                <div className="input-group">
                  <select className={`form-base form-select form-s ${formErrors.birthdate ? 'input-error' : ''}`} name="year" value={formData.year} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">--</option> {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                  </select> 年
                </div>
                <div className="input-group">
                  <select className={`form-base form-select form-s ${formErrors.birthdate ? 'input-error' : ''}`} name="month" value={formData.month} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">--</option> {months.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select> 月
                </div>
                <div className="input-group">
                  <select className={`form-base form-select form-s ${formErrors.birthdate ? 'input-error' : ''}`} name="day" value={formData.day} onChange={handleChange} onBlur={handleBlur}>
                    <option value="">--</option>{days.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select> 日
                </div>
              </div>
              {formErrors.birthdate && (
                <p className="form-error" aria-live="polite" style={{ marginTop: '8px', color: '#d33', fontWeight: 700 }}>
                  {formErrors.birthdate}
                </p>
              )}
            </div>

            <div className="birthdate-form">
              <label className="form-label">氏名<span className="required-badge">必須</span></label>
              <input className={`form-base form-m ${formErrors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} />
              {formErrors.name && (
                <p className="form-error" aria-live="polite" style={{ marginTop: '8px', color: '#d33', fontWeight: 700 }}>
                  {formErrors.name}
                </p>
              )}
            </div>

            <div className="birthdate-form">
              <label className="form-label">出生地<span className="required-badge">必須</span></label>
              <input className={`form-base form-l ${formErrors.birthplace ? 'input-error' : ''}`} name="birthplace" value={formData.birthplace} onChange={handleChange} placeholder="例：東京都新宿区" />
              {formErrors.birthplace && (
                <p className="form-error" aria-live="polite" style={{ marginTop: '8px', color: '#d33', fontWeight: 700 }}>
                  {formErrors.birthplace}
                </p>
              )}
            </div>

            <div className="birthdate-form">
              <label className="form-label">出生時間<p style={{ fontSize: '18px' }}>（任意）</p></label>
              <input className={`form-base form-s ${formErrors.birthtime ? 'input-error' : ''}`} type="text" name="birthtime" value={formData.birthtime} onChange={handleChange} placeholder="12:05" pattern="^([01]\d|2[0-3]):([0-5]\d)$"/>
              {formErrors.birthtime && (
                <p className="form-error" aria-live="polite" style={{ marginTop: '8px', color: '#d33', fontWeight: 700 }}>
                  {formErrors.birthtime}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            占う
          </button>
        </form>
      </div>
      <style jsx>{`
        .input-error {
          border: 2px solid #d33;
          background-color: #fff0f0;
        }
      `}</style>
    </>
  )
}