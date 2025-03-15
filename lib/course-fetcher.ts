// Mapping weekday codes to full names
const WEEKDAY_MAP: Record<string, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  TH: "Thursday", // Note: In the Python code it was "H", but Rutgers API typically uses "TH"
  F: "Friday",
  S: "Saturday",
  U: "Sunday",
}

// Mapping campus codes to campus names
const CAMPUS_MAP: Record<string, string> = {
  BUS: "Busch",
  CAC: "College Avenue",
  "D/C": "Douglass/Cook",
  LIV: "Livingston",
  ONL: "Online",
  NB: "New Brunswick",
  NK: "Newark",
  CM: "Camden",
}

// Convert military time to AM/PM format
export function convertToAmPm(militaryTime: string): string {
  if (!militaryTime || militaryTime === "N/A") return "N/A"

  try {
    const hours = Number.parseInt(militaryTime.substring(0, 2))
    const minutes = militaryTime.substring(2)

    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12

    return `${displayHours}:${minutes} ${period}`
  } catch (error) {
    console.error("Invalid military time format:", militaryTime)
    return "N/A"
  }
}

// Format weekday code to full name
export function formatWeekday(day: string): string {
  return WEEKDAY_MAP[day] || day
}

// Format campus code to full name
export function formatCampus(campus: string): string {
  return CAMPUS_MAP[campus] || campus
}

// Format meeting time object
export function formatMeetingTime(meeting: any): any {
  try {
    const startTime = meeting.startTimeMilitary || ""
    const endTime = meeting.endTimeMilitary || ""
    const dayCode = meeting.meetingDay || ""
    const campusCode = meeting.campusLocation || ""
    const mode = meeting.meetingModeDesc || "N/A"

    // For online courses, we might not have day/time information
    if (mode === "ONLINE INSTRUCTION(INTERNET)" && !dayCode && !startTime && !endTime) {
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
        mode,
        campus: formatCampus(campusCode),
      }
    }

    return {
      day: formatWeekday(dayCode),
      startTime: {
        military: startTime,
        formatted: convertToAmPm(startTime),
      },
      endTime: {
        military: endTime,
        formatted: convertToAmPm(endTime),
      },
      building: meeting.buildingCode || "",
      room: meeting.roomNumber || "",
      mode,
      campus: formatCampus(campusCode),
    }
  } catch (error) {
    console.error("Error formatting meeting time:", error)
    return {
      day: "N/A",
      startTime: { military: "N/A", formatted: "N/A" },
      endTime: { military: "N/A", formatted: "N/A" },
      building: "N/A",
      room: "N/A",
      mode: "N/A",
      campus: "N/A",
    }
  }
}

// Format section object
export function formatSection(section: any): any {
  try {
    return {
      number: section.number || "",
      index: section.index || "",
      instructors: (section.instructors || []).map((instr: any) => instr.name || ""),
      status: section.openStatusText || "",
      comments: section.commentsText || "",
      meetingTimes: (section.meetingTimes || []).map(formatMeetingTime),
    }
  } catch (error) {
    console.error("Error formatting section:", error)
    return {
      number: "Error",
      index: "",
      instructors: [],
      status: "Error loading section",
      comments: "",
      meetingTimes: [],
    }
  }
}

// Process raw course data into a more usable format
export function processCourseData(course: any): any {
  try {
    return {
      courseString: course.courseString || "",
      title: course.title || "",
      subject: course.subject || "",
      subjectDescription: course.subjectDescription || "",
      courseNumber: course.courseNumber || "",
      description: course.courseDescription || "",
      credits: course.credits || "",
      creditsDescription: course.creditsObject?.description || "",
      school: course.school?.description || "",
      campusLocations: (course.campusLocations || []).map((loc: any) => loc.description || ""),
      prerequisites: course.preReqNotes || "",
      coreCodes: (course.coreCodes || []).map((core: any) => ({
        code: core.coreCode || "",
        description: core.coreCodeDescription || "",
      })),
      sections: (course.sections || []).map(formatSection),
    }
  } catch (error) {
    console.error("Error processing course data:", error)
    return {
      courseString: "Error",
      title: "Error loading course",
      subject: "",
      subjectDescription: "",
      courseNumber: "",
      description: "",
      credits: "",
      creditsDescription: "",
      school: "",
      campusLocations: [],
      prerequisites: "",
      coreCodes: [],
      sections: [],
    }
  }
}

// Fuzzy search implementation
export function fuzzySearchCourses(courses: any[], query: string): any[] {
  if (!query) return courses

  const searchTerms = query.toLowerCase().trim().split(/\s+/)

  // Score each course based on how well it matches the search terms
  const scoredCourses = courses.map((course) => {
    let score = 0
    const courseString = (course.courseString || "").toLowerCase()
    const title = (course.title || "").toLowerCase()
    const subject = (course.subject || "").toLowerCase()
    const courseNumber = (course.courseNumber || "").toLowerCase()
    const description = (course.courseDescription || "").toLowerCase()

    // Check each search term
    for (const term of searchTerms) {
      // Exact matches get higher scores
      if (courseString === term) score += 100
      if (courseNumber === term) score += 90
      if (subject === term) score += 80

      // Partial matches
      if (courseString.includes(term)) score += 50
      if (title.includes(term)) score += 40
      if (subject.includes(term)) score += 30
      if (courseNumber.includes(term)) score += 30
      if (description.includes(term)) score += 10

      // Word boundary matches (e.g., "cs" should match "CS 211" but not "Physics")
      const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, "i")
      if (wordBoundaryRegex.test(courseString)) score += 25
      if (wordBoundaryRegex.test(title)) score += 20
      if (wordBoundaryRegex.test(subject)) score += 15
    }

    return { course, score }
  })

  // Filter out courses with zero score and sort by score (descending)
  return scoredCourses
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.course)
}

