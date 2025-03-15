"use client"
import { useSchedule } from "@/context/schedule-context"
import type { ClassData } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Calendar, User, Plus, Check, AlertCircle } from "lucide-react"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface ClassListProps {
  classes: ClassData[]
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
}

export default function ClassList({ classes, isLoading, error, onRetry }: ClassListProps) {
  const { addToSchedule, isInSchedule } = useSchedule()
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Classes</h3>
        <p className="text-red-700 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
        <p className="mt-2 text-gray-500">Try adjusting your search terms</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <Card key={cls.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{cls.name}</CardTitle>
            <CardDescription className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              {cls.instructor}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-sm text-gray-600 mb-4 ${expandedDescriptions.has(cls.id) ? "" : "line-clamp-3"}`}>
              {cls.description}
              {cls.description && cls.description.length > 150 && (
                <button
                  onClick={() => toggleDescription(cls.id)}
                  className="text-blue-600 hover:text-blue-800 ml-1 text-xs font-medium"
                >
                  {expandedDescriptions.has(cls.id) ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {cls.schedule && cls.schedule.time !== "N/A" && (
              <>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{cls.schedule.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{cls.schedule.days.join(", ")}</span>
                </div>
              </>
            )}

            {/* Add sections dropdown */}
            {cls.sections && cls.sections.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Available Sections:</h4>
                  <span className="text-xs text-gray-500">{cls.sections.length} section(s)</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Select a section</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[300px] max-h-[300px] overflow-y-auto">
                    {cls.sections.map((section) => (
                      <DropdownMenuItem
                        key={section.index}
                        className="py-2 px-3 cursor-pointer"
                        onSelect={() => {
                          // You can add logic here to select a specific section
                          console.log("Selected section:", section.index)
                        }}
                      >
                        <div className="flex flex-col w-full">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Section {section.number}</span>
                            <span
                              className={
                                section.status === "Open"
                                  ? "text-green-600 text-xs font-medium"
                                  : "text-red-600 text-xs font-medium"
                              }
                            >
                              {section.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>Index: {section.index}</div>
                            <div>Instructor: {section.instructors?.join(", ") || "TBA"}</div>
                            {section.meetingTimes && section.meetingTimes.length > 0 && (
                              <div>
                                Time: {section.meetingTimes[0].day} {section.meetingTimes[0].startTime?.formatted} -{" "}
                                {section.meetingTimes[0].endTime?.formatted}
                              </div>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="mt-2 text-xs">
                  <p className="text-gray-500">Select a section to view details or add to schedule</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {cls.tags &&
                cls.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={isInSchedule(cls.id) ? "outline" : "default"}
              onClick={() => addToSchedule(cls)}
              disabled={isInSchedule(cls.id)}
            >
              {isInSchedule(cls.id) ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Added to Schedule
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Schedule
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

