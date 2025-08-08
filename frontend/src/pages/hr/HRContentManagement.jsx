import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Plus, Calendar, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function HRContentManagement() {
  const { toast } = useToast();

  // All announcements (always show every row from DB)
  const [items, setItems] = useState([]);

  // Create form state (Add dialog)
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("employee");
  const [message, setMessage] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [priority, setPriority] = useState(1);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDepartment, setEditDepartment] = useState("employee");
  const [editMessage, setEditMessage] = useState("");
  const [editCreatedBy, setEditCreatedBy] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editIsActive, setEditIsActive] = useState(true);

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Load ALL announcements from DB on mount
useEffect(() => {
    // type 1 = Reload
    refreshList();
  
}, []);


  async function refreshList() {
    try {
      const response = await axios.get("/api/hr-announcements", {
        params: { active: false } // Get all including inactive
      });
      setItems(response.data || []);
      console.log("Loaded announcements:", response.data);
    } catch (error) {
      console.error("Failed to load announcements:", error);
      setItems([]);
      toast({
        title: "Error",
        description: "Failed to load announcements from server.",
        variant: "destructive",
      });
    }
  }

  // Get priority label and color
  function getPriorityInfo(priority) {
    const priorities = {
      1: { label: "Low", color: "bg-gray-100 text-gray-800" },
      2: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
      3: { label: "High", color: "bg-red-100 text-red-800" }
    };
    return priorities[priority] || priorities[1];
  }

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString();
  }

  // Check if announcement is expired
  function isExpired(expiryDate) {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  }

  // ---------- Create ----------
  async function publishAnnouncement() {
    if (!title || !department || !message || !createdBy) {
      toast({
        title: "Missing fields",
        description: "Title, department, message, and created by are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        title,
        message,
        createdBy,
        department,
        priority,
        isActive: true
      };
      
      if (expiryDate) {
        payload.expiryDate = expiryDate;
      }

      console.log("Creating announcement with payload:", payload);
      const response = await axios.post("/api/hr-announcements", payload);
      console.log("Create response:", response.data);
      
      // Refresh list for ground truth
      await refreshList();
      
      // Reset form
      setTitle("");
      setDepartment("employee");
      setMessage("");
      setCreatedBy("");
      setExpiryDate("");
      setPriority(1);
      
      toast({ title: "Published", description: "Announcement created successfully." });
    } catch (error) {
      console.error("Create announcement error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Could not publish announcement.",
        variant: "destructive",
      });
    }
  }

  // ---------- Edit ----------
  function startEdit(item) {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDepartment(item.department);
    setEditMessage(item.message);
    setEditCreatedBy(item.createdBy);
    setEditExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : "");
    setEditPriority(item.priority);
    setEditIsActive(item.isActive);
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editId || !editTitle || !editDepartment || !editMessage || !editCreatedBy) {
      toast({
        title: "Missing fields",
        description: "Title, department, message, and created by are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        title: editTitle,
        message: editMessage,
        createdBy: editCreatedBy,
        department: editDepartment,
        priority: editPriority,
        isActive: editIsActive
      };
      
      if (editExpiryDate) {
        payload.expiryDate = editExpiryDate;
      }

      console.log("Updating announcement:", editId, payload);
      const response = await axios.put(`/api/hr-announcements/${editId}`, payload);
      console.log("Update response:", response.data);

      // Update local state optimistically
      setItems((prev) =>
        prev.map((i) =>
          i.id === editId ? { 
            ...i, 
            title: editTitle, 
            department: editDepartment, 
            message: editMessage,
            createdBy: editCreatedBy,
            expiryDate: editExpiryDate || null,
            priority: editPriority,
            isActive: editIsActive
          } : i
        )
      );

      setEditOpen(false);
      setEditId(null);
      setEditTitle("");
      setEditDepartment("employee");
      setEditMessage("");
      setEditCreatedBy("");
      setEditExpiryDate("");
      setEditPriority(1);
      setEditIsActive(true);
      
      toast({ title: "Updated", description: "Announcement updated successfully." });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Could not update announcement.",
        variant: "destructive",
      });
    }
  }

  // ---------- Preview ----------
  function openPreview(item) {
    setPreviewItem(item);
    setPreviewOpen(true);
  }

  // ---------- Delete ----------
  async function deleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement? This action cannot be undone.")) return;
    try {
      console.log("Deleting announcement:", id);
      const response = await axios.delete(`/api/hr-announcements/${id}`);
      console.log("Delete response:", response.data);
      
      // Remove locally
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Deleted", description: "Announcement removed." });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete announcement.",
        variant: "destructive",
      });
    }
  }

  // ---------- Toggle Active Status ----------
  async function toggleActiveStatus(id, currentStatus) {
    try {
      const endpoint = currentStatus ? 
        `/api/hr-announcements/${id}/deactivate` : 
        `/api/hr-announcements/${id}`;
      
      console.log("Toggling status for:", id, "current:", currentStatus);
      
      if (currentStatus) {
        // Deactivate
        const response = await axios.put(endpoint);
        console.log("Deactivate response:", response.data);
      } else {
        // Reactivate - need to update the item
        const item = items.find(i => i.id === id);
        const response = await axios.put(endpoint, { ...item, isActive: true });
        console.log("Activate response:", response.data);
      }
      
      // Update local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, isActive: !currentStatus } : i
        )
      );
      
      toast({ 
        title: currentStatus ? "Deactivated" : "Activated", 
        description: `Announcement ${currentStatus ? 'deactivated' : 'activated'} successfully.` 
      });
    } catch (error) {
      console.error("Toggle status error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update announcement status.",
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Content Management</h1>
            <p className="text-muted-foreground">Create and manage announcements for all departments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Add Announcement Card */}
            <Card>
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Create content displayed across the departments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add announcement
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Announcement</DialogTitle>
                      <DialogDescription>Add new content that will be displayed across the departments.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Input
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />

                      <Input
                        placeholder="Created By (your name/username)"
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                      />

                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Target Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={priority.toString()} onValueChange={(v) => setPriority(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Low Priority</SelectItem>
                          <SelectItem value="2">Medium Priority</SelectItem>
                          <SelectItem value="3">High Priority</SelectItem>
                        </SelectContent>
                      </Select>

                      <div>
                        <label className="text-sm font-medium">Expiry Date (optional)</label>
                        <Input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                        />
                      </div>

                      <textarea
                        className="w-full h-32 border rounded p-3 text-sm"
                        placeholder="Message content..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />

                      <div className="flex gap-2">
                        <Button variant="secondary">Save as Draft</Button> {/* no-op */}
                        <Button variant="outline" onClick={publishAnnouncement}>
                          Publish
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Quick glance at your content.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-blue-600">{items.filter(i => i.isActive).length}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-gray-600">{items.filter(i => !i.isActive).length}</div>
                  <div className="text-sm text-muted-foreground">Inactive</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {items.filter(i => isExpired(i.expiryDate) && i.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Expired</div>
                </div>
                <div className="text-center p-3 border rounded">
                  <div className="text-2xl font-bold text-orange-600">
                    {items.filter(i => i.priority === 3 && i.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column — Existing Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Content</CardTitle>
                <CardDescription>Ordered by priority, then creation date.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-muted-foreground">No items yet.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded p-4 ${!item.isActive ? 'opacity-60 bg-gray-50' : ''} ${isExpired(item.expiryDate) ? 'border-red-200' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge className={getPriorityInfo(item.priority).color}>
                              {getPriorityInfo(item.priority).label}
                            </Badge>
                            {!item.isActive && <Badge variant="secondary">Inactive</Badge>}
                            {isExpired(item.expiryDate) && <Badge variant="destructive">Expired</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span>Department: <span className="uppercase font-medium">{item.department}</span></span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.createdBy}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created: {formatDate(item.createdDate)}
                              </span>
                              {item.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Expires: {formatDate(item.expiryDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => openPreview(item)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant={item.isActive ? "secondary" : "outline"} 
                            onClick={() => toggleActiveStatus(item.id, item.isActive)}
                          >
                            {item.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteAnnouncement(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>Modify the details and save changes.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <Input
                placeholder="Created By"
                value={editCreatedBy}
                onChange={(e) => setEditCreatedBy(e.target.value)}
              />

              <Select value={editDepartment} onValueChange={setEditDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Target Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={editPriority.toString()} onValueChange={(v) => setEditPriority(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low Priority</SelectItem>
                  <SelectItem value="2">Medium Priority</SelectItem>
                  <SelectItem value="3">High Priority</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm font-medium">Expiry Date (optional)</label>
                <Input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                />
                <label htmlFor="editActive" className="text-sm">Active</label>
              </div>

              <textarea
                className="w-full h-32 border rounded p-3 text-sm"
                placeholder="Message content..."
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
              />

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={saveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {previewItem?.title || "Preview"}
                {previewItem && (
                  <Badge className={getPriorityInfo(previewItem.priority).color}>
                    {getPriorityInfo(previewItem.priority).label}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="space-y-1">
                <div>Department: {previewItem?.department?.toUpperCase()}</div>
                <div className="flex gap-4 text-xs">
                  <span>By: {previewItem?.createdBy}</span>
                  <span>Created: {formatDate(previewItem?.createdDate)}</span>
                  {previewItem?.expiryDate && <span>Expires: {formatDate(previewItem?.expiryDate)}</span>}
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 whitespace-pre-wrap border rounded p-4 bg-gray-50">
              {previewItem?.message || "No message available."}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}