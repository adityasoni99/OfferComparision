'use client'

import { motion } from 'framer-motion'

type Props = {
  onChange: (prefs: Record<string, any>) => void
}

export default function PreferencesForm({ onChange }: Props) {
  function update(field: string, value: any) {
    onChange({ [field]: value })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass rounded-2xl p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Toggle label="Salary Focused" onChange={(v) => update('salary_focused', v)} />
        <Toggle label="Growth Focused" onChange={(v) => update('growth_focused', v)} />
        <Toggle label="Balance Focused" onChange={(v) => update('balance_focused', v)} />
      </div>
    </motion.div>
  )
}

function Toggle({ label, onChange }: { label: string; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3">
      <input type="checkbox" className="size-4" onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  )
}


