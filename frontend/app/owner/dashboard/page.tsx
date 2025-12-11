"use client"

import { RequireRole } from "@/components/require-role"
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
import { members, auth, checkIn } from "@/lib/mock-api"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut,
  Users,
  Download,
  Upload,
  Eye,
  Lock,
  Unlock,
  RotateCcw,
  Printer,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import type { Member, RecentCheckIn } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"

function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()

  // Search and filter states
  const [firstNameFilter, setFirstNameFilter] = useState("")
  const [lastNameFilter, setLastNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [blockedFilter, setBlockedFilter] = useState<"all" | "blocked" | "active">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Members state
  const [membersData, setMembersData] = useState<Member[]>([])
  const [totalMembers, setTotalMembers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Dialog states
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  // Create member form
  const [newMemberForm, setNewMemberForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  // Recent check-ins
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([])

  useEffect(() => {
    loadMembers()
    loadRecentCheckIns()

    // Simulate WebSocket updates
    const interval = setInterval(() => {
      loadRecentCheckIns()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadMembers()
  }, [firstNameFilter, lastNameFilter, emailFilter, blockedFilter, currentPage])

  const loadMembers = () => {
    const blocked = blockedFilter === "blocked" ? true : blockedFilter === "active" ? false : undefined

    const result = members.list({
      firstName: firstNameFilter,
      lastName: lastNameFilter,
      email: emailFilter,
      blocked,
      page: currentPage,
      pageSize,
    })

    setMembersData(result.data)
    setTotalMembers(result.total)
    setTotalPages(result.totalPages)
  }

  const loadRecentCheckIns = () => {
    const checkIns = checkIn.getRecentCheckIns(10)
    setRecentCheckIns(checkIns)
  }

  const handleSignOut = () => {
    auth.logout()
    router.push("/")
  }

  const handleCreateMember = () => {
    try {
      if (!newMemberForm.firstName || !newMemberForm.lastName || !newMemberForm.email) {
        toast({
          title: "Validation error",
          description: "All fields are required",
          variant: "destructive",
        })
        return
      }

      members.create({
        firstName: newMemberForm.firstName,
        lastName: newMemberForm.lastName,
        email: newMemberForm.email,
      })

      toast({
        title: "Member created",
        description: "New member has been added successfully.",
      })

      setCreateDialogOpen(false)
      setNewMemberForm({ firstName: "", lastName: "", email: "" })
      setCurrentPage(1)
      loadMembers()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create member",
        variant: "destructive",
      })
    }
  }

  const handleToggleBlocked = (memberId: string) => {
    try {
      members.toggleBlocked(memberId)
      toast({
        title: "Success",
        description: "Member status updated.",
      })
      loadMembers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      })
    }
  }

  const handleResetQrCode = (memberId: string) => {
    try {
      members.resetQrCode(memberId)
      toast({
        title: "QR Code reset",
        description: "Member QR code has been regenerated.",
      })
      loadMembers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset QR code",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    try {
      const csv = members.exportCSV()
      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `members-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export complete",
        description: "Members data has been exported to CSV.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      })
    }
  }

  const handleImportCSV = () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const result = members.importCSV(content)

        toast({
          title: "Import complete",
          description: `Imported ${result.imported} members${result.errors.length > 0 ? `. ${result.errors.length} errors occurred.` : "."}`,
        })

        if (result.errors.length > 0) {
          console.log("Import errors:", result.errors)
        }

        setImportDialogOpen(false)
        setCsvFile(null)
        setCurrentPage(1)
        loadMembers()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import CSV",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(csvFile)
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setDetailsDrawerOpen(true)
  }

  const handlePrintQR = (member: Member) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(member.qrUuid)}`

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${member.firstName} ${member.lastName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            .logo {
              margin-bottom: 20px;
            }
            .logo img {
              width: 150px;
              height: auto;
            }
            h1 {
              color: #2f699f;
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .subtitle {
              color: #666;
              margin: 0 0 30px 0;
              font-size: 14px;
            }
            .qr-code {
              margin: 30px 0;
              padding: 20px;
              background: white;
              border: 2px solid #2f699f;
              border-radius: 12px;
              display: inline-block;
            }
            .qr-code img {
              display: block;
              width: 300px;
              height: 300px;
            }
            .member-info {
              margin-top: 30px;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 8px;
              text-align: left;
            }
            .info-row {
              margin: 10px 0;
              font-size: 14px;
            }
            .info-label {
              font-weight: 600;
              color: #2f699f;
              display: inline-block;
              width: 100px;
            }
            .info-value {
              color: #333;
            }
            @media print {
              body {
                padding: 0;
              }
              .container {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <img src="/logo.png" alt="15 Palle Logo" />
            </div>
            <h1>15 Palle</h1>
            <p class="subtitle">Associazione Sportiva</p>
            
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            
            <div class="member-info">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${member.firstName} ${member.lastName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${member.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Member ID:</span>
                <span class="info-value">${member._id}</span>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
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
              <h1 className="mb-2 text-3xl font-bold">Owner Dashboard</h1>
              <p className="text-muted-foreground">Manage club members</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalMembers}</div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{membersData.filter((m) => !m.blocked).length}</div>
              </CardContent>
            </Card>

            <Card className="border-red-200 sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked</CardTitle>
                <Users className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{membersData.filter((m) => m.blocked).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="checkins">Recent Check-ins</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Members Management</CardTitle>
                      <CardDescription>View and manage all club members</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Filters */}
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Filter by first name..."
                          value={firstNameFilter}
                          onChange={(e) => {
                            setFirstNameFilter(e.target.value)
                            setCurrentPage(1)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Filter by last name..."
                          value={lastNameFilter}
                          onChange={(e) => {
                            setLastNameFilter(e.target.value)
                            setCurrentPage(1)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Filter by email..."
                          value={emailFilter}
                          onChange={(e) => {
                            setEmailFilter(e.target.value)
                            setCurrentPage(1)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          value={blockedFilter}
                          onChange={(e) => {
                            setBlockedFilter(e.target.value as "all" | "blocked" | "active")
                            setCurrentPage(1)
                          }}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="all">All Members</option>
                          <option value="active">Active</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Email</TableHead>
                          <TableHead className="hidden md:table-cell">Created</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {membersData.map((member) => (
                          <TableRow key={member._id}>
                            <TableCell className="font-medium">
                              {member.firstName} {member.lastName}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{member.email}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {member.blocked ? (
                                <Badge variant="destructive">Blocked</Badge>
                              ) : (
                                <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewMember(member)}
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handlePrintQR(member)}
                                  title="Print QR code"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleBlocked(member._id!)}
                                  title={member.blocked ? "Unblock member" : "Block member"}
                                >
                                  {member.blocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages || 1} ({totalMembers} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checkins" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Check-ins</CardTitle>
                  <CardDescription>Members who recently scanned their QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentCheckIns.length === 0 ? (
                    <div className="py-12 text-center">
                      <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent check-ins</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentCheckIns.map((checkIn, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <p className="font-medium">{checkIn.memberName}</p>
                            <p className="text-sm text-muted-foreground">{checkIn.memberEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{new Date(checkIn.timestamp).toLocaleTimeString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(checkIn.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Member Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Member</DialogTitle>
            <DialogDescription>Create a new club member account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={newMemberForm.firstName}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={newMemberForm.lastName}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMemberForm.email}
                onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMember}>Create Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Members from CSV</DialogTitle>
            <DialogDescription>Upload a CSV file with firstName, lastName, and email columns</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">CSV format: firstName,lastName,email</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportCSV} disabled={!csvFile}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Details Sheet */}
      <Sheet open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Member Details</SheetTitle>
            <SheetDescription>
              {selectedMember?.firstName} {selectedMember?.lastName}
            </SheetDescription>
          </SheetHeader>

          {selectedMember && (
            <div className="space-y-6 py-4">
              <div className="space-y-4 rounded-lg bg-muted p-4">
                <div>
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <p className="font-medium">{selectedMember.firstName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <p className="font-medium">{selectedMember.lastName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium break-all">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Member ID</Label>
                  <p className="font-mono text-sm">{selectedMember._id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="font-medium">{new Date(selectedMember.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    {selectedMember.blocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge className="bg-green-600">Active</Badge>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleResetQrCode(selectedMember._id!)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset QR Code
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handlePrintQR(selectedMember)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print QR Code
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleToggleBlocked(selectedMember._id!)}
                >
                  {selectedMember.blocked ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Unblock Member
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Block Member
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  )
}

export default function OwnerDashboardPage() {
  return (
    <RequireRole role="owner">
      <DashboardContent />
    </RequireRole>
  )
}
