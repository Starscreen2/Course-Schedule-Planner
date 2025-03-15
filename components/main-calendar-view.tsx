"use client"

import { useState } from "react"
import { useSchedule } from "@/context/schedule-context"
import WeeklyCalendar from "@/components/weekly-calendar"
import { Button } from "@/components/ui/button"
import { Calendar, List, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClassSearchModal } from "@/components/class-search-modal"

// Campus color mapping
export type CampusName = "College Ave" | "Busch" | "Livingston" | "Cook/Douglass" | "Online"

export function MainCalendarView() {
  const { scheduledClasses, removeFromSchedule } = useSchedule()
  const [activeTab, setActiveTab] = useState("calendar")
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  // Campus colors for the calendar
  const campusColors: Record<CampusName, string> = {
    "College Ave": "border-red-500",
    Busch: "border-blue-500",
    Livingston: "border-green-500",
    "Cook/Douglass": "border-orange-500",
    Online: "border-purple-500",
  }

  // Current term selection
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [semester, setSemester] = useState("Fall")

  // Get current year and next 2 years for the dropdown
  const years = Array.from({ length: 3 }, (_, i) => (new Date().getFullYear() + i).toString())

  // Semesters
  const semesters = ["Winter", "Spring", "Summer", "Fall"]

  return (
    <div className="space-y-6">
      {/* Term selection and course count */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((sem) => (
                <SelectItem key={sem} value={sem}>
                  {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            {scheduledClasses.length} course{scheduledClasses.length !== 1 ? "s" : ""} in schedule
          </div>
        </div>
      </div>

      {/* Tabs component */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          {scheduledClasses.length > 0 ? (
            <WeeklyCalendar
              scheduledClasses={scheduledClasses}
              onRemoveClass={removeFromSchedule}
              campusColors={campusColors}
            />
          ) : (
            <EmptyCalendarState onOpenSearchModal={() => setIsSearchModalOpen(true)} />
          )}
        </TabsContent>

        <TabsContent value="list">
          {scheduledClasses.length > 0 ? (
            <CourseListView courses={scheduledClasses} onRemoveCourse={removeFromSchedule} />
          ) : (
            <EmptyCalendarState onOpenSearchModal={() => setIsSearchModalOpen(true)} />
          )}
        </TabsContent>
      </Tabs>

      {/* Search Modal */}
      <ClassSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </div>
  )
}

function EmptyCalendarState({ onOpenSearchModal }) {
  return (
    <Card className="border-dashed border-2 bg-gray-50 dark:bg-gray-800/50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
        <CardTitle className="text-xl mb-2 text-center">Your schedule is empty</CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          Start by searching for classes and adding them to your schedule to visualize your weekly calendar.
        </p>
        <Button onClick={onOpenSearchModal} className="bg-[#CC0033] hover:bg-[#A30029] text-white">
          <Search className="h-4 w-4 mr-2" />
          Search for Classes
        </Button>
      </CardContent>
    </Card>
  )
}

function CourseListView({ courses, onRemoveCourse }) {
  if (courses.length === 0) {
    return null // This is handled by the parent component now
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id || course.courseString} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">{course.title || course.name || course.courseString}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => onRemoveCourse(course.id || course.courseString)}
              >
                Remove
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {course.courseString}
              {course.selectedSection &&
                ` • Section ${course.selectedSection.number} (Index: ${course.selectedSection.index})`}
            </p>
          </CardHeader>
          <CardContent>
            {course.selectedSection ? (
              <div className="text-sm">
                <p className="mb-1">
                  <span className="font-medium">Instructor:</span>{" "}
                  {course.selectedSection.instructors?.join(", ") || "TBA"}
                </p>
                {course.selectedSection.meetingTimes &&
                  course.selectedSection.meetingTimes.map((time, idx) => (
                    <div key={idx} className="mb-2 last:mb-0">
                      <p className="font-medium">{time.day || "Online"}</p>
                      <p>
                        {time.startTime?.formatted} - {time.endTime?.formatted}
                      </p>
                      <p>
                        {time.building} {time.room}, {time.campus}
                      </p>
                    </div>
                  ))}
              </div>
            ) : course.schedule ? (
              <div className="text-sm">
                <p className="mb-1">
                  <span className="font-medium">Schedule:</span> {course.schedule.days.join(", ")}
                </p>
                <p>{course.schedule.time}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No schedule information available</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

