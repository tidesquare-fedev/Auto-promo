import { PageSection } from "@/types/page"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SectionTreeProps {
  sections: PageSection[]
  onReorder: (sections: PageSection[]) => void
  onSectionClick: (index: number) => void
  currentIndex?: number
}

export function SectionTree({
  sections,
  onReorder,
  onSectionClick,
  currentIndex
}: SectionTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((_, idx) => idx === active.id)
      const newIndex = sections.findIndex((_, idx) => idx === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const draggedSection = sections[oldIndex]
        
        // 히어로 섹션이 첫 번째에 있고 다른 위치로 이동하려고 하면 막기
        if (draggedSection.type === "Hero" && oldIndex === 0 && newIndex !== 0) {
          return // 이동 불가
        }
        
        const newSections = arrayMove(sections, oldIndex, newIndex)
        onReorder(newSections)
      }
    }
  }

  // 섹션 타입별 아이콘
  const getIcon = (type: string) => {
    switch (type) {
      case "Hero":
        return "🎯"
      case "IntroText":
        return "📝"
      case "ProductGrid":
        return "📦"
      case "ProductTabs":
        return "📑"
      case "FAQ":
        return "❓"
      case "ImageCarousel":
        return "🖼️"
      default:
        return "📄"
    }
  }

  // 섹션 타입별 색상
  const getColor = (type: string) => {
    switch (type) {
      case "Hero":
        return "bg-blue-100 text-blue-700"
      case "IntroText":
        return "bg-green-100 text-green-700"
      case "ProductGrid":
        return "bg-purple-100 text-purple-700"
      case "ProductTabs":
        return "bg-pink-100 text-pink-700"
      case "FAQ":
        return "bg-yellow-100 text-yellow-700"
      case "ImageCarousel":
        return "bg-cyan-100 text-cyan-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // 섹션 타이틀 추출
  const getTitle = (section: PageSection) => {
    if ('title' in section && section.title) {
      return section.title
    }
    return `${section.type} 섹션`
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📋</span>
          <span>페이지 구조</span>
          <Badge variant="secondary">{sections.length}개</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            섹션을 추가해주세요
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((_, idx) => idx)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <SortableTreeItem
                    key={index}
                    id={index}
                    section={section}
                    index={index}
                    isActive={currentIndex === index}
                    onClick={() => onSectionClick(index)}
                    getIcon={getIcon}
                    getColor={getColor}
                    getTitle={getTitle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 font-semibold mb-1">
            💡 사용 팁
          </p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• 드래그하여 순서 변경</li>
            <li>• 클릭하면 해당 섹션으로 이동</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

interface SortableTreeItemProps {
  id: number
  section: PageSection
  index: number
  isActive: boolean
  onClick: () => void
  getIcon: (type: string) => string
  getColor: (type: string) => string
  getTitle: (section: PageSection) => string
}

function SortableTreeItem({
  id,
  section,
  index,
  isActive,
  onClick,
  getIcon,
  getColor,
  getTitle
}: SortableTreeItemProps) {
  // 히어로 섹션이 첫 번째에 있으면 드래그 비활성화
  const isHeroLocked = section.type === "Hero" && index === 0
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: isHeroLocked
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-2 p-3 rounded-lg border-2 
        transition-all cursor-pointer
        ${isActive 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
      onClick={onClick}
    >
      {/* 드래그 핸들 */}
      <div
        className={isHeroLocked 
          ? "text-gray-300 cursor-not-allowed" 
          : "cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        }
        {...(isHeroLocked ? {} : { ...attributes, ...listeners })}
        title={isHeroLocked ? "히어로 섹션은 첫 번째 위치에 고정됩니다" : ""}
      >
        ⋮⋮
      </div>

      {/* 아이콘 */}
      <div className="text-xl">
        {getIcon(section.type)}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getColor(section.type)}`}
          >
            {section.type}
          </Badge>
          <span className="text-xs text-gray-500">#{index + 1}</span>
        </div>
        <div className="text-sm font-medium text-gray-900 truncate">
          {getTitle(section)}
        </div>
      </div>

      {/* 활성 표시 */}
      {isActive && (
        <div className="text-blue-500">
          ➤
        </div>
      )}
    </div>
  )
}

