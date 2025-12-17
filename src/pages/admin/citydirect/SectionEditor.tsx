import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function SectionEditor({ section, onChange, onRemove }) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex justify-between">
          <strong>{section.type}</strong>
          <Button variant="ghost" onClick={onRemove}>
            삭제
          </Button>
        </div>

        {section.type === "Hero" && (
          <>
            <Input
              placeholder="타이틀"
              value={section.title}
              onChange={e =>
                onChange({ ...section, title: e.target.value })
              }
            />
            <Input
              placeholder="서브 타이틀"
              value={section.subtitle}
              onChange={e =>
                onChange({ ...section, subtitle: e.target.value })
              }
            />
          </>
        )}

        {section.type === "IntroText" && (
          <>
            <Input
              placeholder="제목"
              value={section.title}
              onChange={e =>
                onChange({ ...section, title: e.target.value })
              }
            />
            <Textarea
              placeholder="설명"
              value={section.description}
              onChange={e =>
                onChange({ ...section, description: e.target.value })
              }
            />
          </>
        )}

        {section.type === "ProductGrid" && (
          <>
            <Input
              placeholder="섹션 타이틀"
              value={section.title}
              onChange={e =>
                onChange({ ...section, title: e.target.value })
              }
            />
            <Textarea
              placeholder="상품 ID (콤마로 구분)"
              defaultValue={section.productIds.join(", ")}
              onBlur={e =>
                onChange({
                  ...section,
                  productIds: e.target.value
                    .split(/[,\n]/)
                    .map(v => v.trim())
                    .filter(v => v.length > 0)
                })
              }
            />
          </>
        )}

        {section.type === "FAQ" && (
          <Textarea
            placeholder="Q:A 형태로 입력 (한 줄씩)"
            value={section.items
              .map(i => `${i.q}:${i.a}`)
              .join("\n")}
            onChange={e =>
              onChange({
                ...section,
                items: e.target.value.split("\n").map(line => {
                  const [q, a] = line.split(":")
                  return { q, a }
                })
              })
            }
          />
        )}
      </CardContent>
    </Card>
  )
}
