"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CourseList from "./course-list"
import { Search } from "lucide-react"
import { CourseDisplay } from "@/components/course-display"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [courses, setCourses] = useState([])

  // Get URL parameters with defaults
  const year = searchParams.get("year") || new Date().getFullYear().toString()
  const term = searchParams.get("term") || "9" // Fall default
  const campus = searchParams.get("campus") || "NB" // New Brunswick default
  const query = searchParams.get("query") || ""

  // Initialize search query from URL on mount
  useEffect(() => {
    if (query) {
      setSearchQuery(query)
    }
  }, [query])

  // Convert term code to name
  const getTermName = (code: string) => {
    const terms: Record<string, string> = {
      "0": "Winter",
      "1": "Spring",
      "7": "Summer",
      "9": "Fall",
    }
    return terms[code] || "Spring"
  }

  // Convert campus code to name
  const getCampusName = (code: string) => {
    const campuses: Record<string, string> = {
      NB: "New Brunswick",
      NK: "Newark",
      CM: "Camden",
    }
    return campuses[code] || "New Brunswick"
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setHasSearched(true)

    // Create a new URLSearchParams object with the current parameters
    const params = new URLSearchParams({
      year,
      term,
      campus,
    })

    // Add the search query if it's not empty
    if (searchQuery.trim()) {
      params.set("query", searchQuery.trim())
    } else {
      // If search is empty, remove the query parameter
      params.delete("query")
    }

    // Navigate to the search page with the updated parameters
    router.push(`/search?${params.toString()}`)

    // Reset searching state after a short delay to show loading indicator
    setTimeout(() => setIsSearching(false), 300)
  }

  const handleChange = () => {
    // Navigate to parameter selection page or open modal
    router.push("/search/parameters")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#CC0033] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold drop-shadow">Rutgers Course Search</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Discord Sniper
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Links
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-4xl font-bold mb-4 text-[#CC0033]">Course Search</h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">Year:</span>
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Term:</span>
              <span>{getTermName(term)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Campus:</span>
              <span>{getCampusName(campus)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleChange}
              className="border-[#CC0033] text-[#CC0033] hover:bg-[#CC0033]/10"
            >
              Change
            </Button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by subject (e.g., CS) or course (e.g., CS 111)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white border-2 border-gray-200 rounded-lg text-lg h-12 focus-visible:ring-[#CC0033]"
            />
            <Button type="submit" size="lg" className="bg-[#CC0033] hover:bg-[#A30029] h-12" disabled={isSearching}>
              {isSearching ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Courses
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="md:pl-0 lg:pl-0">
          <CourseList hasSearched={hasSearched} />
        </div>

        <div className="space-y-4">
          {courses.map((course) => (
            <CourseDisplay key={course.courseString} {...course} />
          ))}
        </div>
      </main>
    </div>
  )
}

