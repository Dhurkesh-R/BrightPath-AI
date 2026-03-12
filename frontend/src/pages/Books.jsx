import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Book, Trash2, Loader2, FileText } from "lucide-react";
import { uploadBook, getBooks, deleteBook as deleteBookApi } from "../services/api";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";

export default function Books() {
  const getUserData = () => {
    try { return JSON.parse(localStorage.getItem("user")); } 
    catch (e) { return null; }
  };

  const user = getUserData();
  const userRole = user?.role || "student";
  const { theme } = useTheme();
  
  const [books, setBooks] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: "", subject: "", grade: "", section: "" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  const { bg, text, textSecondary, primary, inputBg, border } = getThemeClasses(theme);

  useEffect(() => {
    fetchBooks();
  }, []);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await getBooks();
      setBooks(res || []);
    } catch (err) {
      showNotification("Failed to load books.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !form.title || !form.subject || !form.grade || !form.section) {
      showNotification("Please fill all fields and select a PDF.", 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", form.title);
      formData.append("subject", form.subject);
      formData.append("grade", form.grade);
      formData.append("section", form.section);
      
      await uploadBook(formData);
      showNotification(`"${form.title}" uploaded!`, 'success');
      setFile(null);
      setForm({ title: "", subject: "", grade: "", section: "" });
      if (document.getElementById('file-upload-input')) {
        document.getElementById('file-upload-input').value = ''; 
      }
      fetchBooks();
    } catch (error) {
      showNotification("Upload failed.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return; 
    try {
      setLoading(true);
      await deleteBookApi(id);
      showNotification("Book deleted.", 'success');
      fetchBooks();
    } catch (error) {
      showNotification("Delete failed.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const notificationClasses = notification.type === 'success' 
    ? "bg-green-600 border-green-500" 
    : "bg-red-600 border-red-500";

  if (loading && books.length === 0) {
    return(
      <div className={`flex flex-col items-center justify-center h-screen ${bg} ${text} w-full`}>
          <Loader2 className="animate-spin mb-4 w-8 h-8 text-blue-500" /> 
          <span className="text-lg font-medium">Fetching library...</span>
      </div>
    );
  }

  return (
    // FIX 1: Responsive Margin-left
    <div className={`p-4 md:p-8 min-h-screen ${bg} ${text} w-full ml-0 md:ml-14 transition-all duration-300`}>
      
      {/* Notification Bar - Centered on mobile */}
      {notification.message && (
          <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-8 z-50 p-4 rounded-xl shadow-2xl ${notificationClasses} text-white border-2 text-center md:text-left animate-in fade-in slide-in-from-top-4`}>
              {notification.message}
          </div>
      )}

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          📚 <span className="hidden xs:inline">Books Management</span>
          <span className="xs:hidden">Books</span>
        </h1>
      </header>

      {userRole === "teacher" && (
        <Card className={`p-4 md:p-6 mb-10 shadow-xl border ${border} bg-card`} theme={theme}>
          <CardContent className="p-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Upload New Resource</h2>
            {/* FIX 2: Responsive Form Grid (1 col on mobile, 5 on XL) */}
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 xl:grid-cols-5">
              <input
                type="text"
                placeholder="Title"
                className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Subject"
                className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} outline-none focus:ring-2 focus:ring-blue-500`}
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                >
                  <option value="" disabled>Grade</option>
                  {[6, 7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                  className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} outline-none focus:ring-2 focus:ring-blue-500`}
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                >
                  <option value="" disabled>Section</option>
                  {["A", "B", "C", "D", "E"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-2 xl:col-span-1">
                  <label className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed ${border} rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors`}>
                    <FileText size={18} className="text-blue-500" />
                    <span className="text-sm truncate">{file ? file.name : "Select PDF"}</span>
                    <input 
                        type="file" 
                        id="file-upload-input"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])} 
                    />
                  </label>
              </div>

              <Button 
                  onClick={handleUpload} 
                  disabled={loading}
                  className="w-full h-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} 
                Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <h2 className="text-xl md:text-2xl font-bold mb-6">Library Catalog</h2>
      
      {/* FIX 3: Book Cards Grid (1 col on mobile, 4 on XL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {books.length > 0 ? (
          books.map((book) => (
            <Card key={book.id} className={`p-5 shadow-lg border ${border} bg-card hover:shadow-2xl transition-shadow group`} theme={theme}>
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Book className="text-blue-500" size={24} />
                  </div>
                  {userRole === "teacher" && (
                    <button
                      className="text-gray-500 hover:text-red-500 p-1 transition-colors"
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{book.title}</h3>
                <p className={`text-xs font-semibold uppercase tracking-tighter ${textSecondary} mb-3`}>
                  {book.subject} • Grade {book.grade}{book.section}
                </p>
                
                <a
                  href={"https://brightpath-ai.onrender.com/" + book.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 text-sm font-bold text-blue-500 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                >
                  View PDF
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center opacity-50">
            <Book size={48} className="mx-auto mb-4" />
            <p className="italic">The library is currently empty.</p>
          </div>
        )}
      </div>
      
      {/* Loading overlay for list refresh */}
      {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-40">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-xl">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
              </div>
          </div>
      )}
    </div>
  );
}
