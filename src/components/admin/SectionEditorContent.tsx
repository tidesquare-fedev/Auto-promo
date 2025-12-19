import { PageSection, ProductBadge } from "@/types/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductPreview } from "@/components/admin/ProductPreview"
import { InlineStyleControl } from "@/components/admin/InlineStyleControl"
import { BackgroundColorControl } from "@/components/admin/BackgroundColorControl"
import { RichTextEditor } from "@/components/admin/RichTextEditor"
import { normalizeBadges } from "@/lib/badges"

interface SectionEditorContentProps {
  section: PageSection
  index: number
  onUpdate: (index: number, section: PageSection) => void
  onRemove: (index: number) => void
  readOnly?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function SectionEditorContent({
  section,
  index,
  onUpdate,
  onRemove,
  readOnly = false,
  collapsed = false,
  onToggleCollapse
}: SectionEditorContentProps) {
  const update = (updates: Partial<PageSection>) => {
    if (!readOnly) {
      onUpdate(index, { ...section, ...updates } as PageSection)
    }
  }

  // 공통 배지 유틸을 사용해 섹션 배지 정규화
  const badgesForSection =
    section.type === "ProductGrid" || section.type === "ProductTabs"
      ? normalizeBadges(
          (section as any).badges,
          (section as any).badge,
          (section as any).badgeTargets
        )
      : []

  const setBadges = (badges: any[]) => {
    if (readOnly) return
    if (section.type !== "ProductGrid" && section.type !== "ProductTabs") return
    onUpdate(index, { ...(section as any), badges, badge: undefined, badgeTargets: undefined } as PageSection)
  }

  const updateBadge = (changes: Partial<ProductBadge>) => {
    if (readOnly) return
    if (section.type !== "ProductGrid" && section.type !== "ProductTabs") return
    const nextBadge = { ...(section.badge || {}), ...changes }
    onUpdate(index, { ...section, badge: nextBadge } as PageSection)
  }

  // 섹션 타이틀 추출
  const getSectionTitle = (): string => {
    const s = section as any
    if (s.type === "Hero" || s.type === "IntroText" || s.type === "ProductGrid" || s.type === "ProductTabs") {
      return s.title || "제목 없음"
    }
    if (s.type === "ImageCarousel") {
      return `이미지 캐러셀 (${s.slides?.length || 0}개)`
    }
    if (s.type === "Image") {
      return `이미지 ${s.fullWidth ? "(전체 너비)" : "(컨테이너 안)"}`
    }
    if (s.type === "FAQ") {
      return `FAQ (${s.items?.length || 0}개)`
    }
    return s.type || "알 수 없음"
  }

  return (
    <div className="space-y-4">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 flex-1 text-left hover:bg-gray-50 p-2 rounded transition-colors"
        >
          <span className="text-lg transition-transform" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
          <Badge variant="outline" className="shrink-0">{section.type}</Badge>
          <span className="text-sm font-medium truncate">{getSectionTitle()}</span>
        </button>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="shrink-0"
          >
            삭제
          </Button>
        )}
      </div>

