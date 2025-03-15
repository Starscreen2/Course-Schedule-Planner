"use client"

import { useState, useEffect } from "react"
import { User, Clock, Calendar, Check, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ClassData } from "@/types"
import { useSchedule } from "@/context/schedule-context"
import { SectionSelector } from "./section-selector"

interface CourseCardProps {
  course: ClassData
}

export function CourseCard({ course }: CourseCardProps) {
  const [showSections, setShowSections] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const { addToSchedule, isInSchedule } = useSchedule()
  const [sectionsData, setSectionsData] = useState<any[]>([])

  // Debug logging for sections
  useEffect(() => {
    if (course.sections) {
      console.log(
        `Course ${course.courseString || course.name} has ${course.sections.length} sections:`,
        course.sections,
      )
      setSectionsData(course.sections)
    } else {
      console.log(`Course ${course.courseString || course.name} has no sections data`)
    }
  }, [course])

  // Handle adding a course with a specific section
  const handleAddCourse = (sectionIndex?: string) => {
    // If a section is selected, create a modified course with that section's details
    if (sectionIndex && course.sections) {
      const section = course.sections.find((s) => s.index === sectionIndex)
      if (section) {
        const courseWithSection = {
          ...course,
          selectedSection: section,
          // Update schedule info based on the selected section
          schedule: {
            days: section.meetingTimes?.[0]?.day
              ? [section.meetingTimes[0].day]
              : section.meetingTimes?.[0]?.meetingDay
                ? [formatDay(section.meetingTimes[0].meetingDay)]
                : [],
            time: section.meetingTimes?.[0]
              ? `${formatTime(section.meetingTimes[0].startTimeMilitary || section.meetingTimes[0].startTime?.military)} - ${formatTime(section.meetingTimes[0].endTimeMilitary || section.meetingTimes[0].endTime?.military)}`
              : "N/A",
          },
        }
        addToSchedule(courseWithSection)
      }
    } else {
      // Add the course without a specific section
      addToSchedule(course)
    }
  }

  // Helper function to format day codes
  const formatDay = (dayCode: string): string => {
    const dayMap: Record<string, string> = {
      M: "Monday",
      T: "Tuesday",
      W: "Wednesday",
      TH: "Thursday",
      H: "Thursday",
      F: "Friday",
      S: "Saturday",
      U: "Sunday",
    }
    return dayMap[dayCode] || dayCode
  }

  // Helper function to format military time
  const formatTime = (militaryTime?: string): string => {
    if (!militaryTime) return "N/A"

    try {
      const hour = Number.parseInt(militaryTime.substring(0, 2))
      const minutes = militaryTime.substring(2, 4)
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${period}`
    } catch (e) {
      return militaryTime
    }
  }

  // Get instructor name from course or first section
  const getInstructor = (): string => {
    if (course.instructor) return course.instructor

    if (course.sections && course.sections.length > 0) {
      const section = course.sections[0]
      if (section.instructors) {
        if (typeof section.instructors[0] === "string") {
          return section.instructors[0]
        } else if (typeof section.instructors[0] === "object" && section.instructors[0]?.name) {
          return section.instructors[0].name
        }
      }
    }

    return "Instructor TBA"
  }

  // Check if we have valid sections data
  const hasSections = sectionsData && sectionsData.length > 0

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4">
        <h3 className="text-xl font-bold">{course.name || course.title || course.courseString}</h3>
        <p className="text-sm text-gray-600 flex items-center mt-1">
          <User className="h-3.5 w-3.5 mr-1" />
          {getInstructor()}
        </p>
      </div>

      <div className="border-t border-gray-200 p-4">
        {course.schedule && course.schedule.time !== "N/A" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              <span>{course.schedule.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {Array.isArray(course.schedule.days) ? course.schedule.days.join(", ") : course.schedule.days}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {course.tags &&
            course.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>

        {/* Sections Toggle Button - Always show this */}
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Available Sections:</h4>
            <span className="text-xs text-gray-500">{course.sections.length} section(s)</span>
          </div>

          <SectionSelector
            sections={course.sections}
            selectedSection={selectedSection}
            onSectionSelect={(index) => {
              setSelectedSection(index)
              // Add the course with the selected section
              addToSchedule({ ...course, selectedSection: course.sections.find((s) => s.index === index) })
            }}
          />
        </div>

        {/* Debug info for sections */}
        {!hasSections && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            No sections data available for this course
          </div>
        )}

        {/* Add to Schedule Button - Only shown when sections are hidden or no sections */}
        {(!showSections || !hasSections) && (
          <Button
            className="w-full mt-4"
            variant={isInSchedule(course.id || course.courseString) ? "outline" : "default"}
            onClick={() => handleAddCourse()}
            disabled={isInSchedule(course.id || course.courseString)}
          >
            {isInSchedule(course.id || course.courseString) ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added to Schedule
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add to Schedule
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

