// Dictionary of common department abbreviations to their codes
const DEPARTMENT_ABBREVIATIONS: Record<string, string> = {
  // Computer Science
  CS: "198",
  COMPSCI: "198",

  // Mathematics
  MATH: "640",

  // Physics
  PHYS: "750",

  // Chemistry
  CHEM: "160",

  // Biology
  BIO: "120",
  BIOL: "120",

  // English
  ENGL: "350",

  // History
  HIST: "510",

  // Psychology
  PSYCH: "830",
  PSY: "830",

  // Economics
  ECON: "220",

  // Business
  BUS: "010",

  // Engineering
  ENG: "440",

  // Information Technology
  INFO: "547",
  IT: "547",

  // Statistics
  STAT: "960",

  // Data Science
  DATA: "198", // Often part of CS at Rutgers

  // Add more as needed
}

// Pattern to recognize course codes like "01:198:111" or "198:111"
const COURSE_CODE_PATTERN = /^(?:(\d+):)?(\d+):(\d+)$/

// Pattern to recognize subject and number like "CS 111" or "MATH 152"
const SUBJECT_NUMBER_PATTERN = /^([a-zA-Z]+)\s*(\d+)$/

// Pattern to recognize just a course number like "111" or "152"
const NUMBER_ONLY_PATTERN = /^(\d{3,4})$/

interface SearchMatch {
  course: any
  score: number
  matchType: "exact" | "high" | "fuzzy"
}

/**
 * Parse a search query to identify if it's a specific course code, subject+number, or general search
 */
export function parseSearchQuery(query: string): {
  type: "code" | "subject-number" | "number" | "general"
  school?: string
  subject?: string
  number?: string
  originalQuery: string
} {
  // Normalize the query
  const normalizedQuery = query.trim().toUpperCase()

  // Check for course code pattern (01:198:111)
  const codeMatch = normalizedQuery.match(COURSE_CODE_PATTERN)
  if (codeMatch) {
    return {
      type: "code",
      school: codeMatch[1] || undefined,
      subject: codeMatch[2],
      number: codeMatch[3],
      originalQuery: query,
    }
  }

  // Check for subject and number pattern (CS 111)
  const subjectNumberMatch = normalizedQuery.match(SUBJECT_NUMBER_PATTERN)
  if (subjectNumberMatch) {
    const subject = subjectNumberMatch[1]
    const subjectCode = DEPARTMENT_ABBREVIATIONS[subject]

    return {
      type: "subject-number",
      subject: subjectCode || subject,
      number: subjectNumberMatch[2],
      originalQuery: query,
    }
  }

  // Check for just a number (111)
  const numberMatch = normalizedQuery.match(NUMBER_ONLY_PATTERN)
  if (numberMatch) {
    return {
      type: "number",
      number: numberMatch[1],
      originalQuery: query,
    }
  }

  // General search
  return {
    type: "general",
    originalQuery: query,
  }
}

/**
 * Enhanced search function that implements a tiered matching system
 */
