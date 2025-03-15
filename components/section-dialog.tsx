"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Clock, MapPin, Calendar, Plus, Check, X } from "lucide-react"

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
    mode: string
  }>
}

interface SectionDialogProps {
  sections: Section[]
  onSectionSelect: (sectionIndex: string) => void
  selectedSection?: string
  courseTitle?: string
}

export function SectionDialog({ sections, onSectionSelect, selectedSection, courseTitle }: SectionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Find the selected section object
  const selectedSectionObj = selectedSection ? sections.find((s) => s.index === selectedSection) : null

  // Handle click outside to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  // Add this useEffect after the existing useEffect hooks
  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !triggerRef.current || !dialogRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const dialogRect = dialogRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Calculate available space below and above the trigger
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      // Determine if the dialog should appear above or below
      const showAbove = spaceBelow < dialogRect.height && spaceAbove > spaceBelow

      // Calculate left position
      let left = triggerRect.left
      if (left + dialogRect.width > viewportWidth) {
        left = Math.max(16, viewportWidth - dialogRect.width - 16)
      }

      // Set the position
      dialogRef.current.style.top = showAbove
        ? `${Math.max(16, triggerRect.top - dialogRect.height - 8)}px`
        : `${Math.min(triggerRect.bottom + 8, viewportHeight - dialogRect.height - 16)}px`
      dialogRef.current.style.left = `${left}px`
    }

    updatePosition()

    // Add event listeners with debouncing
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updatePosition, 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [isOpen])

  if (!sections || sections.length === 0) {
    return <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">No sections available</div>
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <Button
        ref={triggerRef}
        variant="outline"
        className="w-full justify-between border-[#CC0033] text-gray-700"
        onClick={() => {
          console.log("Custom dialog trigger clicked")
          setIsOpen(!isOpen)
        }}
      >
        {selectedSectionObj
          ? `Section ${selectedSectionObj.number} (Index: ${selectedSectionObj.index})`
          : "Select a section"}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Dialog overlay and content */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-[999]" onClick={() => setIsOpen(false)} />

          {/* Dialog content - positioned relative to trigger */}
          <div
            ref={dialogRef}
            className="fixed z-[1000] w-[90vw] max-w-md bg-white rounded-lg shadow-xl border overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
            }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Select a Section{courseTitle ? ` - ${courseTitle}` : ""}</h2>
                  <p className="text-sm text-gray-500">
                    Choose a section to add to your schedule. Each section has different meeting times and instructors.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Sections list */}
              <div className="space-y-4 max-h-[60vh] overflow-auto pr-2">
                {sections.map((section) => (
                  <div
                    key={section.index}
                    className={`p-4 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${
                      selectedSection === section.index ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => {
                      onSectionSelect(section.index)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-lg font-semibold">Section {section.number}</div>
                        <div className="text-sm text-gray-600">Index: {section.index}</div>
                      </div>
                      <Badge
                        variant={section.status.toLowerCase().includes("open") ? "outline" : "destructive"}
                        className={
                          section.status.toLowerCase().includes("open")
                            ? "bg-green-100 text-green-800 border-green-200"
                            : ""
                        }
                      >
                        {section.status}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Instructor: {section.instructors?.join(", ") || "TBA"}
                      </div>
                    </div>

                    {section.meetingTimes?.map((time, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-3 mb-2 last:mb-0">
                        <div className="font-medium mb-1">
                          {time.mode === "ONLINE INSTRUCTION(INTERNET)"
                            ? "Online Instruction"
                            : time.day || "No meeting day specified"}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {time.mode === "ONLINE INSTRUCTION(INTERNET)" ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              Asynchronous Online Course
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                {time.startTime?.formatted !== "N/A" && time.endTime?.formatted !== "N/A"
                                  ? `${time.startTime.formatted} - ${time.endTime.formatted}`
                                  : "No specific meeting time"}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                {time.building && time.room
                                  ? `${time.building} ${time.room}, ${time.campus}`
                                  : time.campus === "O"
                                    ? "Online"
                                    : "Location TBA"}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        className="bg-[#CC0033] hover:bg-[#A30029]"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSectionSelect(section.index)
                          setIsOpen(false)
                        }}
                      >
                        {selectedSection === section.index ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Select Section
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

