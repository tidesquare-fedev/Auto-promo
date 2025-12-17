import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"

// Quill을 동적으로 import (SSR 방지)
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <p className="text-sm text-gray-500">에디터 로딩 중...</p>
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function RichTextEditor({ value, onChange, disabled, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link"],
      ["clean"]
    ]
  }

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "align",
    "link"
  ]

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "내용을 입력하세요..."}
        readOnly={disabled}
        className={disabled ? "opacity-50 cursor-not-allowed" : ""}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-family: "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
    </div>
  )
}
