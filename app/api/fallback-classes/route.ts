import { NextResponse } from "next/server"
import type { ClassData } from "@/types"

// Generate fallback class data
function generateFallbackClasses(query: string): ClassData[] {
  const subjects = [
    { code: "CS", name: "Computer Science" },
    { code: "MATH", name: "Mathematics" },
    { code: "INFO", name: "Information Technology" },
    { code: "DATA", name: "Data Science" },
  ]

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

      classes.push({
        id,
        name: `${subject.code} ${courseNumber} - Introduction to ${subject.name}`,
        instructor: "Professor Smith",
        description: `This is a fallback course for ${subject.name}. The real API is currently unavailable.`,
        tags: [subject.code, "Fallback Data", "100-level"],
        schedule: {
          days: ["Monday", "Wednesday"],
          time: "10:00 AM - 11:20 AM",
        },
      })
    }
  })

  return classes
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""

  console.log("Using fallback API with query:", query)

  // Generate fallback data
  const fallbackClasses = generateFallbackClasses(query)

  return NextResponse.json(fallbackClasses)
}