      {/* 섹션 내용 - collapsed일 때 숨김 */}
      {!collapsed && (
        <div className="space-y-4">
      {section.type === "Hero" && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>제목</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="Hero 제목"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>부제목 (선택)</Label>
              {!readOnly && section.subtitle && (
                <InlineStyleControl
                  label="부제목 스타일"
                  color={section.style?.textColor}
                  size={section.style?.textSize || "base"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, textColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, textSize: size as any } 
                  })}
                  type="body"
                />
              )}
            </div>
             <Input
               value={section.subtitle ?? ""}
               onChange={e =>
                 update({ subtitle: e.target.value || undefined })
               }
               disabled={readOnly}
               placeholder="Hero 부제목"
             />
          </div>
          <div className="space-y-2">
            <Label>이미지 URL (선택)</Label>
             <Input
               type="url"
               value={section.image ?? ""}
               onChange={e => update({ image: e.target.value || undefined })}
               disabled={readOnly}
               placeholder="https://example.com/image.jpg"
             />
          </div>
        </>
      )}

      {section.type === "IntroText" && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>제목</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="섹션 제목"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>설명</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="설명 스타일"
                  color={section.style?.textColor}
                  size={section.style?.textSize || "base"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, textColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, textSize: size as any } 
                  })}
                  type="body"
                />
              )}
            </div>
            <RichTextEditor
              value={section.description}
              onChange={(value) => update({ description: value })}
              disabled={readOnly}
              placeholder="섹션 설명을 입력하세요. 서식을 지정할 수 있습니다."
            />
          </div>
        </>
      )}

      {section.type === "ProductGrid" && (
        <>
          {(() => {
            const badges = badgesForSection
            const addBadge = () => {
              setBadges([
                ...badges,
                {
                  id: `badge-${Date.now()}`,
                  text: "",
                  backgroundColor: "#111827",
                  textColor: "#ffffff",
                  borderColor: "transparent",
                  targets: []
                }
              ])
            }

            const updateBadgeItem = (i: number, changes: any) => {
              const next = [...badges]
              next[i] = { ...next[i], ...changes }
              setBadges(next)
            }

            const removeBadge = (i: number) => {
              const next = badges.filter((_, idx) => idx !== i)
              setBadges(next)
            }

            return (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="m-0">대표 이미지 뱃지</Label>
                  {!readOnly && (
                    <Button size="sm" variant="outline" onClick={addBadge}>
                      + 뱃지 추가
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  텍스트를 비우면 노출되지 않습니다. 적용 상품 ID를 비우면 전체 상품에 적용됩니다.
                </p>

                {badges.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    뱃지를 추가해 상품별로 표시를 설정하세요.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 font-semibold text-xs">미리보기</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">배경색</th>
                          <th className="text-left p-2 font-semibold text-xs">테두리 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">적용 상품</th>
                          {!readOnly && <th className="text-left p-2 font-semibold text-xs">삭제</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {badges.map((badgeItem, i) => (
                          <tr key={badgeItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-2">
                              {badgeItem.text ? (
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: badgeItem.backgroundColor || "rgba(17,24,39,0.9)",
                                    color: badgeItem.textColor || "#ffffff",
                                    border: `1px solid ${badgeItem.borderColor || "transparent"}`
                                  }}
                                >
                                  {badgeItem.text}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.text || ""}
                                onChange={e => updateBadgeItem(i, { text: e.target.value })}
                                disabled={readOnly}
                                placeholder="예: 베스트"
                                className="h-8 text-xs w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.textColor || "#ffffff"}
                                onChange={e => updateBadgeItem(i, { textColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.backgroundColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { backgroundColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.borderColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { borderColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.targets?.join(", ") || ""}
                                onChange={e => {
                                  const targets = e.target.value
                                    .split(/[,\n]/)
                                    .map(id => id.trim())
                                    .filter(Boolean)
                                  updateBadgeItem(i, { targets: targets.length > 0 ? targets : undefined })
                                }}
                                disabled={readOnly}
                                placeholder="전체 적용"
                                className="h-8 text-xs w-32"
                              />
                              {badgeItem.targets && badgeItem.targets.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {badgeItem.targets.length}개
                                </div>
                              )}
                            </td>
                            {!readOnly && (
                              <td className="p-2">
                                <Button size="sm" variant="ghost" onClick={() => removeBadge(i)} className="h-8 text-xs">
                                  삭제
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>제목</Label>
              {!readOnly && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="상품 그리드 제목"
            />
          </div>
          
          <div className="space-y-2">
            <Label>카드 타입 (한 줄에 표시할 개수)</Label>
            <select
              value={section.columns || 4}
              onChange={e => update({ columns: Number(e.target.value) as 1 | 2 | 3 | 4 })}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>1개 - 큰 카드 (상세 정보)</option>
              <option value={2}>2개 - 중간 카드</option>
              <option value={3}>3개 - 표준 카드</option>
              <option value={4}>4개 - 작은 카드 (기본)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              💡 카드 개수에 따라 표시되는 정보량이 달라집니다
            </p>
          </div>

          <div className="space-y-2">
            <Label>상품 ID (쉼표로 구분)</Label>
            <Textarea
              key={`productgrid-${index}-productIds`}
              defaultValue={section.productIds.join(", ")}
              onBlur={e => {
                const ids = e.target.value
                  .split(/[,\n]/)  // 쉼표 또는 줄바꿈으로 구분
                  .map(id => id.trim())
                  .filter(id => id.length > 0)  // 빈 문자열 제거
                
                console.log("📝 상품 ID 입력 완료:", {
                  raw: e.target.value,
                  parsed: ids,
                  count: ids.length
                })
                
                update({ productIds: ids })
              }}
              disabled={readOnly}
              placeholder="GPRD2001366002, GPRD2001366003, GPRD2001366004"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                💡 각 상품 ID를 쉼표로 구분하거나 줄바꿈으로 입력하세요
              </p>
              <Badge variant={section.productIds.length > 0 ? "default" : "secondary"}>
                {section.productIds.length}개 상품
              </Badge>
            </div>
            {section.productIds.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-2">입력된 상품 ID:</p>
                <div className="flex flex-wrap gap-2">
                  {section.productIds.map((id, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1"
                    >
                      <span className="text-xs font-mono">{id}</span>
                      {!readOnly && (
                        <button
                          onClick={() => {
                            const newIds = section.productIds.filter((_, i) => i !== idx)
                            update({ productIds: newIds })
                          }}
                          className="text-red-500 hover:text-red-700 text-xs ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {section.productIds.length > 0 && (
            <div className="space-y-2">
              <Label>상품 미리보기 ({section.columns || 4}개 컬럼)</Label>
              <ProductPreview 
                productIds={section.productIds} 
                columns={section.columns}
                badges={badgesForSection}
                badge={section.badge}
                badgeTargets={section.badgeTargets}
              />
            </div>
          )}
        </>
      )}

      {section.type === "ProductTabs" && (
        <>
          {(() => {
            const badges = badgesForSection
            const addBadge = () => {
              setBadges([
                ...badges,
                {
                  id: `badge-${Date.now()}`,
                  text: "",
                  backgroundColor: "#111827",
                  textColor: "#ffffff",
                  borderColor: "transparent",
                  targets: []
                }
              ])
            }

            const updateBadgeItem = (i: number, changes: any) => {
              const next = [...badges]
              next[i] = { ...next[i], ...changes }
              setBadges(next)
            }

            const removeBadge = (i: number) => {
              const next = badges.filter((_, idx) => idx !== i)
              setBadges(next)
            }

            return (
              <div className="space-y-3 rounded-lg border border-gray-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="m-0">대표 이미지 뱃지</Label>
                  {!readOnly && (
                    <Button size="sm" variant="outline" onClick={addBadge}>
                      + 뱃지 추가
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  모든 탭의 상품 썸네일에 공통으로 적용됩니다. 적용 상품 ID를 비우면 전체 상품에 적용됩니다.
                </p>

                {badges.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    뱃지를 추가해 상품별로 표시를 설정하세요.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 font-semibold text-xs">미리보기</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트</th>
                          <th className="text-left p-2 font-semibold text-xs">텍스트 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">배경색</th>
                          <th className="text-left p-2 font-semibold text-xs">테두리 색상</th>
                          <th className="text-left p-2 font-semibold text-xs">적용 상품</th>
                          {!readOnly && <th className="text-left p-2 font-semibold text-xs">삭제</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {badges.map((badgeItem, i) => (
                          <tr key={badgeItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-2">
                              {badgeItem.text ? (
                                <span
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                                  style={{
                                    backgroundColor: badgeItem.backgroundColor || "rgba(17,24,39,0.9)",
                                    color: badgeItem.textColor || "#ffffff",
                                    border: `1px solid ${badgeItem.borderColor || "transparent"}`
                                  }}
                                >
                                  {badgeItem.text}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.text || ""}
                                onChange={e => updateBadgeItem(i, { text: e.target.value })}
                                disabled={readOnly}
                                placeholder="예: 베스트"
                                className="h-8 text-xs w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.textColor || "#ffffff"}
                                onChange={e => updateBadgeItem(i, { textColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.backgroundColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { backgroundColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="color"
                                value={badgeItem.borderColor || "#111827"}
                                onChange={e => updateBadgeItem(i, { borderColor: e.target.value })}
                                disabled={readOnly}
                                className="h-8 w-16 p-1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={badgeItem.targets?.join(", ") || ""}
                                onChange={e => {
                                  const targets = e.target.value
                                    .split(/[,\n]/)
                                    .map(id => id.trim())
                                    .filter(Boolean)
                                  updateBadgeItem(i, { targets: targets.length > 0 ? targets : undefined })
                                }}
                                disabled={readOnly}
                                placeholder="전체 적용"
                                className="h-8 text-xs w-32"
                              />
                              {badgeItem.targets && badgeItem.targets.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {badgeItem.targets.length}개
                                </div>
                              )}
                            </td>
                            {!readOnly && (
                              <td className="p-2">
                                <Button size="sm" variant="ghost" onClick={() => removeBadge(i)} className="h-8 text-xs">
                                  삭제
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>섹션 제목 (선택)</Label>
              {!readOnly && section.title && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title || ""}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="예: 추천 상품"
            />
          </div>

          <div className="space-y-2">
            <Label>카드 타입 (한 줄에 표시할 개수)</Label>
            <select
              value={section.columns || 4}
              onChange={e => update({ columns: Number(e.target.value) as 1 | 2 | 3 | 4 })}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={1}>1개 - 큰 카드</option>
              <option value={2}>2개 - 중간 카드</option>
              <option value={3}>3개 - 표준 카드</option>
              <option value={4}>4개 - 작은 카드 (기본)</option>
            </select>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3 bg-white">
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>탭 목록</Label>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newTabs = [
                      ...section.tabs,
                      { 
                        id: `tab${section.tabs.length + 1}`, 
                        label: `탭 ${section.tabs.length + 1}`, 
                        productIds: [] 
                      }
                    ]
                    update({ tabs: newTabs })
                  }}
                >
                  + 탭 추가
                </Button>
              )}
            </div>

            {section.tabs.map((tab, tabIdx) => (
              <Card key={tab.id} className="bg-muted/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">탭 {tabIdx + 1}</Label>
                    {!readOnly && section.tabs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTabs = section.tabs.filter((_, idx) => idx !== tabIdx)
                          update({ tabs: newTabs })
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>탭 이름</Label>
                    <Input
                      value={tab.label}
                      onChange={e => {
                        const newTabs = [...section.tabs]
                        newTabs[tabIdx] = { ...tab, label: e.target.value }
                        update({ tabs: newTabs })
                      }}
                      disabled={readOnly}
                      placeholder="예: 인기 상품, 신상품, 특가"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>상품 ID (쉼표로 구분)</Label>
                    <Textarea
                      value={tab.productIds.join(", ")}
                      onChange={e => {
                        const ids = e.target.value
                          .split(/[,\n]/)
                          .map(id => id.trim())
                          .filter(id => id.length > 0)
                        
                        const newTabs = [...section.tabs]
                        newTabs[tabIdx] = { ...tab, productIds: ids }
                        update({ tabs: newTabs })
                      }}
                      disabled={readOnly}
                      placeholder="GPRD2001366002, GPRD2001366003"
                      rows={2}
                    />
                    <Badge variant={tab.productIds.length > 0 ? "default" : "secondary"}>
                      {tab.productIds.length}개 상품
                    </Badge>
                  </div>

                  {tab.productIds.length > 0 && !readOnly && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 mb-2">입력된 상품 ID:</p>
                      <div className="flex flex-wrap gap-2">
                        {tab.productIds.map((id, idIdx) => (
                          <div
                            key={idIdx}
                            className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1"
                          >
                            <span className="text-xs font-mono">{id}</span>
                            <button
                              onClick={() => {
                                const newIds = tab.productIds.filter((_, i) => i !== idIdx)
                                const newTabs = [...section.tabs]
                                newTabs[tabIdx] = { ...tab, productIds: newIds }
                                update({ tabs: newTabs })
                              }}
                              className="text-red-500 hover:text-red-700 text-xs ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {section.type === "FAQ" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>섹션 제목 (선택)</Label>
              {!readOnly && section.title && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title || ""}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="예: 자주 묻는 질문"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>FAQ 항목 목록</Label>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newItems = [...section.items, { q: "", a: "" }]
                  update({ items: newItems })
                }}
              >
                + FAQ 추가
              </Button>
            )}
          </div>

          {section.items.map((item, i) => (
            <Card key={i} className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>FAQ 항목 {i + 1}</Label>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newItems = section.items.filter(
                          (_, idx) => idx !== i
                        )
                        update({ items: newItems })
                      }}
                    >
                      삭제
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>질문</Label>
                  <Input
                    value={item.q}
                    onChange={e => {
                      const newItems = [...section.items]
                      newItems[i] = { ...item, q: e.target.value }
                      update({ items: newItems })
                    }}
                    disabled={readOnly}
                    placeholder="질문을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label>답변</Label>
                  <Textarea
                    value={item.a}
                    onChange={e => {
                      const newItems = [...section.items]
                      newItems[i] = { ...item, a: e.target.value }
                      update({ items: newItems })
                    }}
                    disabled={readOnly}
                    placeholder="답변을 입력하세요"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                update({ items: [...section.items, { q: "", a: "" }] })
              }}
            >
              + FAQ 항목 추가
            </Button>
          )}
        </div>
      )}

      {section.type === "ImageCarousel" && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>섹션 제목 (선택)</Label>
              {!readOnly && section.title && (
                <InlineStyleControl
                  label="제목 스타일"
                  color={section.style?.titleColor}
                  size={section.style?.titleSize || "2xl"}
                  onColorChange={(color) => update({ 
                    style: { ...section.style, titleColor: color || undefined } 
                  })}
                  onSizeChange={(size) => update({ 
                    style: { ...section.style, titleSize: size as any } 
                  })}
                  type="title"
                />
              )}
            </div>
            <Input
              value={section.title || ""}
              onChange={e => update({ title: e.target.value })}
              disabled={readOnly}
              placeholder="예: 이용 꿀팁"
            />
          </div>

          <div className="space-y-2">
            <Label>이미지 높이</Label>
            <select
              value={section.imageHeight || "medium"}
              onChange={e => {
                const height = e.target.value as "small" | "medium" | "large" | "xlarge" | "custom"
                update({ 
                  imageHeight: height,
                  customHeight: height === "custom" ? section.customHeight || 400 : undefined,
                  customWidth: height === "custom" ? section.customWidth || 800 : undefined
                })
              }}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="small">작음 (192px)</option>
              <option value="medium">보통 (256px) - 기본</option>
              <option value="large">큼 (384px)</option>
              <option value="xlarge">매우 큼 (500px)</option>
              <option value="custom">커스텀</option>
            </select>
            {section.imageHeight === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">커스텀 높이 (px)</Label>
                  <Input
                    type="number"
                    value={section.customHeight || 400}
                    onChange={e => {
                      const height = parseInt(e.target.value) || 400
                      update({ customHeight: height })
                    }}
                    disabled={readOnly}
                    placeholder="400"
                    min={100}
                    max={1000}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">커스텀 너비 (px)</Label>
                  <Input
                    type="number"
                    value={section.customWidth || 800}
                    onChange={e => {
                      const width = parseInt(e.target.value) || 800
                      update({ customWidth: width })
                    }}
                    disabled={readOnly}
                    placeholder="800"
                    min={200}
                    max={2000}
                    className="h-10"
                  />
                </div>
              </div>
            )}
            {section.imageHeight === "custom" && (
              <p className="text-xs text-muted-foreground">
                💡 높이: 100px ~ 1000px, 너비: 200px ~ 2000px 사이의 값을 입력하세요. 이미지는 지정된 크기에 맞게 리사이징됩니다.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label>슬라이드 목록</Label>
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSlides = [
                    ...section.slides,
                    { id: `slide-${Date.now()}`, image: "", title: "", description: "" }
                  ]
                  update({ slides: newSlides })
                }}
              >
                + 슬라이드 추가
              </Button>
            )}
          </div>

          {section.slides.map((slide, i) => (
            <Card key={slide.id} className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>슬라이드 {i + 1} / {section.slides.length}</Label>
                  <div className="flex gap-2">
                    {!readOnly && i > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = [...section.slides]
                          ;[newSlides[i], newSlides[i - 1]] = [newSlides[i - 1], newSlides[i]]
                          update({ slides: newSlides })
                        }}
                      >
                        ↑ 위로
                      </Button>
                    )}
                    {!readOnly && i < section.slides.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = [...section.slides]
                          ;[newSlides[i], newSlides[i + 1]] = [newSlides[i + 1], newSlides[i]]
                          update({ slides: newSlides })
                        }}
                      >
                        ↓ 아래로
                      </Button>
                    )}
                    {!readOnly && section.slides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlides = section.slides.filter((_, idx) => idx !== i)
                          update({ slides: newSlides })
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>이미지 URL *</Label>
                  <Input
                    type="url"
                    value={slide.image}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, image: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="https://example.com/image.jpg"
                  />
                  {slide.image && (
                    <div className="mt-2">
                      <img 
                        src={slide.image} 
                        alt={`Slide ${i + 1}`}
                        className="max-w-full h-48 object-contain border border-gray-200 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>제목 (선택)</Label>
                  <Input
                    value={slide.title || ""}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, title: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="슬라이드 제목"
                  />
                </div>

                <div className="space-y-2">
                  <Label>설명 (선택)</Label>
                  <Textarea
                    value={slide.description || ""}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, description: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="슬라이드 설명"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>링크 URL (선택)</Label>
                  <Input
                    value={slide.link || ""}
                    onChange={e => {
                      const newSlides = [...section.slides]
                      newSlides[i] = { ...slide, link: e.target.value }
                      update({ slides: newSlides })
                    }}
                    disabled={readOnly}
                    placeholder="https://example.com (이미지 클릭 시 이동)"
                  />
                  {slide.link && (
                    <p className="text-xs text-blue-600">
                      🔗 클릭 시 새 탭에서 열립니다
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {section.type === "Image" && (
        <>
          <div className="space-y-2">
            <Label>이미지 URL</Label>
            <Input
              value={section.image || ""}
              onChange={e => update({ image: e.target.value })}
              disabled={readOnly}
              placeholder="https://example.com/image.jpg"
            />
            {section.image && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <img 
                  src={section.image} 
                  alt="미리보기" 
                  className="w-full h-auto max-h-64 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>대체 텍스트 (alt)</Label>
            <Input
              value={section.alt || ""}
              onChange={e => update({ alt: e.target.value })}
              disabled={readOnly}
              placeholder="이미지 설명 (접근성)"
            />
          </div>

          <div className="space-y-2">
            <Label>캡션 (선택)</Label>
            <Input
              value={section.caption || ""}
              onChange={e => update({ caption: e.target.value })}
              disabled={readOnly}
              placeholder="이미지 하단에 표시될 캡션"
            />
          </div>

          <div className="space-y-2">
            <Label>링크 URL (선택)</Label>
            <Input
              value={section.link || ""}
              onChange={e => update({ link: e.target.value })}
              disabled={readOnly}
              placeholder="https://example.com (이미지 클릭 시 이동)"
            />
            {section.link && (
              <p className="text-xs text-blue-600">
                🔗 클릭 시 새 탭에서 열립니다
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>이미지 높이</Label>
            <select
              value={section.imageHeight || "auto"}
              onChange={e => {
                const height = e.target.value as "small" | "medium" | "large" | "xlarge" | "auto" | "custom"
                update({ 
                  imageHeight: height,
                  customHeight: height === "custom" ? section.customHeight || 400 : undefined,
                  customWidth: height === "custom" ? section.customWidth || 800 : undefined
                })
              }}
              disabled={readOnly}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="auto">자동 (원본 비율) - 기본</option>
              <option value="small">작음 (192px / 256px)</option>
              <option value="medium">보통 (256px / 320px)</option>
              <option value="large">큼 (320px / 384px)</option>
              <option value="xlarge">매우 큼 (384px / 500px)</option>
              <option value="custom">커스텀</option>
            </select>
            {section.imageHeight === "custom" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">커스텀 높이 (px)</Label>
                    <Input
                      type="number"
                      value={section.customHeight || 400}
                      onChange={e => {
                        const height = parseInt(e.target.value) || 400
                        update({ customHeight: height })
                      }}
                      disabled={readOnly}
                      placeholder="400"
                      min={100}
                      max={1000}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">커스텀 너비 (px - 선택)</Label>
                    <Input
                      type="number"
                      value={section.customWidth || 800}
                      onChange={e => {
                        const width = parseInt(e.target.value) || 800
                        update({ customWidth: width })
                      }}
                      disabled={readOnly}
                      placeholder="800"
                      min={200}
                      max={2000}
                      className="h-10"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 모바일에서는 화면 너비에 맞게 자동 조정됩니다
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>표시 방식</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={section.fullWidth === true}
                  onChange={() => update({ fullWidth: true })}
                  disabled={readOnly}
                />
                <span className="text-sm">전체 너비 (여백 없음)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={section.fullWidth === false}
                  onChange={() => update({ fullWidth: false })}
                  disabled={readOnly}
                />
                <span className="text-sm">컨테이너 안 (여백 있음)</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              전체 너비: 모바일에서 좌우 여백 없이 화면 가득 표시
            </p>
          </div>

          {!readOnly && (
            <BackgroundColorControl
              color={section.style?.backgroundColor}
              onColorChange={(color) => update({ 
                style: { ...section.style, backgroundColor: color || undefined } 
              })}
            />
          )}
        </>
      )}
        </div>
      )}
    </div>
  )
}
