"use client"

import { useEffect, useState, useCallback, useMemo, useRef, SetStateAction } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import Image from "next/image" // <--- Added Import
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { getMembers, createMember, resetQrCode, getCheckIns, updateMember, deleteMember, checkExistingEmails, importMembersBatch } from "@/lib/api"
import { normalizeCsvHeader, parseCsv } from "@/lib/csv"
import { useRealtimeCheckIns } from "@/hooks/use-realtime"
import type { Member, CheckInEvent } from "@/lib/types"
import {
  Users,
  Download,
  Upload,
  Eye,
  RotateCcw,
  Printer,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ImportPreviewRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  sendEmail: boolean
}

type ImportPreviewStats = {
  skippedInvalid: number
  skippedDuplicateInFile: number
  skippedExisting: number
}

type ParsedCsvResult = {
  totalRows: number
  candidates: Array<{ firstName: string; lastName: string; email: string }>
  skippedInvalid: number
  skippedDuplicateInFile: number
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

const MAX_REQUEST_BYTES = 4_500_000
const MAX_EMAILS_PER_REQUEST = 50000
const MAX_MEMBERS_PER_REQUEST = 5000

function chunkEmailsByBytes(emails: string[], maxBytes: number, maxCount: number): string[][] {
  const chunks: string[][] = []
  const baseBytes = JSON.stringify({ emails: [] }).length
  let current: string[] = []
  let currentBytes = baseBytes

  for (const email of emails) {
    const emailBytes = email.length + 3
    if (current.length > 0 && (currentBytes + emailBytes > maxBytes || current.length >= maxCount)) {
      chunks.push(current)
      current = []
      currentBytes = baseBytes
    }
    current.push(email)
    currentBytes += emailBytes
  }

  if (current.length > 0) {
    chunks.push(current)
  }

  return chunks
}

function chunkMembersByBytes(
  members: Array<{ firstName: string; lastName: string; email: string; sendEmail: boolean }>,
  maxBytes: number,
  maxCount: number,
) {
  const chunks: Array<Array<{ firstName: string; lastName: string; email: string; sendEmail: boolean }>> = []
  const baseBytes = JSON.stringify({ members: [] }).length
  let current: Array<{ firstName: string; lastName: string; email: string; sendEmail: boolean }> = []
  let currentBytes = baseBytes

  for (const member of members) {
    const rowBytes = JSON.stringify(member).length + 1
    if (current.length > 0 && (currentBytes + rowBytes > maxBytes || current.length >= maxCount)) {
      chunks.push(current)
      current = []
      currentBytes = baseBytes
    }
    current.push(member)
    currentBytes += rowBytes
  }

  if (current.length > 0) {
    chunks.push(current)
  }

  return chunks
}

function parseCsvToCandidates(csvText: string): ParsedCsvResult {
  const rows = parseCsv(csvText)
  if (rows.length === 0) {
    return { totalRows: 0, candidates: [], skippedInvalid: 0, skippedDuplicateInFile: 0 }
  }

  const firstRow = rows[0].map((value) => normalizeCsvHeader(String(value)))
  const hasHeader = firstRow.includes("email") || firstRow.includes("e-mail") || firstRow.includes("mail")
  const header = hasHeader ? firstRow : ["firstname", "lastname", "email"]
  const dataRows = hasHeader ? rows.slice(1) : rows

  const firstNameIdx = header.findIndex((h) => h === "firstname")
  const lastNameIdx = header.findIndex((h) => h === "lastname")
  const emailIdx = header.findIndex((h) => h === "email" || h === "mail" || h === "e-mail")

  if (firstNameIdx < 0 || lastNameIdx < 0 || emailIdx < 0) {
    throw new Error("CSV_INVALID")
  }

  const candidates: Array<{ firstName: string; lastName: string; email: string }> = []
  const seenEmails = new Set<string>()
  let skippedInvalid = 0
  let skippedDuplicateInFile = 0
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  for (const row of dataRows) {
    const firstName = String(row[firstNameIdx] ?? "").trim()
    const lastName = String(row[lastNameIdx] ?? "").trim()
    const emailRaw = String(row[emailIdx] ?? "").trim()
    const email = emailRaw.toLowerCase()

    if (!firstName || !lastName || !email) {
      skippedInvalid++
      continue
    }
    if (emailRegex.test(email) === false) {
      skippedInvalid++
      continue
    }
    if (seenEmails.has(email)) {
      skippedDuplicateInFile++
      continue
    }
    seenEmails.add(email)
    candidates.push({ firstName, lastName, email })
  }

  return {
    totalRows: dataRows.length,
    candidates,
    skippedInvalid,
    skippedDuplicateInFile,
  }
}

export default function OwnerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/admin")
    }
  }, [router])

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState("members")

  // --- MEMBERS STATE ---
  const [searchQuery, setSearchQuery] = useState("")
  const [blockedFilter, setBlockedFilter] = useState<"all" | "blocked" | "active">("all")
  const [membersPage, setMembersPage] = useState(1)
  const [membersData, setMembersData] = useState<Member[]>([])
  const [totalMembers, setTotalMembers] = useState(0)
  const [totalMembersPages, setTotalMembersPages] = useState(0)
  const [isMembersLoading, setIsMembersLoading] = useState(false)
  const membersPageSize = 20

  // --- CHECK-INS STATE ---
  const [checkInsData, setCheckInsData] = useState<CheckInEvent[]>([])
  const [checkInsPage, setCheckInsPage] = useState(1)
  const [totalCheckIns, setTotalCheckIns] = useState(0)
  const [totalCheckInsPages, setTotalCheckInsPages] = useState(0)
  const [isCheckInsLoading, setIsCheckInsLoading] = useState(false)
  const [unreadCheckInsCount, setUnreadCheckInsCount] = useState(0)
  const checkInsPageSize = 20

  // --- REFS ---
  const activeTabRef = useRef(activeTab)
  const checkInsPageRef = useRef(checkInsPage)
  const importFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])
  useEffect(() => { checkInsPageRef.current = checkInsPage }, [checkInsPage])

  // --- DIALOGS & FORMS ---
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  
  // Create State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    sendEmail: false 
  })
  const [createError, setCreateError] = useState<string | null>(null)
  
  // Import State
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importStep, setImportStep] = useState<"upload" | "review">("upload")
  const [importPreviewRows, setImportPreviewRows] = useState<ImportPreviewRow[]>([])
  const [importPreviewStats, setImportPreviewStats] = useState<ImportPreviewStats>({
    skippedInvalid: 0,
    skippedDuplicateInFile: 0,
    skippedExisting: 0,
  })
  const [showImportPreviewTable, setShowImportPreviewTable] = useState(true)
  const [importFileSummary, setImportFileSummary] = useState({ rows: 0, candidates: 0, size: 0 })
  const [importPreviewProgress, setImportPreviewProgress] = useState({ current: 0, total: 0 })
  const [importImportProgress, setImportImportProgress] = useState({ current: 0, total: 0 })
  const [importError, setImportError] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  
  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editMemberForm, setEditMemberForm] = useState({ 
    id: "", 
    firstName: "", 
    lastName: "", 
    email: "", 
    blocked: false 
  })

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [stats, setStats] = useState({ total: 0, blocked: 0, active: 0 })

  // --- CLEANUP EFFECT ---
  useEffect(() => {
    if (!createDialogOpen) {
      setCreateError(null)
      setNewMemberForm({ firstName: "", lastName: "", email: "", sendEmail: false })
    }
  }, [createDialogOpen])

  useEffect(() => {
    if (!importDialogOpen) {
      setCsvFile(null)
      setImportStep("upload")
      setImportPreviewRows([])
      setImportPreviewStats({ skippedInvalid: 0, skippedDuplicateInFile: 0, skippedExisting: 0 })
      setShowImportPreviewTable(true)
      setImportFileSummary({ rows: 0, candidates: 0, size: 0 })
      setImportPreviewProgress({ current: 0, total: 0 })
      setImportImportProgress({ current: 0, total: 0 })
      setImportError(null)
      setIsPreviewing(false)
      setIsImporting(false)
    }
  }, [importDialogOpen])

  // --- WEBSOCKET HANDLER ---
  const handleNewCheckIn = useCallback((event: CheckInEvent) => {
    setCheckInsData((prev) => {
      if (checkInsPageRef.current === 1) {
        const newList = [event, ...prev]
        if (newList.length > checkInsPageSize) return newList.slice(0, checkInsPageSize)
        return newList
      }
      return prev
    })

    if (activeTabRef.current !== "checkins") {
      setUnreadCheckInsCount((prev) => prev + 1)
      toast({
        title: event.warning ? t("dashboard.realtime.passbackWarning") : t("dashboard.realtime.newCheckin"),
        description: t("dashboard.realtime.memberCheckedIn", { firstName: event.member.firstName, lastName: event.member.lastName }),
        variant: event.warning ? "destructive" : "default",
      })
    }
  }, [toast, t])

  const { isConnected, error: wsError } = useRealtimeCheckIns(handleNewCheckIn)

  // --- LOAD MEMBERS ---
  const loadMembers = async () => {
    setIsMembersLoading(true)
    try {
      const blocked = blockedFilter === "blocked" ? true : blockedFilter === "active" ? false : undefined
      const result = await getMembers(membersPage, searchQuery, blocked || false, membersPageSize.toString())

      setMembersData(result.data || [])
      setTotalMembers(result.pagination?.total || 0)
      setTotalMembersPages(result.pagination?.totalPages || 1)
      
      const allData = result.data || []
      setStats({
          total: result.pagination?.total || 0,
          blocked: allData.filter((m: Member) => m.blocked).length,
          active: allData.filter((m: Member) => !m.blocked).length,
      })

    } catch (error) {
      console.error(error)
      toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedLoadMembers"), variant: "destructive" })
    } finally {
      setIsMembersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "members") {
      loadMembers()
    }
  }, [searchQuery, blockedFilter, membersPage, activeTab])

  // --- LOAD CHECK-INS ---
  const loadCheckIns = async () => {
    setIsCheckInsLoading(true)
    try {
      const result = await getCheckIns(checkInsPage, checkInsPageSize)
      setCheckInsData(result.data || [])
      setTotalCheckIns(result.pagination?.total || 0)
      setTotalCheckInsPages(result.pagination?.totalPages || 1)
    } catch (error) {
      console.error(error)
      toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedLoadCheckins"), variant: "destructive" })
    } finally {
      setIsCheckInsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "checkins") {
      setUnreadCheckInsCount(0)
      loadCheckIns()
    }
  }, [checkInsPage, activeTab])

  const importValidation = useMemo(() => {
    const invalidRowIds = new Set<string>()
    const duplicateRowIds = new Set<string>()
    const seenEmails = new Map<string, string>()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    for (const row of importPreviewRows) {
      const firstName = row.firstName.trim()
      const lastName = row.lastName.trim()
      const email = row.email.trim().toLowerCase()

      if (!firstName || !lastName || !email || emailRegex.test(email) === false) {
        invalidRowIds.add(row.id)
      }

      if (email) {
        const existing = seenEmails.get(email)
        if (existing) {
          duplicateRowIds.add(existing)
          duplicateRowIds.add(row.id)
        } else {
          seenEmails.set(email, row.id)
        }
      }
    }

    return {
      invalidRowIds,
      duplicateRowIds,
      hasIssues: invalidRowIds.size > 0 || duplicateRowIds.size > 0,
    }
  }, [importPreviewRows])

  const importAllSendEmail = importPreviewRows.length > 0 && importPreviewRows.every((row) => row.sendEmail)
  const importSomeSendEmail = importPreviewRows.some((row) => row.sendEmail)
  const canSubmitImport = importPreviewRows.length > 0 && !importValidation.hasIssues && !isImporting && !isPreviewing
  const previewProgressValue =
    importPreviewProgress.total > 0 ? Math.round((importPreviewProgress.current / importPreviewProgress.total) * 100) : 0
  const importProgressValue =
    importImportProgress.total > 0 ? Math.round((importImportProgress.current / importImportProgress.total) * 100) : 0


  // --- ACTION HANDLERS ---
  const handleSignOut = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  const handleCreateMember = async () => {
    setCreateError(null)

    if (!newMemberForm.firstName || !newMemberForm.lastName || !newMemberForm.email) {
      setCreateError(t("dashboard.toasts.allFieldsRequired"))
      return
    }

    setIsCreating(true)
    try {
      await createMember(newMemberForm)
      toast({ title: t("dashboard.toasts.memberCreatedTitle"), description: t("dashboard.toasts.memberCreatedDesc") })
      setCreateDialogOpen(false)
      setMembersPage(1)
      loadMembers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("dashboard.toasts.failedCreateMember")
      setCreateError(errorMessage) 
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditClick = (member: Member) => {
    setEditMemberForm({
      id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      blocked: member.blocked || false
    })
    setEditDialogOpen(true)
  }

  const handleUpdateMember = async () => {
     if (!editMemberForm.firstName || !editMemberForm.lastName || !editMemberForm.email) {
      toast({ title: t("dashboard.toasts.validationErrorTitle"), description: t("dashboard.toasts.allFieldsRequired"), variant: "destructive" })
      return
    }
    setIsUpdating(true)
    try {
      await updateMember(editMemberForm.id, {
        firstName: editMemberForm.firstName,
        lastName: editMemberForm.lastName,
        email: editMemberForm.email,
        blocked: editMemberForm.blocked
      })
      toast({ title: t("dashboard.toasts.memberUpdatedTitle"), description: t("dashboard.toasts.memberUpdatedDesc") })
      setEditDialogOpen(false)
      loadMembers()
    } catch (error) {
      toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedUpdateMember"), variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return

    setIsDeleting(true)
    try {
      await deleteMember(memberToDelete._id)
      toast({ title: t("dashboard.toasts.memberDeletedTitle"), description: t("dashboard.toasts.memberDeletedDesc", { name: memberToDelete.firstName }) })
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
      loadMembers()
    } catch (error) {
      toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedDeleteMember"), variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetQrCode = async (memberId: string) => {
    try {
      await resetQrCode(memberId)
      toast({ title: t("dashboard.toasts.qrResetTitle"), description: t("dashboard.toasts.qrResetDesc") })
      loadMembers()
      if (selectedMember && selectedMember._id === memberId) {
          setDetailsDrawerOpen(false) 
      }
    } catch (error) {
      toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedResetQr"), variant: "destructive" })
    }
  }

  const handleExportCSV = () => {
    try {
      const headers = ["firstName", "lastName", "email", "blocked", "emailValid", "createdAt"]
      const rows = membersData.map((m) => [m.firstName, m.lastName, m.email, m.blocked, m.emailValid, m.createdAt])
      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `members-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast({ title: t("dashboard.toasts.exportCompleteTitle"), description: t("dashboard.toasts.exportCompleteDesc") })
    } catch (error) {
      toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedExport"), variant: "destructive" })
    }
  }

  const handleImportFileChange = (file: File | null) => {
    setCsvFile(file)
    setImportError(null)
    setImportStep("upload")
    setImportPreviewRows([])
    setImportPreviewStats({ skippedInvalid: 0, skippedDuplicateInFile: 0, skippedExisting: 0 })
    setShowImportPreviewTable(true)
    setImportFileSummary({ rows: 0, candidates: 0, size: file?.size || 0 })
    setImportPreviewProgress({ current: 0, total: 0 })
    setImportImportProgress({ current: 0, total: 0 })
  }

  const handlePreviewImport = async () => {
    if (!csvFile) return
    setImportError(null)
    setIsPreviewing(true)
    setImportPreviewProgress({ current: 0, total: 0 })
    try {
      const content = await csvFile.text()
      const parsed = parseCsvToCandidates(content)
      setImportFileSummary({ rows: parsed.totalRows, candidates: parsed.candidates.length, size: csvFile.size })
      setImportPreviewStats({
        skippedInvalid: parsed.skippedInvalid,
        skippedDuplicateInFile: parsed.skippedDuplicateInFile,
        skippedExisting: 0,
      })

      if (parsed.candidates.length === 0) {
        setImportPreviewRows([])
        setImportStep("review")
        return
      }

      const emailChunks = chunkEmailsByBytes(
        parsed.candidates.map((candidate) => candidate.email),
        MAX_REQUEST_BYTES,
        MAX_EMAILS_PER_REQUEST,
      )
      setImportPreviewProgress({ current: 0, total: emailChunks.length })

      const existingEmails = new Set<string>()
      for (let i = 0; i < emailChunks.length; i++) {
        const result = await checkExistingEmails({ emails: emailChunks[i] })
        for (const email of result?.existingEmails || []) {
          existingEmails.add(String(email).toLowerCase())
        }
        setImportPreviewProgress({ current: i + 1, total: emailChunks.length })
      }

      const previewRows = parsed.candidates
        .filter((candidate) => !existingEmails.has(candidate.email))
        .map((candidate) => ({
          id: crypto.randomUUID(),
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          sendEmail: false,
        }))

      const skippedExisting = Math.max(0, parsed.candidates.length - previewRows.length)
      setImportPreviewRows(previewRows)
      setShowImportPreviewTable(previewRows.length <= 500)
      setImportPreviewStats({
        skippedInvalid: parsed.skippedInvalid,
        skippedDuplicateInFile: parsed.skippedDuplicateInFile,
        skippedExisting,
      })
      setImportStep("review")
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "CSV_INVALID"
          ? t("errors.CSV_INVALID")
          : error instanceof Error
            ? error.message
            : t("dashboard.toasts.failedImport")
      setImportError(errorMessage)
      toast({ title: t("dashboard.toasts.errorTitle"), description: errorMessage, variant: "destructive" })
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleImportRowChange = (id: string, field: "firstName" | "lastName" | "email" | "sendEmail", value: string | boolean) => {
    setImportPreviewRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const handleToggleAllSendEmail = (checked: boolean) => {
    setImportPreviewRows((prev) => prev.map((row) => ({ ...row, sendEmail: checked })))
  }

  const handleConfirmImport = async () => {
    if (!canSubmitImport) return

    setIsImporting(true)
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const seenEmails = new Set<string>()
      const cleanedRows: Array<{ firstName: string; lastName: string; email: string; sendEmail: boolean }> = []

      for (const row of importPreviewRows) {
        const firstName = row.firstName.trim()
        const lastName = row.lastName.trim()
        const email = row.email.trim().toLowerCase()
        if (!firstName || !lastName || !email || emailRegex.test(email) === false) {
          continue
        }
        if (seenEmails.has(email)) {
          continue
        }
        seenEmails.add(email)
        cleanedRows.push({ firstName, lastName, email, sendEmail: row.sendEmail })
      }

      if (cleanedRows.length === 0) {
        toast({ title: t("dashboard.toasts.errorTitle"), description: t("dashboard.toasts.failedImport"), variant: "destructive" })
        return
      }

      const memberChunks = chunkMembersByBytes(cleanedRows, MAX_REQUEST_BYTES, MAX_MEMBERS_PER_REQUEST)
      const totalBatches = memberChunks.length
      let totalInserted = 0
      let totalSkippedExisting = 0
      let totalInvalid = 0
      let totalDuplicate = 0
      let totalEmailFailed = 0

      setImportImportProgress({ current: 0, total: totalBatches })
      for (let i = 0; i < memberChunks.length; i++) {
        const res = await importMembersBatch(memberChunks[i])
        totalInserted += res?.inserted || 0
        totalSkippedExisting += res?.skippedExisting || 0
        totalInvalid += res?.invalid || 0
        totalDuplicate += res?.duplicateInBatch || 0
        totalEmailFailed += res?.emailFailed || 0
        setImportImportProgress({ current: i + 1, total: totalBatches })
      }

      toast({
        title: t("dashboard.toasts.importCompleteTitle"),
        description: t("dashboard.toasts.importCompleteDesc", { count: totalInserted }),
      })

      if (totalSkippedExisting > 0 || totalInvalid > 0 || totalDuplicate > 0 || totalEmailFailed > 0) {
        toast({
          title: t("dashboard.toasts.errorTitle"),
          description: t("dashboard.dialogs.importReviewIssues", {
            existing: totalSkippedExisting,
            invalid: totalInvalid,
            duplicate: totalDuplicate,
            emailFailed: totalEmailFailed,
          }),
          variant: "destructive",
        })
      }

      setImportDialogOpen(false)
      setMembersPage(1)
      loadMembers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("dashboard.toasts.failedImport")
      toast({ title: t("dashboard.toasts.errorTitle"), description: errorMessage, variant: "destructive" })
    } finally {
      setIsImporting(false)
    }
  }

  const handleViewMember = (member: Member) => { setSelectedMember(member); setDetailsDrawerOpen(true) }
  
  const handlePrintQR = (member: Member) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(member.qrUuid)}`

    // We use translation keys even inside the HTML template
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${member.firstName} ${member.lastName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; background: white; }
            .container { text-align: center; max-width: 400px; }
            .logo { margin-bottom: 20px; }
            h1 { color: #2f699f; margin: 0 0 10px 0; font-size: 24px; }
            .subtitle { color: #666; margin: 0 0 30px 0; font-size: 14px; }
            .qr-code { margin: 30px 0; padding: 20px; background: white; border: 2px solid #2f699f; border-radius: 12px; display: inline-block; }
            .qr-code img { display: block; width: 300px; height: 300px; }
            .member-info { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: left; }
            .info-row { margin: 10px 0; font-size: 14px; }
            .info-label { font-weight: 600; color: #2f699f; display: inline-block; width: 100px; }
            .info-value { color: #333; }
            @media print { body { padding: 0; } .container { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>15 Palle</h1>
            <p class="subtitle">Associazione Sportiva</p>
            <div class="qr-code"><img src="${qrCodeUrl}" alt="QR Code" /></div>
            <div class="member-info">
              <div class="info-row"><span class="info-label">${t("dashboard.dialogs.nameLabel")}</span><span class="info-value">${member.firstName} ${member.lastName}</span></div>
              <div class="info-row"><span class="info-label">${t("dashboard.dialogs.emailLabel")}</span><span class="info-value">${member.email}</span></div>
              <div class="info-row"><span class="info-label">${t("dashboard.dialogs.idLabel")}</span><span class="info-value">${member._id}</span></div>
            </div>
          </div>
          <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{t("dashboard.title")}</h1>
              <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
              {wsError && <p className="text-sm text-destructive mt-1">{t("dashboard.websocketPrefix")} {wsError}</p>}
              {isConnected && <p className="text-sm text-green-600 mt-1">{t("dashboard.realtimeConnected")}</p>}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{t("dashboard.stats.totalMembers")}</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{t("dashboard.stats.active")}</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                    {membersData.filter(m => !m.blocked).length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium">{t("dashboard.stats.blocked")}</CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                    {membersData.filter(m => m.blocked).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">{t("dashboard.tabs.members")}</TabsTrigger>
              <TabsTrigger value="checkins">
                {t("dashboard.tabs.checkins")}
                {unreadCheckInsCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">{unreadCheckInsCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* --- MEMBERS TAB --- */}
            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>{t("dashboard.members.title")}</CardTitle>
                      <CardDescription>{t("dashboard.members.description")}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" /> {t("dashboard.members.addMember")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" /> {t("dashboard.members.export")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> {t("dashboard.members.import")}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Filters */}
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="search">{t("dashboard.members.searchLabel")}</Label>
                        <Input
                          id="search"
                          placeholder={t("dashboard.members.searchPlaceholder")}
                          value={searchQuery}
                          onChange={(e) => { setSearchQuery(e.target.value); setMembersPage(1) }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">{t("dashboard.members.statusLabel")}</Label>
                        <select
                          id="status"
                          value={blockedFilter}
                          onChange={(e) => { setBlockedFilter(e.target.value as SetStateAction<"all" | "blocked" | "active">); setMembersPage(1) }}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="all">{t("dashboard.members.statusAll")}</option>
                          <option value="active">{t("dashboard.members.statusActive")}</option>
                          <option value="blocked">{t("dashboard.members.statusBlocked")}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Members Table */}
                  {isMembersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-muted-foreground">{t("dashboard.members.loading")}</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("dashboard.members.table.name")}</TableHead>
                            <TableHead className="hidden sm:table-cell">{t("dashboard.members.table.email")}</TableHead>
                            <TableHead className="hidden md:table-cell">{t("dashboard.members.table.created")}</TableHead>
                            <TableHead>{t("dashboard.members.table.status")}</TableHead>
                            <TableHead className="text-right">{t("dashboard.members.table.actions")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {membersData.map((member) => (
                            <TableRow key={member._id}>
                              <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                              <TableCell className="hidden sm:table-cell">{member.email}</TableCell>
                              <TableCell className="hidden md:table-cell">{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {member.blocked ? (
                                    <Badge variant="destructive">{t("dashboard.members.statusBadges.blocked")}</Badge>
                                ) : member.emailValid ? (
                                    <Badge className="bg-green-600 hover:bg-green-700">{t("dashboard.members.statusBadges.active")}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t("dashboard.members.statusBadges.pending")}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleViewMember(member)} title={t("dashboard.dialogs.detailsTitle")}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handlePrintQR(member)} title={t("dashboard.dialogs.printQr")}>
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleResetQrCode(member._id)} title={t("dashboard.dialogs.resetQr")}>
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(member)} title={t("dashboard.dialogs.editTitle")}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(member)} title={t("dashboard.dialogs.deleteTitle")}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {membersData.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t("dashboard.members.noMembers")}</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalMembersPages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("dashboard.members.pagination", { page: membersPage, totalPages: totalMembersPages, total: totalMembers })}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setMembersPage(p => Math.max(1, p - 1))} disabled={membersPage === 1}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setMembersPage(p => Math.min(totalMembersPages, p + 1))} disabled={membersPage === totalMembersPages}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- CHECK-INS TAB --- */}
            <TabsContent value="checkins" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("dashboard.checkins.title")}</CardTitle>
                    <CardDescription>{t("dashboard.checkins.description")}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isCheckInsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-muted-foreground">{t("dashboard.checkins.loading")}</div>
                    </div>
                  ) : checkInsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t("dashboard.checkins.none")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {checkInsData.map((checkIn: CheckInEvent, index) => {
                        const hasWarning = checkIn.warning;
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                              hasWarning 
                                ? "border-destructive/50 bg-destructive/15" 
                                : "border-border bg-card"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ${
                                  hasWarning ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                                }`}>
                                {hasWarning ? <AlertCircle className="h-5 w-5" /> : "✓"}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {checkIn.member ? `${checkIn.member.firstName} ${checkIn.member.lastName}` : t("dashboard.checkins.unknownMember")}
                                </p>
                                <p className={`text-sm ${hasWarning ? "text-foreground/80" : "text-muted-foreground"}`}>
                                  {checkIn.member?.email || t("dashboard.checkins.noEmail")}
                                </p>
                                {hasWarning && (
                                  <p className="text-sm text-destructive font-medium mt-1 flex items-center gap-1">
                                    {hasWarning}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {new Date(checkIn.timestamp|| Date.now()).toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(checkIn.timestamp || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Check-ins Pagination */}
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                       {t("dashboard.checkins.pagination", { page: checkInsPage, totalPages: totalCheckInsPages, total: totalCheckIns })}
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCheckInsPage(p => Math.max(1, p - 1))} 
                            disabled={checkInsPage === 1 || isCheckInsLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCheckInsPage(p => Math.min(totalCheckInsPages, p + 1))} 
                            disabled={checkInsPage === totalCheckInsPages || isCheckInsLoading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Create Member Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.dialogs.createTitle")}</DialogTitle>
            <DialogDescription>{t("dashboard.dialogs.createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-firstName">{t("dashboard.dialogs.firstName")}</Label>
              <Input
                id="new-firstName"
                value={newMemberForm.firstName}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-lastName">{t("dashboard.dialogs.lastName")}</Label>
              <Input
                id="new-lastName"
                value={newMemberForm.lastName}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">{t("dashboard.dialogs.email")}</Label>
              <Input
                id="new-email"
                type="email"
                value={newMemberForm.email}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Send Email Toggle */}
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="send-email" 
                checked={newMemberForm.sendEmail}
                onCheckedChange={(checked) => setNewMemberForm({...newMemberForm, sendEmail: checked})}
              />
              <Label htmlFor="send-email" className="font-normal cursor-pointer">
                {t("dashboard.dialogs.sendEmailWithQr")}
              </Label>
            </div>

            {/* Error Message Display */}
            {createError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 mt-2">
                <p className="text-sm text-destructive font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {createError}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreateMember} disabled={isCreating}>{isCreating ? t("dashboard.dialogs.creating") : t("dashboard.dialogs.createCta")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.dialogs.editTitle")}</DialogTitle>
            <DialogDescription>{t("dashboard.dialogs.editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">{t("dashboard.dialogs.firstName")}</Label>
              <Input
                id="edit-firstName"
                value={editMemberForm.firstName}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">{t("dashboard.dialogs.lastName")}</Label>
              <Input
                id="edit-lastName"
                value={editMemberForm.lastName}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t("dashboard.dialogs.email")}</Label>
              <Input
                id="edit-email"
                value={editMemberForm.email}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
              />
            </div>
            
            {/* Status Radio Buttons */}
            <div className="space-y-3 pt-2">
              <Label>{t("dashboard.dialogs.status")}</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    checked={!editMemberForm.blocked}
                    onChange={() => setEditMemberForm({ ...editMemberForm, blocked: false })}
                  />
                  <Label htmlFor="status-active" className="font-normal cursor-pointer">{t("dashboard.dialogs.active")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-blocked"
                    name="status"
                    className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-600"
                    checked={editMemberForm.blocked}
                    onChange={() => setEditMemberForm({ ...editMemberForm, blocked: true })}
                  />
                  <Label htmlFor="status-blocked" className="font-normal cursor-pointer text-red-600">{t("dashboard.dialogs.blocked")}</Label>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdateMember} disabled={isUpdating}>
              {isUpdating ? t("dashboard.dialogs.saving") : t("dashboard.dialogs.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.dialogs.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.dialogs.deleteDescription", { name: memberToDelete?.firstName + " " + memberToDelete?.lastName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
            >
              {isDeleting ? t("dashboard.dialogs.deleting") : t("dashboard.dialogs.deleteCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("dashboard.dialogs.importTitle")}</DialogTitle>
            <DialogDescription>{t("dashboard.dialogs.importDescription")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className={importStep === "upload" ? "font-medium text-foreground" : ""}>
              {t("dashboard.dialogs.importStepUpload")}
            </span>
            <span>•</span>
            <span className={importStep === "review" ? "font-medium text-foreground" : ""}>
              {t("dashboard.dialogs.importStepReview")}
            </span>
            <span>•</span>
            <span className={importStep === "review" && isImporting ? "font-medium text-foreground" : ""}>
              {t("dashboard.dialogs.importStepCreate")}
            </span>
          </div>
          {importStep === "upload" ? (
            <div className="space-y-4 py-4">
              <input
                ref={importFileInputRef}
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={(e) => handleImportFileChange(e.target.files?.[0] || null)}
              />
              <div
                className="rounded-md border border-dashed p-4 transition-colors hover:border-primary/70 cursor-pointer"
                onClick={() => importFileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    importFileInputRef.current?.click()
                  }
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{t("dashboard.dialogs.importSelectFile")}</p>
                    {csvFile ? (
                      <p className="text-xs text-muted-foreground">
                        <span className="mr-1">{t("dashboard.dialogs.importFileSelectedLabel")}</span>
                        <span className="font-medium text-foreground">{csvFile.name}</span>
                        <span className="ml-2">({formatBytes(csvFile.size)})</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t("dashboard.dialogs.importNoFile")}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      importFileInputRef.current?.click()
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t("dashboard.dialogs.importChooseFile")}
                  </Button>
                </div>
              </div>
              {csvFile && (
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                  <p>{t("dashboard.dialogs.importSplitHint")}</p>
                </div>
              )}
              {isPreviewing && (
                <div className="space-y-2">
                  <Progress value={previewProgressValue} />
                  <p className="text-xs text-muted-foreground">
                    {importPreviewProgress.total > 0
                      ? t("dashboard.dialogs.importPreviewProgress", {
                          current: importPreviewProgress.current,
                          total: importPreviewProgress.total,
                        })
                      : t("dashboard.dialogs.importParsing")}
                  </p>
                </div>
              )}
              {importError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {importError}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>{t("dashboard.dialogs.importPreviewSummary", { count: importPreviewRows.length })}</p>
                <p>
                  {t("dashboard.dialogs.importFileSummary", {
                    rows: importFileSummary.rows,
                    eligible: importFileSummary.candidates,
                  })}
                </p>
                <p>
                  {t("dashboard.dialogs.importPreviewFiltered", {
                    existing: importPreviewStats.skippedExisting,
                    invalid: importPreviewStats.skippedInvalid,
                    duplicate: importPreviewStats.skippedDuplicateInFile,
                  })}
                </p>
              </div>

              {isImporting && (
                <div className="space-y-2">
                  <Progress value={importProgressValue} />
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.dialogs.importImportProgress", {
                      current: importImportProgress.current,
                      total: importImportProgress.total,
                    })}
                  </p>
                </div>
              )}

              {importValidation.hasIssues && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive font-medium">
                    {t("dashboard.dialogs.importValidationIssues", {
                      invalid: importValidation.invalidRowIds.size,
                      duplicate: importValidation.duplicateRowIds.size,
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="import-send-all"
                    checked={importAllSendEmail ? true : importSomeSendEmail ? "indeterminate" : false}
                    onCheckedChange={(checked) => handleToggleAllSendEmail(checked === true)}
                    disabled={importPreviewRows.length === 0}
                  />
                  <Label htmlFor="import-send-all" className="font-normal cursor-pointer">
                    {t("dashboard.dialogs.importSendEmailAll")}
                  </Label>
                </div>
                {csvFile?.name && (
                  <span className="text-xs text-muted-foreground">
                    {csvFile.name} • {formatBytes(csvFile.size)}
                  </span>
                )}
              </div>

              {importPreviewRows.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{t("dashboard.dialogs.importPreviewRowCount", { count: importPreviewRows.length })}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImportPreviewTable((prev) => !prev)}
                  >
                    {showImportPreviewTable
                      ? t("dashboard.dialogs.importHidePreview")
                      : t("dashboard.dialogs.importShowPreview")}
                  </Button>
                </div>
              )}

              {importPreviewRows.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {t("dashboard.dialogs.importNoPreview")}
                </div>
              ) : showImportPreviewTable ? (
                <div className="max-h-72 overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dashboard.dialogs.firstName")}</TableHead>
                        <TableHead>{t("dashboard.dialogs.lastName")}</TableHead>
                        <TableHead>{t("dashboard.dialogs.email")}</TableHead>
                        <TableHead className="text-center">{t("dashboard.dialogs.importSendEmail")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreviewRows.map((row) => {
                        const hasIssue =
                          importValidation.invalidRowIds.has(row.id) || importValidation.duplicateRowIds.has(row.id)
                        return (
                          <TableRow key={row.id} className={hasIssue ? "bg-destructive/5" : ""}>
                            <TableCell>
                              <Input
                                value={row.firstName}
                                onChange={(e) => handleImportRowChange(row.id, "firstName", e.target.value)}
                                className={hasIssue ? "border-destructive" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={row.lastName}
                                onChange={(e) => handleImportRowChange(row.id, "lastName", e.target.value)}
                                className={hasIssue ? "border-destructive" : ""}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="email"
                                value={row.email}
                                onChange={(e) => handleImportRowChange(row.id, "email", e.target.value)}
                                className={hasIssue ? "border-destructive" : ""}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={row.sendEmail}
                                onCheckedChange={(checked) => handleImportRowChange(row.id, "sendEmail", checked === true)}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {t("dashboard.dialogs.importPreviewHidden")}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {importStep === "upload" ? (
              <>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handlePreviewImport} disabled={!csvFile || isPreviewing}>
                  {isPreviewing ? t("dashboard.dialogs.importPreviewing") : t("dashboard.dialogs.importPreviewCta")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setImportStep("upload")} disabled={isImporting}>
                  {t("dashboard.dialogs.importBack")}
                </Button>
                <Button onClick={handleConfirmImport} disabled={!canSubmitImport}>
                  {isImporting ? t("dashboard.dialogs.importing") : t("dashboard.dialogs.importCreateCta")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Details Drawer */}
      <Sheet open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>{t("dashboard.dialogs.detailsTitle")}</SheetTitle>
            <SheetDescription>{t("dashboard.dialogs.detailsDescription")}</SheetDescription>
          </SheetHeader>
          {selectedMember && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                
                {/* 1. Personal Information */}
                <Card className="px-4 py-3">
                  <h3 className="mb-3 text-sm font-semibold">{t("dashboard.dialogs.personalInfo")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dashboard.dialogs.nameLabel")}</span>
                      <span className="font-medium">{selectedMember.firstName} {selectedMember.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dashboard.dialogs.emailLabel")}</span>
                      <span className="font-medium">{selectedMember.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dashboard.dialogs.idLabel")}</span>
                      <span className="font-mono text-xs">{selectedMember._id}</span>
                    </div>
                  </div>
                </Card>

                {/* 2. Account Status */}
                <Card className="px-4 py-3">
                  <h3 className="mb-3 text-sm font-semibold">{t("profile.accountDetails")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("dashboard.dialogs.status")}</span>
                      {selectedMember.blocked ? (
                        <Badge variant="destructive">{t("dashboard.members.statusBadges.blocked")}</Badge>
                      ) : selectedMember.emailValid ? (
                        <Badge className="bg-green-600">{t("dashboard.members.statusBadges.active")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("dashboard.members.statusBadges.pending")}</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("dashboard.members.table.created")}:</span>
                      <span className="font-medium">{new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>

                <Card className="px-4 py-3">
                  <h3 className="mb-3 text-sm font-semibold">{t("dashboard.dialogs.qrCode")}</h3>
                  <div className="flex justify-center py-4">
                    <Image
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedMember.qrUuid)}`}
                      alt={t("dashboard.dialogs.qrCode")}
                      width={200}
                      height={200}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    QR UUID: {selectedMember.qrUuid.substring(0, 8)}...
                  </p>
                </Card>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => handlePrintQR(selectedMember)} className="w-full">
                  <Printer className="mr-2 h-4 w-4" /> {t("dashboard.dialogs.printQr")}
                </Button>
                <Button variant="outline" onClick={() => handleResetQrCode(selectedMember._id)} className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" /> {t("dashboard.dialogs.resetQr")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}