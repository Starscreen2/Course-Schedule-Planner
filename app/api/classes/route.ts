import { NextResponse } from "next/server"
import type { ClassData } from "@/types"

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

// Helper function to convert meeting times to our format
function formatMeetingTimes(meetingTimes: any[]): { days: string[]; time: string } {
  if (!meetingTimes || meetingTimes.length === 0) {
    return { days: [], time: "N/A" }
  }

  // Map day codes to full names
  const dayMap: Record<string, string> = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    TH: "Thursday",
    F: "Friday",
    S: "Saturday",
    U: "Sunday",
  }

  // Get unique days
  const days = Array.from(new Set(meetingTimes.map((mt) => dayMap[mt.meetingDay] || mt.meetingDay))).filter(Boolean)

  // Get time range from first meeting time (assuming all meeting times are the same)
  const firstMeeting = meetingTimes[0]
  const startTime = formatTime(firstMeeting.startTimeMilitary)
  const endTime = formatTime(firstMeeting.endTimeMilitary)
  const time = `${startTime} - ${endTime}`

  return { days, time }
}

// Convert Rutgers API course to our ClassData format
function convertToClassData(course: any): ClassData {
  try {
    // Get the first section for basic info
    const firstSection = course.sections && course.sections.length > 0 ? course.sections[0] : {}
    const firstInstructor =
      firstSection.instructors && firstSection.instructors.length > 0 ? firstSection.instructors[0].name : "TBA"

    // Get meeting times from first section
    const schedule = formatMeetingTimes(firstSection.meetingTimes || [])

    // Generate tags from subject, course level, etc.
    const tags = [
      course.subject,
      course.courseNumber?.substring(0, 1) + "00 level",
      ...(course.campusLocations || []).map((loc: any) => loc.description),
    ].filter(Boolean)

    return {
      id: course.courseString,
      name: `${course.courseString} - ${course.title}`,
      instructor: firstInstructor,
      description: course.courseDescription || "No description available.",
      tags,
      schedule,
    }
  } catch (error) {
    console.error("Error converting course:", error)
    return {
      id: course.courseString || "unknown",
      name: course.title || "Unknown Course",
      instructor: "Error loading instructor",
      description: "Error loading course details.",
      tags: [],
      schedule: { days: [], time: "N/A" },
    }
  }
}

export async function GET(request: Request) {
  // Get search parameters from the URL
  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year") || new Date().getFullYear().toString()
  const semester = searchParams.get("semester") || "1" // Default to Spring
  const campus = searchParams.get("campus") || "NB" // Default to New Brunswick
  const query = searchParams.get("query") || ""

  console.log(`API Request - year: ${year}, term: ${semester}, campus: ${campus}, query: ${query}`)

  try {
    // Use the Rutgers SOC API
    const apiUrl = `https://sis.rutgers.edu/soc/api/courses.json?year=${year}&term=${semester}&campus=${campus}`
    console.log(`Fetching from Rutgers API: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`Rutgers API error: ${response.status}`)
    }

    const courses = await response.json()
    console.log(`Fetched ${courses.length} courses from Rutgers API`)

    // Filter courses if query is provided
    let filteredCourses = courses
    if (query) {
      const searchTerms = query.toLowerCase().split(/\s+/)
      filteredCourses = courses.filter((course: any) => {
        const courseString = (course.courseString || "").toLowerCase()
        const title = (course.title || "").toLowerCase()
        const subject = (course.subject || "").toLowerCase()
        const description = (course.courseDescription || "").toLowerCase()

        return searchTerms.some(
          (term) =>
            courseString.includes(term) || title.includes(term) || subject.includes(term) || description.includes(term),
        )
      })
      console.log(`Found ${filteredCourses.length} courses matching query "${query}"`)
    }

    // Convert to our ClassData format
    const classData = filteredCourses.map(convertToClassData)

    return NextResponse.json(classData)
  } catch (error) {
    console.error("Error fetching courses:", error)

    // Return error response
    return NextResponse.json(
      {
        error: "Failed to fetch courses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

