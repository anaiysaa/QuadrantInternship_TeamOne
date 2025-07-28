import { useState } from 'react';

export default function UploadForm() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    tags: '',
    summary: '',
    file: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
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
      const res = await fetch('http://localhost:8000/api/resources/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) alert('Upload successful!');
      else alert('Upload failed.');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <input
        type="text"
        name="title"
        placeholder="Title"
        className="input input-bordered w-full"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="category"
        placeholder="Category"
        className="input input-bordered w-full"
        onChange={handleChange}
      />
      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated)"
        className="input input-bordered w-full"
        onChange={handleChange}
      />
      <textarea
        name="summary"
        placeholder="Summary"
        className="textarea textarea-bordered w-full"
        onChange={handleChange}
      ></textarea>
      <input
        type="file"
        name="file"
        accept=".pdf,.doc,.docx"
        className="file-input file-input-bordered w-full"
        onChange={handleChange}
        required
      />
      <button type="submit" className="btn btn-primary w-full">
        Upload Resource
      </button>
    </form>
  );
}