'use client'

import '@/style/main.css'
import { useEffect, useState } from 'react'
import liff from '@line/liff'

export default function UserGuideForm() {
  const [lineId, setLineId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    birthplace: '',
    birthtime: ''
  })

  useEffect(() => {
    liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_PERSONAL || '' }).then(() => {
      if (!liff.isLoggedIn()) {
        liff.login()
      } else {
        liff.getProfile().then(profile => {
          setLineId(profile.userId)
          setDisplayName(profile.displayName)
          setLoading(false)
        })
      }
    })
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const birthdate = `${formData.year}-${formData.month}-${formData.day}`
    const res = await fetch('/api/create-user-guide', {
      method: 'POST',
      body: JSON.stringify({ 
        lineId, 
        displayName, 
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
      <div className="wrapper" style={{ marginTop: '50px' }}>
        <div className="banner-header">
          <h2>
            <span className="en">What’s Your Fortune?</span>
            <span className="jp">無料でうらなう</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-form">
            <div className="birthdate-form">
              <label className="form-label">
                生年月日
                <span className="required-badge">必須</span>
              </label>
              <div className="birthdate-grid">
                <div className="input-group">
                  <select
                    className="birth-select"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">--</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select> 年
                </div>
                <div className="input-group">
                  <select
                    className="birth-select"
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                  >
                    <option value="">--</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select> 月
                </div>
                <div className="input-group">
                  <select
                    className="birth-select"
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    required
                  >
                    <option value="">--</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select> 日
                </div>
              </div>
            </div>

            <div className="birthdate-form">
              <label className="form-label">
                氏名
                <span className="required-badge">必須</span>
              </label>
              <input
                className="birth-select"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="birthdate-form">
              <label className="form-label">
                出生地
                <span className="required-badge">必須</span>
              </label>
              <input
                className="birth-select"
                name="birthplace"
                value={formData.birthplace}
                onChange={handleChange}
                required
              />
            </div>

            <div className="birthdate-form">
              <label className="form-label">
                出生時間（任意）
              </label>
              <input
                className="birth-select"
                type="time"
                name="birthtime"
                value={formData.birthtime}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            無料で占う
          </button>
        </form>
      </div>
    </>
  )
}