"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Users, UserPlus, Loader2 } from "lucide-react"
import { courseApi, studentApi, type Student, type Course } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EnrollmentModalProps {
  course: Course | null
  isOpen: boolean
  onClose: () => void
}

export function EnrollmentModal({ course, isOpen, onClose }: EnrollmentModalProps) {
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && course?.id) {
      loadEnrollmentData()
    }
  }, [isOpen, course?.id])

  const loadEnrollmentData = async () => {
    if (!course?.id) return

    try {
      setLoading(true)
      const [enrolledData, allStudentsData] = await Promise.all([courseApi.getStudents(course.id), studentApi.getAll()])
      setEnrolledStudents(enrolledData)
      setAllStudents(allStudentsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load enrollment data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollStudent = async () => {
    if (!course?.id || !selectedStudentId) return

    try {
      setEnrolling(true)
      await courseApi.addStudent(course.id, { student_id: selectedStudentId })
      setSelectedStudentId("")
      await loadEnrollmentData()
      toast({
        title: "Success",
        description: "Student enrolled successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enroll student. They may already be enrolled.",
        variant: "destructive",
      })
    } finally {
      setEnrolling(false)
    }
  }

  const getAvailableStudents = () => {
    const enrolledIds = new Set(enrolledStudents.map((s) => s.id))
    return allStudents.filter((student) => !enrolledIds.has(student.id))
  }

  const availableStudents = getAvailableStudents()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Course Enrollment
          </DialogTitle>
          <DialogDescription>
            {course?.name} - {course?.semester}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enroll New Student */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Enroll New Student</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="studentSelect">Select Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student to enroll" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id?.toString() || ""}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleEnrollStudent}
                  disabled={!selectedStudentId || enrolling}
                  className="flex items-center gap-2"
                >
                  {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Enroll
                </Button>
              </div>
            </div>
            {availableStudents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All students are already enrolled or no students available.
              </p>
            )}
          </div>

          {/* Currently Enrolled Students */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Enrolled Students</h3>
              <Badge variant="secondary">{enrolledStudents.length}</Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading enrollment...</span>
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">No students enrolled</h4>
                <p className="text-muted-foreground">Start by enrolling your first student</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {enrolledStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{student.name}</h4>
                        <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Enrolled</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
