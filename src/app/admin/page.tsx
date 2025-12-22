"use client";
import { useEffect, useState, useRef } from "react";
import { signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, 
  deleteDoc, addDoc, serverTimestamp, writeBatch, getDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import Sortable from "sortablejs";
import Image from "next/image";

interface Testimonial {
  id: string;
  clientName: string;
  profession: string;
  testimonial: string;
  imageUrl?: string;
  isApproved: boolean;
  displayOrder: number;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Dashboard State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [view, setView] = useState<"list" | "editor">("list");
  
  // Editor State
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    clientName: "", profession: "", testimonial: "", displayOrder: 999, imageUrl: ""
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sortable Ref
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  // Auth Listener
  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  // Fetch Data & Init Sortable
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "testimonials"), orderBy("displayOrder", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Testimonial));
      setTestimonials(data);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (view === "list" && tableBodyRef.current && user) {
      const sortable = new Sortable(tableBodyRef.current, {
        handle: ".drag-handle",
        animation: 150,
        ghostClass: "bg-blue-50",
        onEnd: async (evt) => {
          if (evt.newIndex === undefined || evt.oldIndex === undefined) return;
          // Optimistic UI update handled by re-fetching, but we need to update DB
          const newOrder = [...testimonials];
          const [movedItem] = newOrder.splice(evt.oldIndex, 1);
          newOrder.splice(evt.newIndex, 0, movedItem);
          
          // Batch update
          const batch = writeBatch(db);
          newOrder.forEach((item, index) => {
            batch.update(doc(db, "testimonials", item.id), { displayOrder: index });
          });
          await batch.commit();
        }
      });
      return () => sortable.destroy();
    }
  }, [view, user, testimonials]);

  // --- Actions ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Invalid login credentials");
    }
  };

  const handleOpenEditor = (story?: Testimonial) => {
    if (story) {
      setEditId(story.id);
      setEditForm({
        clientName: story.clientName,
        profession: story.profession,
        testimonial: story.testimonial,
        displayOrder: story.displayOrder,
        imageUrl: story.imageUrl || ""
      });
    } else {
      setEditId(null);
      setEditForm({ clientName: "", profession: "", testimonial: "", displayOrder: 999, imageUrl: "" });
    }
    setEditFile(null);
    setView("editor");
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      let finalImageUrl = editForm.imageUrl;

      // Handle Image Upload
      if (editFile) {
        const storageRef = ref(storage, `testimonials/${Date.now()}_${editFile.name}`);
        const snap = await uploadBytes(storageRef, editFile);
        finalImageUrl = await getDownloadURL(snap.ref);
      } else if (editForm.imageUrl === "DELETE") {
        // Logic to delete old image if needed, for now just clear string
        finalImageUrl = "";
      }

      const payload = {
        clientName: editForm.clientName,
        profession: editForm.profession,
        testimonial: editForm.testimonial,
        displayOrder: Number(editForm.displayOrder),
        imageUrl: finalImageUrl === "DELETE" ? "" : finalImageUrl
      };

      if (editId) {
        await updateDoc(doc(db, "testimonials", editId), payload);
      } else {
        await addDoc(collection(db, "testimonials"), {
          ...payload,
          isApproved: true,
          submittedAt: serverTimestamp()
        });
      }
      setView("list");
    } catch (err) {
      alert("Error saving");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "testimonials", id));
      if (imageUrl) {
         try { await deleteObject(ref(storage, imageUrl)); } catch(e) { console.log("Image likely already deleted"); }
      }
    } catch (err) {
      alert("Error deleting");
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "testimonials", id), { isApproved: !currentStatus });
  };

  // --- Views ---

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <input 
            type="email" placeholder="Email" required 
            className="form-input mb-4"
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required 
            className="form-input mb-6"
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" className="btn-primary w-full">Login</button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-700">Testimonial Dashboard</h1>
          <div className="space-x-4">
            {view === "list" && (
              <button onClick={() => handleOpenEditor()} className="bg-brand-red text-white px-4 py-2 rounded-lg font-bold text-sm">
                + New
              </button>
            )}
            <button onClick={() => signOut(auth)} className="text-gray-500 hover:text-red-600 font-bold text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {view === "list" ? (
          <>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-sm text-yellow-800">
              <p><strong>Drag & Drop</strong> rows to reorder how they appear on the homepage.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="p-4 w-12"></th>
                    <th className="p-4">Client</th>
                    <th className="p-4 hidden md:table-cell">Story</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody ref={tableBodyRef}>
                  {testimonials.map((story) => (
                    <tr key={story.id} className="border-b hover:bg-gray-50 group bg-white" data-id={story.id}>
                      <td className="p-4 cursor-grab drag-handle text-gray-400 hover:text-gray-600">
                        <i className="fas fa-grip-vertical"></i>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{story.clientName}</div>
                        <div className="text-xs text-gray-500">{story.profession}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="truncate max-w-xs text-gray-600 text-sm">{story.testimonial}</div>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleApproval(story.id, story.isApproved)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${story.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {story.isApproved ? 'Approved' : 'Pending'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleOpenEditor(story)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-pencil-alt"></i></button>
                        <button onClick={() => handleDelete(story.id, story.imageUrl)} className="text-red-600 hover:text-red-800"><i className="fas fa-trash-alt"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {testimonials.length === 0 && <div className="p-8 text-center text-gray-500">No submissions found.</div>}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{editId ? "Edit Story" : "Create New Story"}</h2>
            
            <div className="mb-6 flex items-center space-x-4">
              <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                {editFile ? (
                   <img src={URL.createObjectURL(editFile)} className="object-cover w-full h-full" />
                ) : editForm.imageUrl && editForm.imageUrl !== "DELETE" ? (
                   <Image src={editForm.imageUrl} alt="preview" fill className="object-cover" />
                ) : (
                   <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Img</div>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  onChange={e => setEditFile(e.target.files ? e.target.files[0] : null)}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                {editForm.imageUrl && (
                  <button 
                    type="button"
                    onClick={() => { setEditForm({...editForm, imageUrl: "DELETE"}); setEditFile(null); }}
                    className="block mt-2 text-xs text-red-600 hover:underline"
                  >
                    Remove Current Photo
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input 
                placeholder="Client Name" className="form-input"
                value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})}
              />
              <input 
                placeholder="Profession" className="form-input"
                value={editForm.profession} onChange={e => setEditForm({...editForm, profession: e.target.value})}
              />
            </div>
            
            <textarea 
              placeholder="Testimonial" rows={5} className="form-input mb-4"
              value={editForm.testimonial} onChange={e => setEditForm({...editForm, testimonial: e.target.value})}
            ></textarea>
            
            <div className="flex justify-end space-x-3">
              <button onClick={() => setView("list")} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={isProcessing}
                className="btn-primary py-2"
              >
                {isProcessing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}