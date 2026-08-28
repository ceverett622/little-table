export type Child = {
  id: string
  user_id: string
  name: string
  birth_date: string | null
  guardian: string | null
  guardian_contact: string | null
  allergies: string[]
  restrictions: string[]
  notes: string | null
  schedule_days: number[]
  created_at: string
  updated_at: string
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function parseList(input: string): string[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

export function ageLabel(birthDate: string | null): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return `${age - 1} years old`
  }
  return `${age} years old`
}
