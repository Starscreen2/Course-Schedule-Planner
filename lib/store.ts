import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define the course type
type Course = {
  id: string
  index: string
  name: string
  section: string
  time: {
    day: string
    start: string
    end: string
  }
  location: string
  available: boolean
}

// Define the schedule store type
type ScheduleStore = {
  // Current courses in the schedule
  courses: Course[]

  // UI state
  showPlanner: boolean

  // Saved schedules
  savedSchedules: Record<string, Course[]>
  currentSchedule: string

  // Actions
  addCourse: (course: Course) => void
  removeCourse: (courseId: string) => void
  setShowPlanner: (show: boolean) => void
  hasTimeConflict: (course: Course) => boolean
  saveSchedule: (name: string) => void
  loadSchedule: (name: string) => void
  deleteSchedule: (name: string) => void
  setCurrentSchedule: (name: string) => void
  createNewSchedule: () => void
}

// Helper function to check if two time ranges overlap
const doTimesOverlap = (day1: string, start1: string, end1: string, day2: string, start2: string, end2: string) => {
  if (day1 !== day2) return false

  // Convert times to minutes for easier comparison
  const convertToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const start1Min = convertToMinutes(start1)
  const end1Min = convertToMinutes(end1)
  const start2Min = convertToMinutes(start2)
  const end2Min = convertToMinutes(end2)

  // Check for overlap
  return start1Min < end2Min && end1Min > start2Min
}

// Create the store with persistence
export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      courses: [],
      showPlanner: false,
      savedSchedules: {},
      currentSchedule: "default",

      // Actions
      addCourse: (course) => {
        // Check if course already exists
        const exists = get().courses.some((c) => c.id === course.id)
        if (exists) return

        // Add course
        set((state) => ({
          courses: [...state.courses, course],
        }))
      },

      removeCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== courseId),
        }))
      },

      setShowPlanner: (show) => {
        set({ showPlanner: show })
      },

      hasTimeConflict: (newCourse) => {
        return get().courses.some((existingCourse) =>
          doTimesOverlap(
            existingCourse.time.day,
            existingCourse.time.start,
            existingCourse.time.end,
            newCourse.time.day,
            newCourse.time.start,
            newCourse.time.end,
          ),
        )
      },

      saveSchedule: (name) => {
        set((state) => ({
          savedSchedules: {
            ...state.savedSchedules,
            [name]: [...state.courses],
          },
          currentSchedule: name,
        }))
      },

      loadSchedule: (name) => {
        const schedule = get().savedSchedules[name] || []
        set({
          courses: [...schedule],
          currentSchedule: name,
        })
      },

      deleteSchedule: (name) => {
        set((state) => {
          const { [name]: _, ...rest } = state.savedSchedules
          return {
            savedSchedules: rest,
            // If we're deleting the current schedule, reset to empty
            courses: state.currentSchedule === name ? [] : state.courses,
            currentSchedule: state.currentSchedule === name ? "default" : state.currentSchedule,
          }
        })
      },

      setCurrentSchedule: (name) => {
        set({ currentSchedule: name })
      },

      createNewSchedule: () => {
        set({
          courses: [],
          currentSchedule: "default",
        })
      },
    }),
    {
      name: "course-schedule-storage",
      // Only persist these keys
      partialize: (state) => ({
        savedSchedules: state.savedSchedules,
        currentSchedule: state.currentSchedule,
      }),
    },
  ),
)

