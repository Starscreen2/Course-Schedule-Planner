"use client"

import { useState, useRef } from "react"
import { ChevronDown, ChevronUp, Book, Info, MapPin, Clock, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSchedule } from "@/context/schedule-context"
import { SectionSelectionDialog } from "./section-selection-dialog"

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

interface CoreCode {
  code: string
  description: string
}

interface CourseProps {
  courseString: string
  title: string
  subject: string
  subjectDescription: string
  courseNumber: string
  description: string
  credits: string
  creditsDescription: string
  school: string
  campusLocations: string[]
  prerequisites: string
  coreCodes: CoreCode[]
  sections: Section[]
  onAddToSchedule?: (courseId: string, sectionIndex?: string) => void
}

export function CourseAccordion({
  courseString,
  title,
  subject,
  subjectDescription,
  courseNumber,
  description,
  credits,
  school,
  campusLocations,
  prerequisites,
  coreCodes,
  sections = [],
  onAddToSchedule,
}: CourseProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const { addToSchedule, isInSchedule } = useSchedule()

  const triggerRef = useRef<HTMLDivElement>(null)

  const hasSections = sections && Array.isArray(sections) && sections.length > 0

  const handleAddToSchedule = () => {
    if (!selectedSection) return

    const courseWithSection = {
      courseString,
      title,
      id: courseString,
      selectedSection,
    }

    addToSchedule(courseWithSection)
  }

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section)
    setIsSectionDialogOpen(false)
  }

  return (
    <div className="border rounded-lg shadow mb-4 overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="w-full text-left py-3 px-4 bg-gray-100 hover:bg-gray-200 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="font-semibold text-lg">
            {courseString} - {title}
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            {credits} credits • {subject} • {campusLocations.join(", ")}
          </div>
        </div>
        <div className="flex items-center">
          {hasSections && (
            <Badge variant="outline" className="mr-2">
              {sections.length} section{sections.length !== 1 ? "s" : ""}
            </Badge>
          )}
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </div>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 py-3 bg-white border-t">
          {/* Course details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <p className="flex items-center text-sm">
                <Book className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">School:</span>
                {school}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Prerequisites:</span> {prerequisites || "None"}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Core Codes:</span>{" "}
                {coreCodes && coreCodes.length > 0
                  ? coreCodes.map((code) => `${code.code} (${code.description})`).join(", ")
                  : "None"}
              </p>
            </div>
            <div>
              {description && (
                <div>
                  <h3 className="font-medium mb-1 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-gray-500" />
                    Description
                  </h3>
                  <p className="text-sm text-gray-700">{description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sections selection */}
          {hasSections && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-[#CC0033]">Available Sections ({sections.length})</h3>
              </div>

              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal"
                onClick={(e) => {
                  // Update the invisible reference element position to match the button
                  if (triggerRef.current) {
                    const buttonRect = (e.target as HTMLElement).getBoundingClientRect()
                    triggerRef.current.style.position = "absolute"
                    triggerRef.current.style.top = `${buttonRect.top + window.scrollY}px`
                    triggerRef.current.style.left = `${buttonRect.left + window.scrollX}px`
                    triggerRef.current.style.width = `${buttonRect.width}px`
                    triggerRef.current.style.height = `${buttonRect.height}px`
                  }
                  setIsSectionDialogOpen(true)
                }}
              >
                {selectedSection ? (
                  <span>
                    Section {selectedSection.number} (Index: {selectedSection.index})
                  </span>
                ) : (
                  "Select a section"
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>

              {/* Selected section details */}
              {selectedSection && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Selected Section Details</h4>
                  {selectedSection.meetingTimes?.map((time, idx) => (
                    <div key={idx} className="mb-2 last:mb-0">
                      <div className="font-medium">{time.day}</div>
                      <div className="text-sm space-y-1 ml-4">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {time.startTime?.formatted} - {time.endTime?.formatted}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1.5" />
                          {time.building} {time.room}, {time.campus}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add to Schedule Button */}
          <Button
            onClick={handleAddToSchedule}
            className="w-full mt-4 bg-[#CC0033] hover:bg-[#A30029]"
            disabled={!selectedSection || isInSchedule(courseString)}
          >
            {isInSchedule(courseString) ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added to Schedule
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {selectedSection ? "Add to Schedule" : "Select a Section First"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Section Selection Dialog */}
      <div ref={triggerRef} style={{ display: "none" }}>
        {/* This is an invisible reference element for positioning */}
      </div>
      <SectionSelectionDialog
        isOpen={isSectionDialogOpen}
        onClose={() => setIsSectionDialogOpen(false)}
        sections={sections}
        onSelectSection={handleSectionSelect}
        courseTitle={title}
        triggerElement={triggerRef.current}
      />
    </div>
  )
}

