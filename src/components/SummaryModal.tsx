import { useState } from 'react'
import { Check, Copy, X } from 'lucide-react'

export default function SummaryModal({
  text,
  savedTo,
  onClose,
}: {
  text: string
  savedTo: 'supabase' | 'local' | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center md:p-6" onClick={onClose}>
      <div
        className="animate-sheet w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 md:max-w-lg md:rounded-3xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Hoàn thành! 🎉</h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <pre className="mb-3 whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-3 font-sans text-sm leading-relaxed">
          {text}
        </pre>
        {savedTo && (
          <p className="mb-3 text-xs text-gray-500">
            {savedTo === 'supabase' ? 'Đã lưu lên Supabase' : 'Đã lưu trên thiết bị (chưa kết nối Supabase)'}
          </p>
        )}
        <button
          onClick={copy}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white active:bg-emerald-700"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
          {copied ? 'Đã copy' : 'Copy Nhật Ký'}
        </button>
      </div>
    </div>
  )
}
