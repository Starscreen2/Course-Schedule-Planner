import { NextResponse } from "next/server"
import { fuzzySearchCourses } from "@/lib/course-fetcher"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year") || new Date().getFullYear().toString()

  // Check for both parameter names to ensure compatibility
  const term = searchParams.get("term") || searchParams.get("semester") || "9"

  const campus = searchParams.get("campus") || "NB"
  const query = searchParams.get("query") || ""

  // Add this right after getting the parameters
  console.log(`Term parameter details:`)
  console.log(`- Raw term value: ${term}`)
  console.log(`- Expected values: 0=Winter, 1=Spring, 7=Summer, 9=Fall`)
  const apiUrl = `https://sis.rutgers.edu/soc/api/courses.json?year=${year}&term=${term}&campus=${campus}`
  console.log(`- API URL being called: ${apiUrl}`)

  // Add this after getting the parameters
  if (!["0", "1", "7", "9"].includes(term)) {
    console.error(`Invalid term parameter: ${term}`)
    return NextResponse.json(
      { error: "Invalid term parameter. Must be 0 (Winter), 1 (Spring), 7 (Summer), or 9 (Fall)" },
      { status: 400 },
    )
  }

  console.log(`API Request - year: ${year}, term: ${term}, campus: ${campus}, query: ${query}`)
  console.log(`Requesting from Rutgers API with URL: ${apiUrl}`)

  try {
    console.log(`Fetching from Rutgers API: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
      next: { revalidate: 0 }, // Disable Next.js cache
    })

    if (!response.ok) {
      console.error(`Rutgers API error: ${response.status}`)
      throw new Error(`Rutgers API error: ${response.status}`)
    }

    const courses = await response.json()
    console.log(`Fetched ${courses.length} courses from Rutgers API for term ${term}`)

    // Process all courses
    const processedCourses = courses.map((course: any) => {
      try {
        // Format sections with all meeting times
        const sections = (course.sections || []).map((section: any) => {
          // Format all meeting times for this section
          const meetingTimes = (section.meetingTimes || [])
            .map((meeting: any) => {
              if (!meeting) return null

              try {
                // Special handling for online courses
                if (meeting.meetingModeDesc === "ONLINE INSTRUCTION(INTERNET)") {
                  return {
                    day: "",
                    startTime: {
                      military: "",
                      formatted: "N/A",
                    },
                    endTime: {
                      military: "",
                      formatted: "N/A",
                    },
                    building: "",
                    room: "",
                    mode: meeting.meetingModeDesc,
                    campus: "Online",
                  }
                }

                return {
                  day: formatWeekday(meeting.meetingDay || ""),
                  startTime: {
                    military: meeting.startTimeMilitary || "",
                    formatted: formatTime(meeting.startTimeMilitary || ""),
                  },
                  endTime: {
                    military: meeting.endTimeMilitary || "",
                    formatted: formatTime(meeting.endTimeMilitary || ""),
                  },
                  building: meeting.buildingCode || "",
                  room: meeting.roomNumber || "",
                  mode: meeting.meetingModeDesc || "",
                  campus: formatCampus(meeting.campusLocation || ""),
                }
              } catch (error) {
                console.error("Error formatting meeting time:", error, meeting)
                return null
              }
            })
            .filter(Boolean) // Remove any failed conversions

          return {
            number: section.number || "",
            index: section.index || "",
            instructors: (section.instructors || []).map((inst: any) =>
              typeof inst === "string" ? inst : inst.name || "TBA",
            ),
            status: section.openStatusText || (section.openStatus ? "OPEN" : "CLOSED"),
            comments:
              section.commentsText ||
              (section.comments
                ? Array.isArray(section.comments)
                  ? section.comments.map((c: any) => c.description).join(", ")
                  : section.comments
                : ""),
            meetingTimes,
          }
        })

        return {
          id: course.courseString || `${course.subject}:${course.courseNumber}`,
          courseString: course.courseString || "",
          title: course.title || "",
          subject: course.subject || "",
          subjectDescription: course.subjectDescription || "",
          courseNumber: course.courseNumber || "",
          description: course.courseDescription || course.expandedTitle || "No description available.",
          credits: course.credits || "",
          creditsDescription: course.creditsObject?.description || "",
          school: course.school?.description || "",
          campusLocations: (course.campusLocations || []).map((loc: any) => loc.description || ""),
          prerequisites: course.preReqNotes || "",
          coreCodes: (course.coreCodes || []).map((core: any) => ({
            code: core.coreCode || "",
            description: core.coreCodeDescription || "",
          })),
          sections,
          // Default display info from first section's first meeting time
          instructor: sections[0]?.instructors?.[0] || "TBA",
          tags: [course.subject, course.courseNumber?.substring(0, 1) + "00 level"].filter(Boolean),
        }
      } catch (error) {
        console.error("Error processing course:", error)
        return {
          id: course.courseString || "unknown",
          courseString: course.courseString || "unknown",
          title: course.title || "Unknown Course",
          description: "Error loading course details.",
          sections: [],
        }
      }
    })

    // Apply fuzzy search if query is provided
    let filteredCourses = processedCourses
    if (query) {
      filteredCourses = fuzzySearchCourses(processedCourses, query)
      console.log(`Found ${filteredCourses.length} courses matching query "${query}"`)
    }

    return NextResponse.json(filteredCourses)
  } catch (error) {
    console.error("Error fetching courses:", error)

    // Try fallback API if main API fails
    try {
      console.log(`Rutgers API failed with error: ${error}. Attempting to use fallback API...`)
      console.log(`Using fallback API with term: ${term}`)
      const fallbackUrl = `/api/fallback-courses?year=${year}&term=${term}&campus=${campus}&query=${query}`
      const fallbackResponse = await fetch(fallbackUrl)

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API error: ${fallbackResponse.status}`)
      }

      const fallbackCourses = await fallbackResponse.json()
      console.log(`Retrieved ${fallbackCourses.length} courses from fallback API`)

      return NextResponse.json(fallbackCourses)
    } catch (fallbackError) {
      console.error("Fallback API also failed:", fallbackError)

      return NextResponse.json(
        {
          error: "Failed to fetch courses",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  }
}

// Helper function to format military time to AM/PM
function formatTime(militaryTime: string): string {
  if (!militaryTime) return "N/A"
  try {
    const hours = Number.parseInt(militaryTime.substring(0, 2))
    const minutes = Number.parseInt(militaryTime.substring(2, 4))
    const period = hours < 12 || hours === 24 ? "AM" : "PM"
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12 // Convert 0 and 12 to 12
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`
  } catch (e) {
    return militaryTime
  }
}

// Helper function to format weekday
function formatWeekday(day: string): string {
  const dayMap: { [key: string]: string } = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    TH: "Thursday",
    H: "Thursday", // Some Rutgers API entries use H for Thursday
    F: "Friday",
    S: "Saturday",
    SU: "Sunday",
  }
  return dayMap[day] || day
}

// Helper function to format campus
function formatCampus(campus: string): string {
  const campusMap: { [key: string]: string } = {
    BUS: "Busch",
    CAC: "College Avenue",
    "D/C": "Douglass/Cook",
    LIV: "Livingston",
    ONL: "Online",
    NB: "New Brunswick",
    NK: "Newark",
    CM: "Camden",
  }
  return campusMap[campus] || campus
}