export function enhancedSearchCourses(courses: any[], query: string): any[] {
  if (!query || !courses || courses.length === 0) return courses

  const parsedQuery = parseSearchQuery(query)
  const matches: SearchMatch[] = []

  // Group courses by courseString to ensure all sections of a course stay together
  const courseGroups: Record<string, any> = {}

  courses.forEach((course) => {
    const courseString = course.courseString || ""
    if (!courseGroups[courseString]) {
      courseGroups[courseString] = course
    }
  })

  // Convert back to array
  const uniqueCourses = Object.values(courseGroups)

  // For specific course searches, use precise matching
  if (parsedQuery.type === "code" || parsedQuery.type === "subject-number") {
    uniqueCourses.forEach((course) => {
      let score = 0
      let matchType: "exact" | "high" | "fuzzy" = "fuzzy"

      const courseString = (course.courseString || "").toUpperCase()
      const subject = (course.subject || "").toUpperCase()
      const courseNumber = (course.courseNumber || "").toUpperCase()

      // Exact match on course string (highest priority)
      if (parsedQuery.type === "code") {
        const searchPattern = parsedQuery.school
          ? `${parsedQuery.school}:${parsedQuery.subject}:${parsedQuery.number}`
          : `${parsedQuery.subject}:${parsedQuery.number}`

        if (courseString === searchPattern) {
          score = 100
          matchType = "exact"
        }
      }

      // Subject + Number match
      if (parsedQuery.type === "subject-number" && parsedQuery.subject && parsedQuery.number) {
        // Exact match on subject and number
        if (subject === parsedQuery.subject && courseNumber === parsedQuery.number) {
          score = 100
          matchType = "exact"
        }
        // Match on subject and partial match on number
        else if (subject === parsedQuery.subject && courseNumber.includes(parsedQuery.number)) {
          score = 95
          matchType = "high"
        }
        // Match on subject code from abbreviation dictionary
        else if (
          DEPARTMENT_ABBREVIATIONS[parsedQuery.subject] === subject &&
          courseNumber.includes(parsedQuery.number)
        ) {
          score = 90
          matchType = "high"
        }
      }

      if (score > 0) {
        matches.push({ course, score, matchType })
      }
    })

    // If we have exact or high-relevance matches, return those without fuzzy matching
    const exactMatches = matches.filter((m) => m.matchType === "exact")
    if (exactMatches.length > 0) {
      return exactMatches.sort((a, b) => b.score - a.score).map((m) => m.course)
    }

    const highMatches = matches.filter((m) => m.matchType === "high")
    if (highMatches.length > 0) {
      return highMatches.sort((a, b) => b.score - a.score).map((m) => m.course)
    }
  }

  // For number-only searches or if no exact/high matches were found
  if (parsedQuery.type === "number" || matches.length === 0) {
    uniqueCourses.forEach((course) => {
      const courseNumber = (course.courseNumber || "").toUpperCase()

      if (parsedQuery.type === "number" && courseNumber === parsedQuery.number) {
        matches.push({ course, score: 85, matchType: "high" })
      }
    })

    // If we have high-relevance matches for number, return those
    const highMatches = matches.filter((m) => m.matchType === "high")
    if (highMatches.length > 0) {
      return highMatches.sort((a, b) => b.score - a.score).map((m) => m.course)
    }
  }

  // Fall back to fuzzy search for all query types if no exact/high matches
  const searchTerms = query.toLowerCase().trim().split(/\s+/)

  uniqueCourses.forEach((course) => {
    let score = 0
    const courseString = (course.courseString || "").toLowerCase()
    const title = (course.title || "").toLowerCase()
    const subject = (course.subject || "").toLowerCase()
    const subjectDesc = (course.subjectDescription || "").toLowerCase()
    const courseNumber = (course.courseNumber || "").toLowerCase()
    const description = (course.description || "").toLowerCase()

    // Check each search term
    for (const term of searchTerms) {
      // Exact matches
      if (courseString === term) score += 80
      if (courseNumber === term) score += 75
      if (subject === term) score += 70

      // Partial matches
      if (courseString.includes(term)) score += 50
      if (title.includes(term)) score += 40
      if (subject.includes(term)) score += 35
      if (subjectDesc.includes(term)) score += 30
      if (courseNumber.includes(term)) score += 25
      if (description.includes(term)) score += 10

      // Word boundary matches
      const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, "i")
      if (wordBoundaryRegex.test(title)) score += 20
      if (wordBoundaryRegex.test(subjectDesc)) score += 15
    }

    if (score > 0) {
      matches.push({ course, score, matchType: "fuzzy" })
    }
  })

  // Sort by score and return courses
  return matches.sort((a, b) => b.score - a.score).map((match) => match.course)
}

/**
 * Ensure all sections of matched courses are included in results
 */
export function includeAllSections(matchedCourses: any[], allCourses: any[]): any[] {
  // Create a set of matched course strings
  const matchedCourseStrings = new Set(matchedCourses.map((course) => course.courseString))

  // Return all courses that match the course strings in our matched set
  return allCourses.filter((course) => matchedCourseStrings.has(course.courseString))
}

