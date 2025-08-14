"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, UserCheck, Loader2 } from "lucide-react"
import { instructorApi, type Instructor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newInstructorName, setNewInstructorName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadInstructors()
  }, [])

  const loadInstructors = async () => {
    try {
      setLoading(true)
      const data = await instructorApi.getAll()
      setInstructors(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load instructors. Please check if the API is running on port 8001.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInstructorName.trim()) return

    try {
      setCreating(true)
      await instructorApi.create({ name: newInstructorName.trim() })
      setNewInstructorName("")
      setShowAddForm(false)
      await loadInstructors()
      toast({
        title: "Success",
        description: "Instructor added successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add instructor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Instructors</h1>
            <p className="text-muted-foreground">Manage instructor records in your system</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Instructor
          </Button>
        </div>

        {/* Add Instructor Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Instructor</CardTitle>
              <CardDescription>Enter the instructor's information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInstructor} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructorName">Instructor Name</Label>
                  <Input
                    id="instructorName"
                    type="text"
                    placeholder="Enter instructor name"
                    value={newInstructorName}
                    onChange={(e) => setNewInstructorName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Instructor
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Instructors List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              All Instructors
              <Badge variant="secondary">{instructors.length}</Badge>
            </CardTitle>
            <CardDescription>
              {instructors.length === 0
                ? "No instructors found"
                : `Showing ${instructors.length} instructor${instructors.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading instructors...</span>
              </div>
            ) : instructors.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No instructors yet</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first instructor</p>
                <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Instructor
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {instructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{instructor.name}</h3>
                        <p className="text-sm text-muted-foreground">Instructor ID: {instructor.id}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
