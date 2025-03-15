"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, User, Plus, Check } from "lucide-react"
import { SectionDialog } from "./section-dialog"

export function SimpleCourseCard({ course }) {
  const { addToSchedule, isInSchedule } = useSchedule()
  const [expandedDescription, setExpandedDescription] = useState(false)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null)

  // Handle courses with missing data
  if (!course) return null

  const hasSections = course.sections && course.sections.length > 0
  const firstSection = hasSections ? course.sections[0] : null
  const hasMeetingTimes = firstSection && firstSection.meetingTimes && firstSection.meetingTimes.length > 0

  const handleSectionSelect = (sectionIndex) => {
    console.log("Section selected:", sectionIndex)
    setSelectedSectionIndex(sectionIndex)

    // Find the selected section
    const selectedSection = course.sections.find((s) => s.index === sectionIndex)
    if (selectedSection) {
      // Add the course with the selected section
      addToSchedule({
        ...course,
        id: course.id || course.courseString, // Ensure we have an ID
        selectedSection,
      })
    }
  }

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm">
      <CardHeader className="pb-2 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{course.title || "Untitled Course"}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {course.courseString} • {course.credits || "?"} credits
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-white">
            {course.subject}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {course.description && (
          <div className="mb-4">
            <p className={`text-sm text-gray-700 ${!expandedDescription && "line-clamp-2"}`}>{course.description}</p>
            {course.description.length > 120 && (
              <button
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                {expandedDescription ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {hasMeetingTimes && (
          <div className="space-y-2 mb-3">
            {firstSection.meetingTimes.map((meetingTime, index) => (
              <div key={index}>
                {meetingTime.day && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{meetingTime.day}</span>
                  </div>
                )}
                {meetingTime.startTime?.formatted && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {meetingTime.startTime.formatted} - {meetingTime.endTime?.formatted || "?"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {course.instructor && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <User className="h-3.5 w-3.5" />
            <span>{course.instructor}</span>
          </div>
        )}

        {hasSections && (
          <div className="mt-3 border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Available Sections:</h4>
              <span className="text-xs text-gray-500">{course.sections.length} section(s)</span>
            </div>

            <SectionDialog
              sections={course.sections}
              selectedSection={selectedSectionIndex}
              onSectionSelect={handleSectionSelect}
              courseTitle={course.title}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50">
        <Button
          className="w-full"
          variant={isInSchedule(course.id) ? "outline" : "default"}
          onClick={() => {
            if (hasSections && !selectedSectionIndex) {
              alert("Please select a section first")
              return
            }
            if (!hasSections) {
              addToSchedule(course)
            }
            // If we have sections and a selected section, it's already been added by handleSectionSelect
          }}
          disabled={isInSchedule(course.id)}
        >
          {isInSchedule(course.id) ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Added to Schedule
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {hasSections && !selectedSectionIndex ? "Select a Section First" : "Add to Schedule"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

