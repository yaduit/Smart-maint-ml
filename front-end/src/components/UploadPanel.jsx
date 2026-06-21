import { useState, useRef } from 'react'
import { uploadCSV } from '../services/api.js'
import Icon from './Icon.jsx'

const STEPS = ['Select file', 'Upload CSV']

const UploadPanel = ({ onDataRefresh }) => {
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)
  const fileRef = useRef()

  const step = result ? 2 : (!file ? 0 : 1)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadCSV(fd)
      setResult(res.data)
      onDataRefresh()
    } catch (e) {
      setError(e.response?.data?.error || 'Upload failed — check your file format')
    } finally { setUploading(false) }
  }


  return (
    <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-[#d0d7de] bg-[#f6f8fa]">
        <div className="flex items-center gap-2">
          <Icon name="upload" size={13} className="text-[#57606a]" />
          <span className="text-[13px] font-semibold text-[#24292f]">
            Upload Sensor Data
          </span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center
                text-[10px] font-bold border transition-colors
                ${i < step
                  ? 'bg-[#1a7f37] border-[#1a7f37] text-white'
                  : i === step
                    ? 'bg-white border-[#0969da] text-[#0969da]'
                    : 'bg-[#f6f8fa] border-[#d0d7de] text-[#6e7781]'
                }`}
              >
                {i < step
                  ? <Icon name="checkSm" size={9} strokeWidth={3} />
                  : i + 1
                }
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px transition-colors ${i < step ? 'bg-[#1a7f37]' : 'bg-[#d0d7de]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">

        {/* Success banner */}
        {result && (
          <div className="flex items-center gap-2 px-3 py-2 mb-3
                          bg-[#dafbe1] border border-[#82e79a] rounded-md
                          text-[12px] text-[#1a7f37] font-medium">
            <Icon name="checkSm" size={13} strokeWidth={2.5} />
            Uploaded {file?.name}: {result.message}
          </div>
        )}

        {/* Drop zone */}
        <div
          onClick={() => { if (!uploading) fileRef.current.click() }}
          className={`border border-dashed rounded-md p-5 text-center cursor-pointer
            transition-all mb-3
            ${file
              ? 'border-[#0969da] bg-[#ddf4ff]'
              : 'border-[#d0d7de] bg-[#f6f8fa] hover:border-[#0969da] hover:bg-[#f0f6ff]'
            }`}
        >
          <div className={`flex justify-center mb-1.5 ${file ? 'text-[#0969da]' : 'text-[#6e7781]'}`}>
            <Icon name="upload" size={18} />
          </div>
          <p className={`text-[12px] font-medium ${file ? 'text-[#0969da]' : 'text-[#57606a]'}`}>
            {file ? file.name : 'Click to select CSV file'}
          </p>
          <p className="text-[11px] text-[#6e7781] mt-0.5">
            {file ? 'Click to change file' : 'Supports AI4I format · max 50 MB'}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            disabled={uploading}
            onChange={e => { setFile(e.target.files[0]); setResult(null) }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2 mb-3
                          bg-[#ffebe9] border border-[#ffc1c0] rounded-md
                          text-[12px] text-[#cf222e]">
            <Icon name="triangle" size={13} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={!file || uploading || !!result}
            className="flex-1 flex items-center justify-center gap-1.5
              px-4 py-2 rounded-md text-[12px] font-semibold border
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
              bg-[#f6f8fa] text-[#24292f] border-[#d0d7de]
              hover:bg-[#eaeef2] hover:border-[#adb5bd]
              disabled:hover:bg-[#f6f8fa] disabled:hover:border-[#d0d7de]"
          >
            {uploading
              ? <><Icon name="refresh" size={12} className="animate-spin" /> Uploading…</>
              : result
                ? <><Icon name="checkSm" size={12} /> Uploaded</>
                : <><Icon name="upload" size={12} /> Upload CSV</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadPanel