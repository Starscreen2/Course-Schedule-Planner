"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

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

interface CourseProps {
  courseString: string
  title: string
  subject: string
  subjectDescription: string
  credits: string
  school: string
  campusLocations: string[]
  prerequisites: string
  coreCodes: Array<{ code: string; description: string }>
  sections: Section[]
}

export function CourseDisplay({
  courseString,
  title,
  subject,
  subjectDescription,
  credits,
  school,
  campusLocations,
  prerequisites,
  coreCodes,
  sections,
}: CourseProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-lg bg-white mb-4">
      {/* Course Header */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">
          {courseString} - {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2">
              <span className="font-bold">Subject:</span> {subject} - {subjectDescription}
            </div>
            <div className="mb-2">
              <span className="font-bold">Credits:</span> {credits}
            </div>
            <div className="mb-2">
              <span className="font-bold">School:</span> {school}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-bold">Campus Locations:</span> {campusLocations.join(", ")}
            </div>
            <div className="mb-2">
              <span className="font-bold">Prerequisites:</span> {prerequisites || "None"}
            </div>
            <div className="mb-2">
              <span className="font-bold">Core Codes:</span>{" "}
              {coreCodes.map((code) => `${code.code} (${code.description})`).join(", ") || "None"}
            </div>
          </div>
        </div>

        {/* Sections Button */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 bg-[#4A90E2] hover:bg-[#357ABD] text-white w-auto"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          Show/Hide {sections.length} Section{sections.length !== 1 ? "s" : ""}
        </Button>
      </div>

      {/* Sections Dropdown Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Section</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Index</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Time</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Location</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Instructor</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.index} className="border-t border-gray-200">
                    <td className="px-4 py-2">{section.number}</td>
                    <td className="px-4 py-2">{section.index}</td>
                    <td className="px-4 py-2">
                      {section.meetingTimes.map((time, i) => (
                        <div key={i}>
                          {time.day} {time.startTime.formatted}-{time.endTime.formatted}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      {section.meetingTimes.map((time, i) => (
                        <div key={i}>
                          {time.building} {time.room}, {time.campus}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">{section.instructors.join(", ") || "TBA"}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          section.status.toLowerCase() === "open"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {section.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

