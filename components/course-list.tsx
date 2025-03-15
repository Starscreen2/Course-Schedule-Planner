"use client"
import { useScheduleStore } from "@/lib/store"

// Update the MeetingTime interface to match our new data structure
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

export function CourseList() {
  const { addCourse, showPlanner, setShowPlanner, hasTimeConflict } = useScheduleStore()

  const handleAddCourse = (course) => {
    // Check for time conflicts
    if (hasTimeConflict(course)) {
      alert("This course conflicts with another course in your schedule.")
      return
    }

    // Add course and ensure planner is visible
    addCourse(course)
    if (!showPlanner) {
      setShowPlanner(true)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* The hardcoded sample courses have been removed */}
      {/* The courses will now be populated from the Rutgers API */}
    </div>
  )
}

