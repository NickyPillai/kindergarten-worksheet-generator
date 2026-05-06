export type Domain = 'Cognitive' | 'Language' | 'Social-Emotional' | 'Physical' | 'Adaptive'

export interface Activity {
  domain: Domain
  title: string
  instruction: string
  materials: string[]
}

export interface WorksheetContent {
  title: string
  childAge: number
  activities: Activity[]
}

export interface Guideline {
  id: string
  filename: string
  raw_text: string
  uploaded_at: string
}

export interface Worksheet {
  id: string
  guideline_id: string
  title: string
  content_json: WorksheetContent
  domain_coverage: Domain[]
  created_at: string
}
