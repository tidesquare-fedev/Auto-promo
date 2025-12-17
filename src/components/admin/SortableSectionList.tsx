import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PageSection } from "@/types/page"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackgroundColorControl } from "./BackgroundColorControl"

interface SortableSectionListProps {
  sections: PageSection[]
  onReorder: (sections: PageSection[]) => void
  renderSection: (
    section: PageSection,
    index: number,
    onUpdate: (index: number, section: PageSection) => void,
    onRemove: (index: number) => void
  ) => React.ReactNode
  onUpdate: (index: number, section: PageSection) => void
  onRemove: (index: number) => void
  readOnly?: boolean
}

export function SortableSectionList({
  sections,
  onReorder,
  renderSection,
  onUpdate,
  onRemove,
  readOnly = false
}: SortableSectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((_, idx) => idx === active.id)
      const newIndex = sections.findIndex((_, idx) => idx === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex)
        onReorder(newSections)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((_, idx) => idx)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sections.map((section, index) => (
            <SortableSection
              key={index}
              id={index}
              section={section}
              index={index}
              onUpdate={onUpdate}
              readOnly={readOnly}
            >
              {renderSection(section, index, onUpdate, onRemove)}
            </SortableSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableSection({
  id,
  section,
  index,
  children,
  onUpdate,
  readOnly = false
}: {
  id: number
  section: PageSection
  index: number
  children: React.ReactNode
  onUpdate: (index: number, section: PageSection) => void
  readOnly?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} data-section-index={index}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                ⋮⋮
              </Button>
              <Badge variant="outline">{section.type}</Badge>
              <span className="text-sm text-muted-foreground">
                섹션 {index + 1}
              </span>
            </div>
            {!readOnly && (
              <BackgroundColorControl
                color={section.style?.backgroundColor}
                onColorChange={(color) => {
                  onUpdate(index, {
                    ...section,
                    style: { ...section.style, backgroundColor: color || undefined }
                  } as PageSection)
                }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}

