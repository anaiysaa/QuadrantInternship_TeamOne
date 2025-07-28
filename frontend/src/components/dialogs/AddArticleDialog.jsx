import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function AddArticleDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    tags: "",
    summary: "",
    file: null,
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }

    try {
      const res = await fetch("http://localhost:8000/api/resources/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({ title: "Upload successful!" });
        setOpen(false);
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error uploading:", error);
      toast({ title: "Upload error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Knowledge Base Article</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Title" onChange={handleChange} required />
            <select
  name="category"
  value={form.category}
  onChange={handleChange}
  className="w-full border rounded-md px-3 py-2"
  required
>
  <option value="">Select Category</option>
  <option value="Hardware">Hardware</option>
  <option value="Software">Software</option>
  <option value="Security">Security</option>
  <option value="Network">Network</option>
</select>
            <Input name="tags" placeholder="Tags (comma separated)" onChange={handleChange} />
            <Textarea name="summary" placeholder="Summary" onChange={handleChange} />
            <Input type="file" name="file" accept=".pdf,.doc,.docx" onChange={handleChange} required />
            <div className="text-right">
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
