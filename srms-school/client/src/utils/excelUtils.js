/**
 * Excel utility functions for generating and downloading Excel files
 */

/**
 * Ensure XLSX library is available
 */
export const ensureXLSX = () => {
  return new Promise((resolve, reject) => {

    if (typeof window === 'undefined')
      return reject(new Error('Not running in browser'))

    if (window.XLSX)
      return resolve(window.XLSX)

    const src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
    const existing = document.querySelector(`script[src="${src}"]`)

    if (!existing) {

      const script = document.createElement('script')
      script.src = src
      script.async = true

      script.onload = () => {
        if (window.XLSX) return resolve(window.XLSX)
        reject(new Error('XLSX loaded but not found'))
      }

      script.onerror = () =>
        reject(new Error('Failed to load XLSX library'))

      document.head.appendChild(script)

    } else {

      let attempts = 0

      const interval = setInterval(() => {

        attempts++

        if (window.XLSX) {
          clearInterval(interval)
          resolve(window.XLSX)
        }

        if (attempts > 20) {
          clearInterval(interval)
          reject(new Error('XLSX not available'))
        }

      }, 100)
    }

  })
}


/**
 * Clean Excel sheet names
 */
const safeSheetName = (name) => {

  return (name || 'Sheet')
    .replace(/[\\/?*\[\]:]/g, '')
    .substring(0, 31)

}


/**
 * Generate Result Entry Workbook
 *
 * Behaviour:
 * - Single subject → one sheet
 * - Multiple subjects → one sheet per subject
 */
export const generateResultsTemplate = async (
  courseSubjects,
  students,
  courseCode,
  examName,
  className = ''
) => {

  await ensureXLSX()

  const XLSX = window.XLSX

  const wb = XLSX.utils.book_new()

  courseSubjects.forEach((courseSubject) => {

    const subject = courseSubject.subject || courseSubject
    if (!subject) return

    const headers = ['Student ID', 'Student Name', 'Class']

    if (subject.has_theory) headers.push('Theory')
    if (subject.has_lab) headers.push('Lab')
    if (subject.has_activity) headers.push('Activity')
    if (subject.has_attendance) headers.push('Attendance')

    const rows = []

    students.forEach((student) => {

      const row = [
        student.id,
        student.name,
        className || courseCode || ''
      ]

      if (subject.has_theory) row.push('')
      if (subject.has_lab) row.push('')
      if (subject.has_activity) row.push('')
      if (subject.has_attendance) row.push('')

      rows.push(row)

    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

    const colWidths = [
      { wch: 12 },
      { wch: 22 },
      { wch: 12 }
    ]

    if (subject.has_theory) colWidths.push({ wch: 12 })
    if (subject.has_lab) colWidths.push({ wch: 10 })
    if (subject.has_activity) colWidths.push({ wch: 12 })
    if (subject.has_attendance) colWidths.push({ wch: 12 })

    ws['!cols'] = colWidths

    const sheetName = safeSheetName(
      subject.subject_code || subject.subject_name || 'Subject'
    )

    XLSX.utils.book_append_sheet(wb, ws, sheetName)

  })

  const filename =
    `Results_${courseCode || 'Course'}_${examName || 'Exam'}.xlsx`

  XLSX.writeFile(wb, filename)

}
