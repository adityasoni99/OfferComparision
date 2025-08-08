'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export type Offer = {
  id?: string
  company: string
  position: string
  location: string
  base_salary: number
  equity?: number
  bonus?: number
  years_experience?: number
  vesting_years?: number
}

type Props = {
  onChange: (offers: Offer[]) => void
}

export default function OfferForm({ onChange }: Props) {
  const [offers, setOffers] = useState<Offer[]>([blankOffer(1), blankOffer(2)])

  function blankOffer(idx: number): Offer {
    return {
      id: `offer_${idx}`,
      company: '',
      position: '',
      location: '',
      base_salary: 0,
      equity: 0,
      bonus: 0,
      years_experience: 5,
      vesting_years: 4,
    }
  }

  function update(idx: number, field: keyof Offer, value: any) {
    const next = offers.map((o, i) => (i === idx ? { ...o, [field]: value } : o))
    setOffers(next)
    onChange(next)
  }

  function addOffer() {
    const next = [...offers, blankOffer(offers.length + 1)]
    setOffers(next)
    onChange(next)
  }

  function removeOffer(idx: number) {
    const next = offers.filter((_, i) => i !== idx)
    setOffers(next)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {offers.map((offer, idx) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm uppercase tracking-wider text-slate-400">Offer #{idx + 1}</div>
            <button
              onClick={() => removeOffer(idx)}
              className="text-slate-400 hover:text-red-300 text-sm"
              disabled={offers.length <= 1}
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Company" value={offer.company} onChange={(v) => update(idx, 'company', v)} />
            <Input label="Position" value={offer.position} onChange={(v) => update(idx, 'position', v)} />
            <Input label="Location" value={offer.location} onChange={(v) => update(idx, 'location', v)} />

            <NumberInput label="Base Salary ($)" value={offer.base_salary} onChange={(v) => update(idx, 'base_salary', v)} />
            <NumberInput label="Equity ($/yr)" value={offer.equity ?? 0} onChange={(v) => update(idx, 'equity', v)} />
            <NumberInput label="Bonus ($/yr)" value={offer.bonus ?? 0} onChange={(v) => update(idx, 'bonus', v)} />

            <NumberInput label="Years Experience" value={offer.years_experience ?? 5} onChange={(v) => update(idx, 'years_experience', v)} />
            <NumberInput label="Vesting Years" value={offer.vesting_years ?? 4} onChange={(v) => update(idx, 'vesting_years', v)} />
          </div>
        </motion.div>
      ))}

      <button
        onClick={addOffer}
        className="rounded-lg px-4 py-2 bg-slate-800/70 hover:bg-slate-700/70 transition text-slate-100 border border-slate-700"
      >
        + Add Offer
      </button>
    </div>
  )
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm">
      <div className="text-slate-400 mb-1">{label}</div>
      <input
        className="w-full rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-sm">
      <div className="text-slate-400 mb-1">{label}</div>
      <input
        type="number"
        className="w-full rounded-lg bg-slate-900/50 border border-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}


