"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { EnrollmentModal } from "@/components/enrollment-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BookOpen, Loader2, UserCheck, Users } from "lucide-react"
import { courseApi, instructorApi, type Course, type Instructor } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [newCourse, setNewCourse] = useState({
    name: "",
    semester: "",
    instructor_id: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, instructorsData] = await Promise.all([courseApi.getAll(), instructorApi.getAll()])
      setCourses(coursesData)
      setInstructors(instructorsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data. Please check if the API is running on port 8001.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourse.name.trim() || !newCourse.semester.trim() || !newCourse.instructor_id) return

    try {
      setCreating(true)
      await courseApi.create({
        name: newCourse.name.trim(),
        semester: newCourse.semester.trim(),
        instructor_id: Number.parseInt(newCourse.instructor_id),
      })
      setNewCourse({ name: "", semester: "", instructor_id: "" })
      setShowAddForm(false)
      await loadData()
      toast({
        title: "Success",
        description: "Course created successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getInstructorName = (instructorId: number) => {
    const instructor = instructors.find((i) => i.id === instructorId)
    return instructor?.name || "Unknown Instructor"
  }

  const handleViewEnrollment = (course: Course) => {
    setSelectedCourse(course)
    setShowEnrollmentModal(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Courses</h1>
            <p className="text-muted-foreground">Manage course offerings and assignments</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Add Course Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
              <CardDescription>Enter the course information below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      type="text"
                      placeholder="e.g., Introduction to Computer Science"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="text"
                      placeholder="e.g., Fall 2024"
                      value={newCourse.semester}
                      onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select
                    value={newCourse.instructor_id}
                    onValueChange={(value) => setNewCourse({ ...newCourse, instructor_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id?.toString() || ""}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {instructors.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No instructors available. Please add instructors first.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={creating || instructors.length === 0}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Course
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Courses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              All Courses
              <Badge variant="secondary">{courses.length}</Badge>
            </CardTitle>
            <CardDescription>
              {courses.length === 0
                ? "No courses found"
                : `Showing ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  {instructors.length === 0
                    ? "Add instructors first, then create your first course"
                    : "Get started by creating your first course"}
                </p>
                {instructors.length > 0 ? (
                  <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Course
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <a href="/instructors" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Add Instructors First
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{course.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            <UserCheck className="h-3 w-3 inline mr-1" />
                            {getInstructorName(course.instructor_id)}
                          </p>
                          <Badge variant="outline">{course.semester}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEnrollment(course)}
                        className="flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" />
                        Enrollment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <EnrollmentModal
        course={selectedCourse}
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false)
          setSelectedCourse(null)
        }}
      />
    </div>
  )
}
