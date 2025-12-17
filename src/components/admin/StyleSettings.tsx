import { SectionStyle } from "@/types/page"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StyleSettingsProps {
  style?: SectionStyle
  onChange: (style: SectionStyle) => void
  disabled?: boolean
}

export function StyleSettings({ style = {}, onChange, disabled }: StyleSettingsProps) {
  const update = (updates: Partial<SectionStyle>) => {
    onChange({ ...style, ...updates })
  }

  const titleSizeLabels = {
    sm: "작게 (14px)",
    base: "기본 (16px)",
    lg: "크게 (18px)",
    xl: "더 크게 (20px)",
    "2xl": "매우 크게 (24px)",
    "3xl": "최대 (30px)"
  }

  const textSizeLabels = {
    sm: "작게 (14px)",
    base: "기본 (16px)",
    lg: "크게 (18px)",
    xl: "매우 크게 (20px)"
  }

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <span>🎨</span>
          <span>스타일 설정</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 배경색 */}
        <div className="space-y-2">
          <Label>배경색</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={style.backgroundColor || "#ffffff"}
              onChange={e => update({ backgroundColor: e.target.value })}
              disabled={disabled}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={style.backgroundColor || ""}
              onChange={e => update({ backgroundColor: e.target.value })}
              disabled={disabled}
              placeholder="#ffffff 또는 transparent"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["#ffffff", "#f3f4f6", "#e5e7eb", "#dbeafe", "#fef3c7", "transparent"].map(color => (
              <button
                key={color}
                onClick={() => update({ backgroundColor: color })}
                disabled={disabled}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                style={{ backgroundColor: color === "transparent" ? "#ffffff" : color }}
                title={color}
              >
                {color === "transparent" && "×"}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 색상 */}
        <div className="space-y-2">
          <Label>제목 색상</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={style.titleColor || "#000000"}
              onChange={e => update({ titleColor: e.target.value })}
              disabled={disabled}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={style.titleColor || ""}
              onChange={e => update({ titleColor: e.target.value })}
              disabled={disabled}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["#000000", "#1f2937", "#374151", "#2563eb", "#dc2626", "#7c3aed"].map(color => (
              <button
                key={color}
                onClick={() => update({ titleColor: color })}
                disabled={disabled}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 제목 크기 */}
        <div className="space-y-2">
          <Label>제목 크기</Label>
          <select
            value={style.titleSize || "2xl"}
            onChange={e => update({ titleSize: e.target.value as any })}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.entries(titleSizeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 본문 색상 */}
        <div className="space-y-2">
          <Label>본문 색상</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={style.textColor || "#000000"}
              onChange={e => update({ textColor: e.target.value })}
              disabled={disabled}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={style.textColor || ""}
              onChange={e => update({ textColor: e.target.value })}
              disabled={disabled}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["#000000", "#374151", "#6b7280", "#9ca3af"].map(color => (
              <button
                key={color}
                onClick={() => update({ textColor: color })}
                disabled={disabled}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* 본문 크기 */}
        <div className="space-y-2">
          <Label>본문 크기</Label>
          <select
            value={style.textSize || "base"}
            onChange={e => update({ textSize: e.target.value as any })}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {Object.entries(textSizeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 초기화 버튼 */}
        {(style.backgroundColor || style.titleColor || style.titleSize || style.textColor || style.textSize) && (
          <button
            onClick={() => onChange({})}
            disabled={disabled}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            스타일 초기화
          </button>
        )}
      </CardContent>
    </Card>
  )
}

