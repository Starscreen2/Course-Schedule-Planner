"use client"

import { useMemo } from "react"
import type { ClassData } from "@/types"
import { X, ExternalLink, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { CampusName } from "./schedule-planner"

interface WeeklyCalendarProps {
  scheduledClasses: ClassData[]
  onRemoveClass: (id: string) => void
  campusColors: Record<CampusName, string>
}

// Calendar configuration
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const START_HOUR = 7 // 7 AM
const END_HOUR = 23 // 11 PM
const HOUR_HEIGHT = 60 // pixels per hour

// Helper function to convert time string to hours
const timeToHours = (timeStr: string): number => {
  if (!timeStr) return START_HOUR

  // Parse time like "10:00 AM" or "2:30 PM"
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return START_HOUR

  let hours = Number.parseInt(match[1])
  const minutes = Number.parseInt(match[2])
  const period = match[3].toUpperCase()

  // Convert to 24-hour format
  if (period === "PM" && hours !== 12) {
    hours += 12
  } else if (period === "AM" && hours === 12) {
    hours = 0
  }

  return hours + minutes / 60
}

// Campus ID to name mapping
const CAMPUS_ID_MAP: Record<string, string> = {
  "1": "College Ave",
  "2": "Busch",
  "3": "Livingston",
  "4": "Cook/Douglass",
}

// Building code to campus mapping
const BUILDING_TO_CAMPUS: Record<string, string> = {
  // Busch Campus
  ARC: "2",
  SEC: "2",
  RWH: "2",
  HILL: "2",
  LSH: "2",
  BCC: "2",
  CCB: "2",
  SERC: "2",

  // College Avenue
  AB: "1",
  ABW: "1",
  HH: "1",
  SC: "1",
  MU: "1",
  VH: "1",

  // Livingston
  TIL: "3",
  BE: "3",
  LCB: "3",
  BRR: "3",
  LSC: "3",

  // Cook/Douglass
  HCK: "4",
  FSH: "4",
  RAB: "4",
  BIO: "4",
  CDL: "4",
}

// Get background color based on meeting mode and campus
const getEventColor = (campus: string, mode: string, campusColors: Record<CampusName, string>, building?: string) => {
  // Use a uniform background color for all events
  const uniformBackgroundColor = "bg-blue-100 border-blue-200 text-blue-800"

  // Get campus color for the left border
  const getCampusColor = (campus: string, building?: string) => {
    if (!campus && !building) return ""

    // Check building code first
    if (building && BUILDING_TO_CAMPUS[building]) {
      const campusId = BUILDING_TO_CAMPUS[building]
      const campusName = CAMPUS_ID_MAP[campusId]
      if (campusName === "College Ave") return "border-l-4 border-l-red-500"
      if (campusName === "Busch") return "border-l-4 border-l-blue-500"
      if (campusName === "Livingston") return "border-l-4 border-l-green-500"
      if (campusName === "Cook/Douglass") return "border-l-4 border-l-orange-500"
    }

    // Normalize campus name for matching text-based campus names
    const normalizedCampus = campus.toLowerCase().trim()

    if (normalizedCampus.includes("college") || normalizedCampus.includes("cac") || normalizedCampus === "1")
      return "border-l-4 border-l-red-500"
    if (normalizedCampus.includes("busch") || normalizedCampus.includes("bus") || normalizedCampus === "2")
      return "border-l-4 border-l-blue-500"
    if (normalizedCampus.includes("livingston") || normalizedCampus.includes("liv") || normalizedCampus === "3")
      return "border-l-4 border-l-green-500"
    if (
      normalizedCampus.includes("cook") ||
      normalizedCampus.includes("douglass") ||
      normalizedCampus.includes("d/c") ||
      normalizedCampus === "4"
    )
      return "border-l-4 border-l-orange-500"
    if (normalizedCampus.includes("online") || normalizedCampus.includes("remote"))
      return "border-l-4 border-l-purple-500"

    return "border-l-4 border-l-gray-500" // Default for unknown campus
  }

  const campusClass = getCampusColor(campus, building)

  // Combine uniform background with campus border
  return `${uniformBackgroundColor} ${campusClass}`
}

export default function WeeklyCalendar({ scheduledClasses, onRemoveClass, campusColors }: WeeklyCalendarProps) {
  // Process classes into calendar events
  const calendarEvents = useMemo(() => {
    const events: {
      day: string
      class: ClassData
      section: any
      meetingTime: any
      top: number
      height: number
    }[] = []

    scheduledClasses.forEach((cls) => {
      if (cls.selectedSection) {
        // For each section, process all its meeting times
        if (cls.selectedSection.meetingTimes && cls.selectedSection.meetingTimes.length > 0) {
          // Multiple meeting times per section (e.g., lecture + recitation)
          cls.selectedSection.meetingTimes.forEach((meetingTime) => {
            if (!meetingTime) return

            // Skip online courses with no specific day/time
            if (meetingTime.mode === "ONLINE INSTRUCTION(INTERNET)" && !meetingTime.day) return

            const day = meetingTime.day
            if (!day || !DAYS.includes(day)) return

            // Parse start and end times
            const startTime = meetingTime.startTime?.formatted
            const endTime = meetingTime.endTime?.formatted
            if (!startTime || !endTime || startTime === "N/A" || endTime === "N/A") return

            const startHour = timeToHours(startTime)
            const endHour = timeToHours(endTime)

            // Calculate position and height
            const top = (startHour - START_HOUR) * HOUR_HEIGHT
            const height = (endHour - startHour) * HOUR_HEIGHT

            events.push({
              day,
              class: cls,
              section: cls.selectedSection,
              meetingTime,
              top,
              height: Math.max(height, 30), // Minimum height of 30px
            })
          })
        }
      } else if (cls.schedule) {
        // Fallback to basic schedule if no section is selected
        const { days, time } = cls.schedule
        if (!time || time === "N/A") return

        const [startTimeStr, endTimeStr] = time.split(" - ")
        const startHour = timeToHours(startTimeStr)
        const endHour = timeToHours(endTimeStr)

        const top = (startHour - START_HOUR) * HOUR_HEIGHT
        const height = (endHour - startHour) * HOUR_HEIGHT

        const dayArray = Array.isArray(days) ? days : [days]
        dayArray.forEach((day) => {
          if (DAYS.includes(day)) {
            events.push({
              day,
              class: cls,
              section: null,
              meetingTime: {
                startTime: { formatted: startTimeStr },
                endTime: { formatted: endTimeStr },
                mode: "LEC",
                building: "",
                room: "",
                campus: "",
              },
              top,
              height: Math.max(height, 30),
            })
          }
        })
      }
    })

    return events
  }, [scheduledClasses])

  // Calculate calendar height (add 1 to include the full last hour)
  const calendarHeight = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT

  // Generate time labels
  const timeLabels = []
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? "PM" : "AM"
    timeLabels.push(
      <div
        key={hour}
        className="text-xs text-gray-500"
        style={{
          position: "absolute",
          top: (hour - START_HOUR) * HOUR_HEIGHT,
          left: 0,
          height: HOUR_HEIGHT,
          display: "flex",
          alignItems: "start",
          paddingTop: "4px",
        }}
      >
        {displayHour} {period}
      </div>,
    )
  }

  // Generate WebReg URL with index numbers
  const getWebRegUrl = () => {
    const indexNumbers = scheduledClasses
      .filter((cls) => cls.selectedSection?.index)
      .map((cls) => cls.selectedSection.index)
      .filter(Boolean)
      .join(",")

    return `https://sims.rutgers.edu/webreg/editSchedule.htm?indexList=${indexNumbers}`
  }

  // Copy URL to clipboard
  const copyWebRegUrl = () => {
    const url = getWebRegUrl()
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Registration link copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err)
        alert("Failed to copy URL. Please try again.")
      })
  }

  const webRegUrl = getWebRegUrl()
  const hasIndexNumbers = webRegUrl.includes("=") && webRegUrl.split("=")[1].length > 0

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="relative" style={{ height: `${calendarHeight}px` }}>
        {/* Time labels */}
        <div className="absolute top-0 left-0 w-16">{timeLabels}</div>

        {/* Calendar grid */}
        <div className="ml-16 grid grid-cols-5 gap-1" style={{ height: `${calendarHeight}px` }}>
          {DAYS.map((day) => (
            <div key={day} className="relative flex flex-col h-full">
              <div className="text-center font-medium text-sm mb-2 sticky top-0 bg-white z-10">{day}</div>
              <div className="relative border border-gray-200 rounded-md flex-1">
                {/* Hour lines - add 1 to include line for the last hour */}
                {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-gray-100" style={{ top: i * HOUR_HEIGHT }} />
                ))}

                {/* Class blocks */}
                {calendarEvents
                  .filter((event) => event.day === day)
                  .map((event, idx) => (
                    <TooltipProvider key={`${event.class.id}-${event.meetingTime.mode}-${idx}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute w-full px-2 py-1 rounded text-xs overflow-hidden border group hover:shadow-md transition-shadow ${getEventColor(
                              event.meetingTime.campus,
                              event.meetingTime.mode,
                              campusColors,
                              event.meetingTime.building,
                            )}`}
                            style={{
                              top: event.top,
                              height: event.height,
                              minHeight: "20px",
                            }}
                          >
                            {/* Course title and remove button */}
                            <div className="flex justify-between items-start">
                              <div className="font-medium truncate">
                                {event.class.title || event.class.name || event.class.courseString}
                                <Badge variant="outline" className="ml-1 text-[0.6rem] px-1 py-0">
                                  {event.meetingTime.mode || "LEC"}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-3.5 w-3.5 p-0 opacity-0 group-hover:opacity-70 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRemoveClass(event.class.id)
                                }}
                              >
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>

                            {/* Time */}
                            <div className="text-[0.6rem] mt-0.5">
                              {event.meetingTime.startTime?.formatted} - {event.meetingTime.endTime?.formatted}
                            </div>

                            {/* Section and Location */}
                            {event.class.selectedSection && (
                              <>
                                <div className="text-[0.65rem] mt-0.5 font-medium">
                                  Section {event.class.selectedSection.number}
                                  {event.class.selectedSection.index && (
                                    <span className="text-[0.6rem]"> (Index: {event.class.selectedSection.index})</span>
                                  )}
                                </div>
                                <div className="text-[0.6rem]">
                                  {event.meetingTime.building} {event.meetingTime.room}
                                </div>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium">{event.class.title || event.class.name}</p>
                              <p className="text-xs text-gray-500">{event.class.courseString}</p>
                            </div>
                            {event.class.selectedSection && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  Section {event.class.selectedSection.number} (Index:{" "}
                                  {event.class.selectedSection.index})
                                </p>
                                <p className="text-sm">
                                  Instructor: {event.class.selectedSection.instructors?.join(", ") || "TBA"}
                                </p>
                              </div>
                            )}
                            <div className="space-y-1 border-t pt-1">
                              <p className="text-sm">
                                Room: {event.meetingTime.building} {event.meetingTime.room}
                              </p>
                              <p className="text-sm">
                                Campus: {CAMPUS_ID_MAP[event.meetingTime.campus] || event.meetingTime.campus}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="mt-4 flex items-center gap-2">
        <a
          href={webRegUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md ${
            hasIndexNumbers
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          onClick={(e) => !hasIndexNumbers && e.preventDefault()}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Register in WebReg
        </a>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={copyWebRegUrl}
                disabled={!hasIndexNumbers}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Save this link and use it when registration opens. It will automatically add all selected courses to
                your registration cart.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("Are you sure you want to clear all courses from your calendar?")) {
              scheduledClasses.forEach((cls) => onRemoveClass(cls.id || cls.courseString))
            }
          }}
          className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Clear Calendar
        </Button>
      </div>
    </div>
  )
}

