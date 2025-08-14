const API_BASE_URL = "http://localhost:8001"

// API utility functions
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

// Student API functions
export interface Student {
  id: number | null
  name: string
}

export interface CreateStudentRequest {
  name: string
}

export const studentApi = {
  getAll: () => apiRequest<Student[]>("/students"),
  create: (data: CreateStudentRequest) =>
    apiRequest<number>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Instructor API functions
export interface Instructor {
  id: number | null
  name: string
}

export interface CreateInstructorRequest {
  name: string
}

export const instructorApi = {
  getAll: () => apiRequest<Instructor[]>("/instructors"),
  create: (data: CreateInstructorRequest) =>
    apiRequest<number>("/instructors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Course API functions
export interface Course {
  id: number | null
  name: string
  semester: string
  instructor_id: number
}

export interface CreateCourseRequest {
  name: string
  semester: string
  instructor_id: number
}

export interface AddStudentToCourseRequest {
  student_id: string
}

export const courseApi = {
  getAll: () => apiRequest<Course[]>("/courses"),
  create: (data: CreateCourseRequest) =>
    apiRequest<number>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStudents: (courseId: number) => apiRequest<Student[]>(`/courses/${courseId}/students`),
  addStudent: (courseId: number, data: AddStudentToCourseRequest) =>
    apiRequest<void>(`/courses/${courseId}/students`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getStudentNames: (courseId: number) => apiRequest<string[]>(`/courses/${courseId}/student_names`),
}
