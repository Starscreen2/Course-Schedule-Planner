"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle, RefreshCw } from "lucide-react"
import { DebugPanel } from "@/components/debug-panel"
import { CourseAccordion } from "@/components/course-accordion"

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

interface Section {
  number: string
  index: string
  instructors: string[]
  status: string
  comments: string
  meetingTimes: MeetingTime[]
}

interface CoreCode {
  code: string
  description: string
}

interface Course {
  courseString: string
  title: string
  subject: string
  subjectDescription: string
  courseNumber: string
  description: string
  credits: string
  creditsDescription: string
  school: string
  campusLocations: string[]
  prerequisites: string
  coreCodes: CoreCode[]
  sections: Section[]
  instructor?: string
  schedule?: string
}

interface CourseListProps {
  hasSearched: boolean
  courses?: any[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function CourseList({ hasSearched, courses = [], isLoading, error, onRetry }: CourseListProps) {
  const searchParams = useSearchParams()
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState({
    apiUrl: "",
    requestParams: {},
    responseData: null,
  })

  const year = searchParams.get("year") || new Date().getFullYear().toString()
  const term = searchParams.get("term") || "1"
  const campus = searchParams.get("campus") || "NB"
  const query = searchParams.get("query") || ""

  useEffect(() => {
    const fetchCourses = async () => {
      if (!hasSearched) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setApiError(null)

        // Log the current parameters
        console.log("Fetching courses with parameters:", {
          year,
          term,
          campus,
          query,
          timestamp: new Date().toISOString(),
        })

        const params = new URLSearchParams({
          year,
          term,
          campus,
          query,
          _: new Date().getTime().toString(),
        })

        const apiUrl = `/api/courses?${params}`
        console.log(`Making request to: ${apiUrl}`)

        const response = await fetch(apiUrl, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("API error response:", errorData)
          throw new Error(errorData.message || `Failed to fetch courses: ${response.status}`)
        }

        const data = await response.json()
        console.log(`Received ${data.length} courses for term ${term}`)

        // Validate the response data
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format: expected an array of courses")
        }

        setAllCourses(data)
        setDebugInfo((prev) => ({
          ...prev,
          apiUrl,
          requestParams: { year, term, campus, query },
          responseData: data,
        }))
      } catch (err) {
        console.error("Error fetching courses:", err)
        setApiError(err instanceof Error ? err.message : "Failed to load courses. Please try again later.")
        setDebugInfo((prev) => ({ ...prev, responseData: null }))
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [year, term, campus, query, retryCount, hasSearched])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const handleAddToSchedule = (courseId: string, sectionIndex?: string) => {
    // Find the course
    const course = allCourses.find((c) => c.courseString === courseId)
    if (!course) return

    // If section is specified, find that section
    let selectedSection = undefined
    if (sectionIndex && course.sections) {
      selectedSection = course.sections.find((s) => s.index === sectionIndex)
    }

    console.log("Adding to schedule:", courseId, "Section:", sectionIndex || "None")
    // Here you would call your schedule context to add the course
  }

  return (
    <div className="space-y-4">
      <DebugPanel
        apiUrl={debugInfo.apiUrl}
        requestParams={debugInfo.requestParams}
        responseData={debugInfo.responseData}
        error={apiError}
      />

      {!hasSearched ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">Search for courses</h3>
          <p className="mt-2 text-gray-500">Enter a search term to find courses</p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : apiError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Error Loading Courses</h3>
          </div>
          <p className="mb-4">{apiError}</p>
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-800 hover:bg-red-100"
            onClick={handleRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : allCourses.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search terms</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Showing {allCourses.length} course{allCourses.length !== 1 ? "s" : ""}
            {query && <span className="font-normal text-gray-600"> for "{query}"</span>}
          </h2>

          <div className="space-y-4">
            {allCourses.map((course) => (
              <CourseAccordion key={course.courseString} {...course} onAddToSchedule={handleAddToSchedule} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

