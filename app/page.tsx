"use client"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduleProvider } from "@/context/schedule-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClassSearchModal } from "@/components/class-search-modal"
import { MainCalendarView } from "@/components/main-calendar-view"

// Main component that doesn't use useSchedule
export default function Home() {
  return (
    <ScheduleProvider>
      <CalendarContent />
    </ScheduleProvider>
  )
}

// Content component that uses useSchedule safely inside the provider
function CalendarContent() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPlannerVisible, setIsPlannerVisible] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Search parameters
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [semester, setSemester] = useState("9") // Default to Fall
  const [campus, setCampus] = useState("NB") // Default to New Brunswick

  const classesPerPage = 5 // Show fewer items per page for better performance

  // Get current year and next 2 years for the dropdown
  const years = Array.from({ length: 3 }, (_, i) => (new Date().getFullYear() + i).toString())

  // Semesters with their codes
  const semesters = [
    { value: "0", label: "Winter" },
    { value: "1", label: "Spring" },
    { value: "7", label: "Summer" },
    { value: "9", label: "Fall" },
  ]

  // Campuses
  const campuses = [
    { value: "NB", label: "New Brunswick" },
    { value: "NK", label: "Newark" },
    { value: "CM", label: "Camden" },
  ]

  // Fetch classes with search parameters
  const fetchClasses = async (query = searchQuery) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        year,
        term: semester, // Change semester to term to match the API
        campus,
        query,
      })

      console.log(`Fetching classes with params: ${params.toString()}`)
      const res = await fetch(`/api/courses?${params.toString()}`)

      if (!res.ok) {
        let errorMessage = `Failed to fetch classes: ${res.status}`
        try {
          const errorData = await res.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (e) {
          // If we can't parse the error JSON, just use the status code
          console.error("Error parsing error response:", e)
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log(`Received ${data.length} courses from API`)

      // Log the first course to see its structure
      if (data.length > 0) {
        console.log("Sample course data:", data[0])
        if (data[0].sections && data[0].sections.length > 0) {
          console.log("Sample section data:", data[0].sections[0])
          if (data[0].sections[0].meetingTimes && data[0].sections[0].meetingTimes.length > 0) {
            console.log("Sample meeting time:", data[0].sections[0].meetingTimes[0])
          }
        }
      }

      setClasses(data)
      setCurrentPage(1) // Reset to first page on new search
    } catch (error) {
      console.error("Failed to fetch classes:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch classes. Please try again later.")
      setClasses([])

      // Try to use fallback API
      try {
        console.log("Attempting to use fallback data...")
        const fallbackRes = await fetch(
          `/api/fallback-courses?year=${year}&semester=${semester}&campus=${campus}&query=${query}`,
        )
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json()
          console.log(`Received ${fallbackData.length} courses from fallback API`)
          setClasses(fallbackData)
          setError("Using fallback data. Some features may be limited.")
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch classes when parameters change
  useEffect(() => {
    //fetchClasses("")
  }, [year, semester, campus, retryCount])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    fetchClasses(searchQuery)
  }

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  // Get current page of classes
  const indexOfLastClass = currentPage * classesPerPage
  const indexOfFirstClass = indexOfLastClass - classesPerPage
  const currentClasses = classes.slice(indexOfFirstClass, indexOfLastClass)
  const totalPages = Math.ceil(classes.length / classesPerPage)

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rutgers Course Planner</h1>
            <p className="text-gray-600 dark:text-gray-400">Plan and visualize your class schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsSearchModalOpen(true)} className="bg-[#CC0033] hover:bg-[#A30029] text-white">
              <Search className="h-4 w-4 mr-2" />
              Search Classes
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Calendar View */}
        <MainCalendarView />

        {/* Search Modal */}
        <ClassSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      </div>
    </main>
  )
}

