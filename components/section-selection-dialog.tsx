"use client"

import { Clock, MapPin, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"

interface Section {
  number: string
  index: string
  instructors: string[]
  status: string
  meetingTimes: Array<{
    day: string
    startTime: { formatted: string }
    endTime: { formatted: string }
    building: string
    room: string
    campus: string
  }>
}

interface SectionSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  sections: Section[]
  onSelectSection: (section: Section) => void
  courseTitle: string
  triggerElement?: HTMLElement | null
}

export function SectionSelectionDialog({
  isOpen,
  onClose,
  sections,
  onSelectSection,
  courseTitle,
  triggerElement,
}: SectionSelectionDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Position the dialog relative to the trigger element
  useEffect(() => {
    if (!isOpen || !triggerElement || !dialogRef.current) return

    const updatePosition = () => {
      if (!dialogRef.current) return

      const triggerRect = triggerElement.getBoundingClientRect()
      const dialogRect = dialogRef.current.getBoundingClientRect()

      // Check if dialog would go off-screen
      const rightOverflow = triggerRect.left + dialogRect.width > window.innerWidth
      const bottomOverflow = triggerRect.bottom + dialogRect.height > window.innerHeight

      // Position the dialog
      dialogRef.current.style.position = "fixed"
      dialogRef.current.style.top = bottomOverflow
        ? `${triggerRect.top - dialogRect.height - 8}px`
        : `${triggerRect.bottom + 8}px`

      dialogRef.current.style.left = rightOverflow
        ? `${triggerRect.right - dialogRect.width}px`
        : `${triggerRect.left}px`

      dialogRef.current.style.maxHeight = "80vh"
      dialogRef.current.style.maxWidth = "90vw"
      dialogRef.current.style.width = "400px"
      dialogRef.current.style.zIndex = "100"
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen, triggerElement])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />

      {/* Dialog content */}
      <div ref={dialogRef} className="bg-white rounded-lg shadow-lg border overflow-y-auto">
        <div className="p-4 sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Select a Section - {courseTitle}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {sections.map((section) => (
            <div key={section.index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {/* Section content remains the same */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">Section {section.number}</h3>
                  <p className="text-sm text-gray-600">Index: {section.index}</p>
                  <p className="text-sm text-gray-600">Instructor: {section.instructors?.join(", ") || "TBA"}</p>
                </div>
                <Badge
                  variant={section.status.toLowerCase().includes("open") ? "outline" : "destructive"}
                  className={
                    section.status.toLowerCase().includes("open") ? "bg-green-100 text-green-800 border-green-200" : ""
                  }
                >
                  {section.status}
                </Badge>
              </div>

              {section.meetingTimes?.map((time, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2 mb-2 last:mb-0">
                  <div className="font-medium text-sm">{time.day}</div>
                  <div className="ml-4 text-sm space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {time.startTime.formatted} - {time.endTime.formatted}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      {time.building} {time.room}, {time.campus}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={() => {
                  onSelectSection(section)
                  onClose()
                }}
                className="w-full mt-3 bg-[#CC0033] hover:bg-[#A30029]"
              >
                Select Section
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

