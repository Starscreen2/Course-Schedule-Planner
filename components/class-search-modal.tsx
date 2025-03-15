"use client"

import { useState, useEffect } from "react"
import { Search, AlertCircle, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleCourseCard } from "@/components/simple-course-card"
import { SearchHelper } from "@/components/search-helper"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ClassSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ClassSearchModal({ isOpen, onClose }: ClassSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
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

      // Always include the current URL parameters
      const params = new URLSearchParams({
        year,
        term: semester, // Change semester to term to match the API
        campus,
        query,
        // Add a timestamp to prevent caching
        _: new Date().getTime().toString(),
      })

      console.log(`Fetching classes with params: ${params.toString()}`)
      const res = await fetch(`/api/courses?${params.toString()}`, {
        // Add cache control headers
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

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
    if (isOpen) {
      fetchClasses("")
    }
  }, [year, semester, campus, retryCount, isOpen])

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">Search for Classes</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                value={year}
                onValueChange={(value) => {
                  setYear(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={semester}
                onValueChange={(value) => {
                  setSemester(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.value} value={sem.value}>
                      {sem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={campus}
                onValueChange={(value) => {
                  setCampus(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((camp) => (
                    <SelectItem key={camp.value} value={camp.value}>
                      {camp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search for classes by name, subject, or course number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading} className="bg-[#CC0033] hover:bg-[#A30029]">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Searching...
                    </span>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
              <div className="flex justify-end mt-1">
                <SearchHelper />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              {isLoading
                ? "Loading classes..."
                : error
                  ? "Error loading classes"
                  : classes.length > 0
                    ? `Showing ${indexOfFirstClass + 1}-${Math.min(indexOfLastClass, classes.length)} of ${classes.length} classes`
                    : "No classes found"}
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center dark:bg-red-600/20 dark:border-red-600/20 dark:text-red-400">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4 dark:text-red-400" />
                <h3 className="text-lg font-medium text-red-800 mb-2 dark:text-red-400">Error Loading Classes</h3>
                <p className="text-red-700 mb-4 dark:text-red-400">{error}</p>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-400 dark:text-red-400 hover:bg-red-600/20"
                >
                  Try Again
                </Button>
              </div>
            ) : currentClasses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No classes found</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentClasses.map((cls) => (
                  <SimpleCourseCard key={cls.courseString} course={cls} />
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && !error && !isLoading && (
            <div className="mt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

