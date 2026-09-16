// Mirror PERSIS logic backend (ProfileAccountService.MapActivityAssessment, Modules/ProfileAccount)
// — 2 pertanyaan (PRD 4.0 Onboarding: "2 pertanyaan baseline activity level"): Q1 jenis pekerjaan
// (indoor/outdoor), Q2 frekuensi olahraga/minggu (jumlah hari). Jaga sinkron kalau backend berubah.
// Dipakai bareng ActivityAssessmentModal.tsx (Profile "Retake assessment") dan Onboarding.tsx
// (step 2, submit pertama kali) — 1 sumber, jangan duplikasi ulang logic ini di tempat lain.
export function mapActivityAssessment(workEnvironment: 'indoor' | 'outdoor', exerciseDays: number): string {
  const isOutdoorOrActiveWork = workEnvironment === 'outdoor';
  if (exerciseDays >= 6) return 'Very active';
  if (exerciseDays >= 3) return isOutdoorOrActiveWork ? 'Very active' : 'Moderately active';
  if (exerciseDays >= 1) return isOutdoorOrActiveWork ? 'Moderately active' : 'Lightly active';
  return isOutdoorOrActiveWork ? 'Lightly active' : 'Sedentary';
}

export const EXERCISE_DAY_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7];
