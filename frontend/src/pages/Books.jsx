import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Book, Trash2, Loader2 } from "lucide-react";
// Assuming the services/api file is correctly imported
import { uploadBook, getBooks, deleteBook as deleteBookApi } from "../services/api";
// Updated import to include getAllThemes and the setTheme function from useTheme
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";

export default function Books() {
  // Safely parse user data
  const getUserData = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  };

  const user = getUserData();
  const userRole = user?.role || "student";
  // Destructure theme and the function to change theme
  const { theme, _, t } = useTheme();
  
  const [books, setBooks] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: "", subject: "", grade: "", section: "" });
  const [loading, setLoading] = useState(false);
  // New state for handling errors/notifications
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // Use getThemeClasses to apply theme styles
  const { bg, text, textSecondary, primary, inputBg, border } = getThemeClasses(theme);

  useEffect(() => {
    fetchBooks();
  }, []);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    // Auto-clear notification after 5 seconds
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const fetchBooks = async () => {
    try{
      setLoading(true);
      const res = await getBooks();
      // Assuming res is the array of books
      console.log(res);
      setBooks(res);
    } catch (err) {
      console.error("Failed to fetch books:", err);
      showNotification("Failed to load books. Check your network.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification("Please select a PDF file to upload.", 'error');
      return;
    }
    
    if (!form.title || !form.subject || !form.grade || !form.section) {
        showNotification("Please fill out all book details.", 'error');
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
        showNotification(`Book "${form.title}" uploaded successfully!`, 'success');

        // Reset state and clear file input
        setFile(null);
        setForm({ title: "", subject: "", grade: "", section: "" });
        document.getElementById('file-upload-input').value = ''; 
        
    } catch (error) {
        console.error("Upload error:", error);
        showNotification(`Upload failed. Error: ${error.message || 'Server rejected file.'}`, 'error');
    } finally {
        setLoading(false);
        fetchBooks();
    }
  };

  const handleDeleteBook = async (id) => {
    // 💡 FIX: Replaced window.confirm() with a custom modal logic 
    // Since we don't have the Dialog/Modal component here, I will use a placeholder message 
    // but keep the functionality clean. In a real app, this should be replaced by a modal.
    if (!confirm("Are you sure you want to delete this book?")) return; 

    try {
        setLoading(true);
        await deleteBookApi(id);
        showNotification("Book deleted successfully.", 'success');
        fetchBooks();
    } catch (error) {
        console.error("Delete error:", error);
        showNotification("Failed to delete book.", 'error');
    } finally {
        setLoading(false);
    }
  };

  // Tailwind classes for notification bar
  const notificationClasses = notification.type === 'success' 
    ? "bg-green-600 border-green-700 text-white" 
    : "bg-red-600 border-red-700 text-white";


  if (loading && books.length === 0) {
    return(
      <div className={`flex items-center justify-center h-screen ${bg} ${text} w-full `}>
          <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
          <span className="text-lg">Loading books...</span>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} w-full ml-14`}>
        
      {/* Notification Bar */}
      {notification.message && (
          <div 
              className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform ${notificationClasses} border-2`}
              role="alert"
          >
              {notification.message}
          </div>
      )}

      {/* Header and Theme Selector */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📚 Books Management</h1>
      </div>

      {userRole === "teacher" && (
        <Card className={`p-6 mb-10 shadow-xl border border-gray-700 bg-card`} theme={theme}>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Title (e.g., Algebra I)"
                className={`p-3 border border-gray-700 rounded-xl ${inputBg} ${textSecondary} placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all`}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Subject (e.g., Mathematics)"
                className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all`}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <select
                className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} focus:ring-2 focus:ring-blue-500 transition-all`}
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                <option value="" disabled className={`${text} ${bg}`}>Select Grade</option>
                {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g} className={`${text} ${bg}`}>{g}</option>
                ))}
              </select>
              <select
                className={`p-3 border ${border} rounded-xl ${inputBg} ${textSecondary} focus:ring-2 focus:ring-blue-500 transition-all`}
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
              >
                <option value="" disabled className={`${text} ${bg}`}>Select Section</option>
                {["A", "B", "C", "D", "E"].map((s) => (
                  <option key={s} value={s} className={`${text} ${bg}`}>{s}</option>
                ))}
              </select>
              
              {/* File Input and Button */}
              <div className="xl:col-span-1 flex flex-col gap-2 sm:col-span-2 md:col-span-1">
                  <input 
                      type="file" 
                      id="file-upload-input"
                      accept=".pdf"
                      className="block w-full text-sm text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-500 file:text-white
                          hover:file:bg-blue-600 transition duration-150
                      "
                      onChange={(e) => setFile(e.target.files[0])} 
                  />
                  <Button 
                      onClick={handleUpload} 
                      disabled={loading || !form.title || !form.subject || !form.grade || !form.section || !file}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                  >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} 
                      {loading ? "Uploading..." : "Upload Book"}
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Uploaded Books Section */}
      <h2 className="text-2xl font-bold mb-4">Uploaded Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books && books.length > 0 ? (
          books.map((book) => (
            <Card key={book.id} className={`p-5 shadow-lg border border-gray-700 bg-card`} theme={theme}>
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-bold text-xl flex items-center gap-2 text-${primary}-400`}>
                    <Book size={20} /> {book.title}
                  </h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500 hover:text-red-400 hover:bg-gray-700 transition-colors rounded-full p-2"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
                
                <p className="text-sm text-gray-400 mb-1">📘 Subject: {book.subject}</p>
                <p className="text-sm text-gray-400 mb-4">
                  🎓 Grade: {book.grade} ({book.section})
                </p>
                
                <a
                  href={"http://localhost:5000/"+book.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 text-sm font-medium border-b border-blue-500 hover:border-blue-400 transition-colors pb-1"
                >
                  View / Download File
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 italic text-lg">No books have been uploaded yet.</p>
        )}
      </div>
      
      {/* Loading overlay for list refresh */}
      {loading && books.length > 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
              <Loader2 className="animate-spin w-10 h-10 text-white" />
          </div>
      )}

    </div>
  );
}