"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ClassData } from "@/types"

interface SavedCalendars {
  [name: string]: ClassData[]
}

interface ScheduleContextType {
  scheduledClasses: ClassData[]
  allowTimeCollisions: boolean
  setAllowTimeCollisions: (allow: boolean) => void
  addToSchedule: (classData: ClassData) => void
  removeFromSchedule: (id: string) => void
  isInSchedule: (id: string) => boolean
  hasTimeConflict: (classData: ClassData) => boolean

  // Calendar management
  savedCalendars: SavedCalendars
  currentCalendar: string
  saveCalendar: (name: string) => void
  loadCalendar: (name: string) => void
  deleteCalendar: (name: string) => void
  renameCalendar: (oldName: string, newName: string) => void
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined)

interface ScheduleProviderProps {
  children: ReactNode
}

export function ScheduleProvider({ children }: ScheduleProviderProps) {
  const [scheduledClasses, setScheduledClasses] = useState<ClassData[]>([])
  const [allowTimeCollisions, setAllowTimeCollisions] = useState<boolean>(false)
  const [savedCalendars, setSavedCalendars] = useState<SavedCalendars>({})
  const [currentCalendar, setCurrentCalendar] = useState<string>("default")

  // Load saved data from localStorage on initial render
  useEffect(() => {
    // Load schedule
    const savedSchedule = localStorage.getItem("programming-classes-schedule")
    if (savedSchedule) {
      try {
        setScheduledClasses(JSON.parse(savedSchedule))
      } catch (error) {
        console.error("Error parsing saved schedule:", error)
      }
    }

    // Load collision preference
    const collisionPref = localStorage.getItem("allow-time-collisions")
    if (collisionPref !== null) {
      setAllowTimeCollisions(collisionPref === "true")
    }

    // Load saved calendars
    const savedCalendarsData = localStorage.getItem("saved-calendars")
    if (savedCalendarsData) {
      try {
        setSavedCalendars(JSON.parse(savedCalendarsData))
      } catch (error) {
        console.error("Error parsing saved calendars:", error)
      }
    }

    // Load current calendar name
    const currentCalendarName = localStorage.getItem("current-calendar")
    if (currentCalendarName) {
      setCurrentCalendar(currentCalendarName)
    }
  }, [])

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("programming-classes-schedule", JSON.stringify(scheduledClasses))
  }, [scheduledClasses])

  // Save collision preference whenever it changes
  useEffect(() => {
    localStorage.setItem("allow-time-collisions", allowTimeCollisions.toString())
  }, [allowTimeCollisions])

  // Save calendars whenever they change
  useEffect(() => {
    localStorage.setItem("saved-calendars", JSON.stringify(savedCalendars))
  }, [savedCalendars])

  // Save current calendar name whenever it changes
  useEffect(() => {
    localStorage.setItem("current-calendar", currentCalendar)
  }, [currentCalendar])

  // Check if a class has time conflicts with existing scheduled classes
  const hasTimeConflict = (classData: ClassData): boolean => {
    // If collisions are allowed, always return false
    if (allowTimeCollisions) return false

    // If no section is selected, we can't check for conflicts
    if (!classData.selectedSection) return false

    const newSectionMeetingTimes = classData.selectedSection.meetingTimes || []
    if (newSectionMeetingTimes.length === 0) return false

    // Check against each existing class
    for (const existingClass of scheduledClasses) {
      // Skip if no selected section
      if (!existingClass.selectedSection) continue

      const existingSectionMeetingTimes = existingClass.selectedSection.meetingTimes || []
      if (existingSectionMeetingTimes.length === 0) continue

      // Check each meeting time in the new class against each in existing classes
      for (const newMeeting of newSectionMeetingTimes) {
        // Skip online courses with no specific day/time
        if (newMeeting.mode === "ONLINE INSTRUCTION(INTERNET)" && !newMeeting.day) continue
        if (!newMeeting.day || !newMeeting.startTime || !newMeeting.endTime) continue

        for (const existingMeeting of existingSectionMeetingTimes) {
          // Skip online courses with no specific day/time
          if (existingMeeting.mode === "ONLINE INSTRUCTION(INTERNET)" && !existingMeeting.day) continue
          if (!existingMeeting.day || !existingMeeting.startTime || !existingMeeting.endTime) continue

          // If days don't match, no conflict
          if (newMeeting.day !== existingMeeting.day) continue

          // Check time overlap
          const newStart = timeToMinutes(newMeeting.startTime.formatted)
          const newEnd = timeToMinutes(newMeeting.endTime.formatted)
          const existingStart = timeToMinutes(existingMeeting.startTime.formatted)
          const existingEnd = timeToMinutes(existingMeeting.endTime.formatted)

          // Skip if any time is invalid
          if (newStart === 0 && newEnd === 0) continue
          if (existingStart === 0 && existingEnd === 0) continue

          // Check for overlap
          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            return true // Conflict found
          }
        }
      }
    }

    return false // No conflicts
  }

  // Helper to convert time to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0

    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return 0

    let hours = Number.parseInt(match[1])
    const minutes = Number.parseInt(match[2])
    const period = match[3].toUpperCase()

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12
    } else if (period === "AM" && hours === 12) {
      hours = 0
    }

    return hours * 60 + minutes
  }

  // Add a class to the schedule
  const addToSchedule = (classData: ClassData) => {
    // Use courseString-index as ID if available
    const courseId = classData.id || classData.courseString

    // Check if already in schedule
    if (isInSchedule(courseId)) {
      return
    }

    // Check for time conflicts if collisions are not allowed
    if (!allowTimeCollisions && hasTimeConflict(classData)) {
      alert(
        "This class conflicts with another class in your schedule. Enable 'Allow Time Collisions' to add it anyway.",
      )
      return
    }

    setScheduledClasses((prev) => [...prev, classData])
  }

  // Remove a class from the schedule
  const removeFromSchedule = (id: string) => {
    setScheduledClasses((prev) => prev.filter((cls) => (cls.id || cls.courseString) !== id))
  }

  // Check if a class is already in the schedule
  const isInSchedule = (id: string): boolean => {
    return scheduledClasses.some((cls) => (cls.id || cls.courseString) === id)
  }

  // Save current schedule as a named calendar
  const saveCalendar = (name: string) => {
    setSavedCalendars((prev) => ({
      ...prev,
      [name]: [...scheduledClasses],
    }))
    setCurrentCalendar(name)
  }

  // Load a saved calendar
  const loadCalendar = (name: string) => {
    if (savedCalendars[name]) {
      setScheduledClasses([...savedCalendars[name]])
      setCurrentCalendar(name)
    }
  }

  // Delete a saved calendar
  const deleteCalendar = (name: string) => {
    setSavedCalendars((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })

    // If we deleted the current calendar, reset to empty
    if (currentCalendar === name) {
      setScheduledClasses([])
      setCurrentCalendar("default")
    }
  }

  // Rename a calendar
  const renameCalendar = (oldName: string, newName: string) => {
    if (oldName === newName) return

    setSavedCalendars((prev) => {
      const { [oldName]: calendarData, ...rest } = prev
      return {
        ...rest,
        [newName]: calendarData,
      }
    })

    // Update current calendar name if needed
    if (currentCalendar === oldName) {
      setCurrentCalendar(newName)
    }
  }

  return (
    <ScheduleContext.Provider
      value={{
        scheduledClasses,
        allowTimeCollisions,
        setAllowTimeCollisions,
        addToSchedule,
        removeFromSchedule,
        isInSchedule,
        hasTimeConflict,
        savedCalendars,
        currentCalendar,
        saveCalendar,
        loadCalendar,
        deleteCalendar,
        renameCalendar,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider")
  }
  return context
}

