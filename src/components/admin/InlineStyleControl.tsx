import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface InlineStyleControlProps {
  label: string
  color?: string
  size?: string
  onColorChange: (color: string) => void
  onSizeChange: (size: string) => void
  type: "title" | "body"
}

const COLOR_PRESETS = [
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#1f2937" },
  { label: "Gray", value: "#374151" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Red", value: "#dc2626" },
]

const TITLE_SIZES = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "X-Large", value: "xl" },
  { label: "2X-Large", value: "2xl" },
  { label: "3X-Large", value: "3xl" },
]

const BODY_SIZES = [
  { label: "Small", value: "sm" },
  { label: "Base", value: "base" },
  { label: "Large", value: "lg" },
  { label: "X-Large", value: "xl" },
]

export function InlineStyleControl({
  label,
  color = "#000000",
  size = "2xl",
  onColorChange,
  onSizeChange,
  type
}: InlineStyleControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const sizes = type === "title" ? TITLE_SIZES : BODY_SIZES

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          type="button"
        >
          <span className="text-xs">🎨 {label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">색상</p>
            <div className="flex gap-2 items-center mb-2">
              <Input
                type="color"
                value={color || "#000000"}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-12 h-8 p-0 border-none cursor-pointer"
              />
              <Input
                type="text"
                value={color || ""}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onColorChange(preset.value)}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    color === preset.value ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">크기</p>
            <Select value={size} onValueChange={onSizeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="크기 선택" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onColorChange("")
              onSizeChange(type === "title" ? "2xl" : "base")
            }}
            className="w-full"
            type="button"
          >
            초기화
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

