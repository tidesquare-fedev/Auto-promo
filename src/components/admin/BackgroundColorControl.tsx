import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface BackgroundColorControlProps {
  color?: string
  onColorChange: (color: string) => void
}

const BG_COLOR_PRESETS = [
  { label: "White", value: "#ffffff" },
  { label: "Light Gray", value: "#f3f4f6" },
  { label: "Gray", value: "#e5e7eb" },
  { label: "Sky Blue", value: "#dbeafe" },
  { label: "Yellow", value: "#fef3c7" },
  { label: "Pink", value: "#fce7f3" },
  { label: "Green", value: "#d1fae5" },
  { label: "Transparent", value: "transparent" },
]

export function BackgroundColorControl({
  color = "#ffffff",
  onColorChange
}: BackgroundColorControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 gap-2"
          type="button"
        >
          <div
            className="w-4 h-4 rounded border border-gray-300"
            style={{ backgroundColor: color === "transparent" ? "white" : color || "#ffffff" }}
          />
          <span className="text-xs">배경색</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">배경색</p>
            <div className="flex gap-2 items-center mb-2">
              <Input
                type="color"
                value={color === "transparent" ? "#ffffff" : (color || "#ffffff")}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-12 h-8 p-0 border-none cursor-pointer"
                disabled={color === "transparent"}
              />
              <Input
                type="text"
                value={color || ""}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#ffffff 또는 transparent"
                className="flex-1 text-sm"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BG_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => onColorChange(preset.value)}
                  className={`h-10 rounded border-2 transition-all flex items-center justify-center ${
                    color === preset.value ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: preset.value === "transparent" ? "white" : preset.value,
                    borderColor: preset.value === "transparent" ? "#d1d5db" : preset.value
                  }}
                  title={preset.label}
                >
                  {preset.value === "transparent" && (
                    <span className="text-xs text-gray-500">투명</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onColorChange("#ffffff")}
            className="w-full"
            type="button"
          >
            초기화 (흰색)
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

