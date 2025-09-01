'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'

export default function UserGuideForm() {
  const [lineId, setLineId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
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

    const res = await fetch('/api/create-user-guide', {
      method: 'POST',
      body: JSON.stringify({ lineId, displayName, ...formData }),
      headers: { 'Content-Type': 'application/json' }
    })

    const result = await res.json()
    alert(result.message)
  }

  if (loading) {
    return <div>読み込み中...</div>
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>ユーザー説明書・診断フォーム</h2>
      <p>こんにちは、{displayName}さん！</p>

      <form onSubmit={handleSubmit}>
        <label>
          氏名：
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <br />
        <label>
          生年月日：
          <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required />
        </label>
        <br />
        <label>
          出生地：
          <input name="birthplace" value={formData.birthplace} onChange={handleChange} required />
        </label>
        <br />
        <label>
          出生時間：
          <input type="time" name="birthtime" value={formData.birthtime} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">診断スタート</button>
      </form>
    </div>
  )
}