"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ParametersPage() {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [year, setYear] = useState(currentYear.toString())
  const [term, setTerm] = useState("1")
  const [campus, setCampus] = useState("NB")

  const years = Array.from({ length: 3 }, (_, i) => (currentYear + i).toString())

  const terms = [
    { value: "0", label: "Winter" },
    { value: "1", label: "Spring" },
    { value: "7", label: "Summer" },
    { value: "9", label: "Fall" },
  ]

  const campuses = [
    { value: "NB", label: "New Brunswick" },
    { value: "NK", label: "Newark" },
    { value: "CM", label: "Camden" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ year, term, campus })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#CC0033] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Search Parameters</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-[#CC0033] mb-4">Select Search Parameters</h2>

          <div className="space-y-2">
            <label className="font-bold">Year</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="border-gray-300 focus:ring-[#CC0033]">
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
          </div>

          <div className="space-y-2">
            <label className="font-bold">Term</label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger className="border-gray-300 focus:ring-[#CC0033]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="font-bold">Campus</label>
            <Select value={campus} onValueChange={setCampus}>
              <SelectTrigger className="border-gray-300 focus:ring-[#CC0033]">
                <SelectValue placeholder="Select Campus" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-[#CC0033] hover:bg-[#A30029]">
            Apply Parameters
          </Button>
        </form>
      </main>
    </div>
  )
}

