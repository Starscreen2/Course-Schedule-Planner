import { NextResponse } from "next/server"
import type { ClassData } from "@/types"

// Generate fallback class data
function generateFallbackClasses(query: string, term: string): ClassData[] {
  const subjects = [
    { code: "CS", name: "Computer Science" },
    { code: "MATH", name: "Mathematics" },
    { code: "INFO", name: "Information Technology" },
    { code: "DATA", name: "Data Science" },
  ]

  // Add term-specific subjects
  if (term === "0") {
    // Winter
    subjects.push({ code: "WINTER", name: "Winter Special Courses" })
  } else if (term === "7") {
    // Summer
    subjects.push({ code: "SUMMER", name: "Summer Special Courses" })
  } else if (term === "9") {
    // Fall
    subjects.push({ code: "FALL", name: "Fall Special Courses" })
  }

  const classes: ClassData[] = []

  // Generate classes for each subject
  subjects.forEach((subject) => {
    // Skip if query doesn't match subject
    if (
      query &&
      !subject.code.toLowerCase().includes(query.toLowerCase()) &&
      !subject.name.toLowerCase().includes(query.toLowerCase())
    ) {
      return
    }

    // Generate 3-5 classes per subject
    const numClasses = Math.floor(Math.random() * 3) + 3

    for (let i = 1; i <= numClasses; i++) {
      const courseNumber = (i * 100 + Math.floor(Math.random() * 50)).toString()
      const id = `${subject.code}${courseNumber}`
      const courseString = `${subject.code}:${courseNumber}`

      // Generate 2-4 sections per class
      const sections = []
      const numSections = Math.floor(Math.random() * 3) + 2

      for (let j = 1; j <= numSections; j++) {
        const sectionNumber = j.toString().padStart(2, "0")
        const index = (10000 + j).toString()

        // Create multiple meeting times for each section (lecture + recitation)
        const meetingTimes = [
          // Lecture
          {
            day: ["Monday", "Wednesday"][Math.floor(Math.random() * 2)],
            startTime: {
              military: "1030",
              formatted: "10:30 AM",
            },
            endTime: {
              military: "1150",
              formatted: "11:50 AM",
            },
            building: "ARC",
            room: "103",
            mode: "LEC",
            campus: "Busch",
          },
          // Recitation
          {
            day: "Friday",
            startTime: {
              military: "1030",
              formatted: "10:30 AM",
            },
            endTime: {
              military: "1130",
              formatted: "11:30 AM",
            },
            building: "SEC",
            room: j.toString(),
            mode: "REC",
            campus: "Busch",
          },
        ]

        sections.push({
          number: sectionNumber,
          index,
          instructors: ["Professor Smith", "Professor Jones"],
          status: Math.random() > 0.3 ? "OPEN" : "CLOSED",
          comments: "",
          meetingTimes,
        })
      }

      classes.push({
        id,
        courseString,
        name: `${courseString} - Introduction to ${subject.name}`,
        title: `Introduction to ${subject.name}`,
        instructor: "Professor Smith",
        description: `This is a fallback course for ${subject.name}. The real API is currently unavailable.`,
        tags: [subject.code, "Fallback Data", "100-level"],
        credits: "3",
        subject: subject.code,
        subjectDescription: subject.name,
        sections,
        school: "School of Arts and Sciences",
        campusLocations: ["Busch"],
        prerequisites: "None",
        coreCodes: [],
      })
    }
  })

  return classes
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const term = searchParams.get("term") || "1"

  console.log("Using fallback API with query:", query, "and term:", term)

  // Generate fallback data with term parameter
  const fallbackClasses = generateFallbackClasses(query, term)

  return NextResponse.json(fallbackClasses)
}

// Helper function to format military time to AM/PM
function formatTime(militaryTime: string): string {
  if (!militaryTime) return "N/A"

  try {
    const hour = Number.parseInt(militaryTime.substring(0, 2))
    const minutes = militaryTime.substring(2)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12

    return `${displayHour}:${minutes} ${period}`
  } catch {
    return militaryTime
  }
}

