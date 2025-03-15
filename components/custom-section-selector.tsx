"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Clock, MapPin, ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchedule } from "@/context/schedule-context"

interface MeetingTime {
  day: string
  startTime: {
    military: string
    formatted: string
  }
  endTime: {
    military: string
    formatted: string
  }
  building: string
  room: string
  mode: string
  campus: string
}

interface Section {
  number: string
  index: string
  instructors: string[]
  status: string
  meetingTimes: MeetingTime[]
}

interface Course {
  courseString: string
  title: string
  id?: string
  [key: string]: any
}

interface CustomSectionSelectorProps {
  sections: Section[]
  onSectionSelect: (sectionIndex: string) => void
  selectedSection?: string
  course?: Course
}

export function CustomSectionSelector({
  sections,
  onSectionSelect,
  selectedSection,
  course,
}: CustomSectionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownStyles, setDropdownStyles] = useState({
    top: 0,
    left: 0,
    width: 0,
  })
  const { addToSchedule, isInSchedule } = useSchedule()

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      // Calculate width (minimum 300px, maximum 500px, or 200% of trigger width)
      const width = Math.min(500, Math.max(300, triggerRect.width * 2))

      // Calculate left position
      let left = triggerRect.left + scrollX
      if (left + width > viewportWidth + scrollX) {
        left = Math.max(scrollX, viewportWidth + scrollX - width - 20) // 20px padding from viewport edge
      }

      // Calculate if dropdown should open upward
      const spaceBelow = viewportHeight - triggerRect.bottom
      const maxDropdownHeight = 400 // Max height of dropdown

      // If there's not enough space below, position above if there's enough space there
      const top =
        spaceBelow >= maxDropdownHeight
          ? triggerRect.bottom + scrollY
          : triggerRect.top - Math.min(maxDropdownHeight, triggerRect.top) + scrollY

      setDropdownStyles({
        top,
        left,
        width,
      })
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        dropdownRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
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

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  if (!sections || sections.length === 0) {
    return <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">No sections available</div>
  }

  // Find the selected section object
  const selectedSectionObj = selectedSection ? sections.find((s) => s.index === selectedSection) : null

  // Handle adding section to calendar
  const handleAddToCalendar = (section: Section) => {
    if (!course) return

    // Create course object with selected section
    const courseWithSection = {
      ...course,
      selectedSection: section,
    }

    // Add to schedule
    addToSchedule(courseWithSection)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <div
        ref={triggerRef}
        className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
          isOpen ? "border-[#CC0033] ring-2 ring-[#CC0033]/20" : "border-gray-300"
        } hover:border-[#CC0033]`}
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="section-dropdown"
      >
        <span className="text-gray-700">
          {selectedSectionObj
            ? `Section ${selectedSectionObj.number} (Index: ${selectedSectionObj.index})`
            : "Select a section"}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </div>

      {/* Portal for dropdown */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            id="section-dropdown"
            role="listbox"
            className="fixed bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto z-[9999]"
            style={{
              top: `${dropdownStyles.top}px`,
              left: `${dropdownStyles.left}px`,
              width: `${dropdownStyles.width}px`,
              maxHeight: "400px",
            }}
          >
            <div className="sticky top-0 bg-gray-100 p-3 border-b font-medium text-gray-700 flex justify-between items-center">
              <span>Available Sections ({sections.length})</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close dropdown"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>

            {sections.map((section) => (
              <div
                key={section.index}
                role="option"
                aria-selected={selectedSection === section.index}
                className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                  selectedSection === section.index ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium text-base">Section {section.number}</span>
                    <div className="text-sm text-gray-600 font-medium">
                      Index: <span className="text-[#CC0033]">{section.index}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      section.status.toLowerCase().includes("open")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {section.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <div>Instructor: {section.instructors?.join(", ") || "TBA"}</div>
                  </div>

                  {section.meetingTimes && section.meetingTimes.length > 0 && (
                    <div className="mt-3 space-y-3 border-t pt-3">
                      {section.meetingTimes.map((time, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded">
                          <div className="font-medium text-sm text-gray-900">{time.day}</div>
                          <div className="ml-4 flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            {time.startTime?.formatted} - {time.endTime?.formatted}
                          </div>
                          <div className="ml-4 flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1.5" />
                            {time.building} {time.room}, {time.campus}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2 flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-gray-700"
                      onClick={() => {
                        onSectionSelect(section.index)
                        setIsOpen(false)
                      }}
                    >
                      Select
                    </Button>

                    {course && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-[#CC0033] hover:bg-[#A30029]"
                        onClick={() => handleAddToCalendar(section)}
                        disabled={course && isInSchedule(course.id || course.courseString)}
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        {course && isInSchedule(course.id || course.courseString)
                          ? "Added to Calendar"
                          : "Add to Calendar"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

