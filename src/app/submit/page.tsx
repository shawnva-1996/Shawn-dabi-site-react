"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    clientName: "",
    profession: "",
    testimonial: "",
    consent: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; msg: string }>({ type: "", msg: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      setStatus({ type: "error", msg: "Please provide consent to proceed." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", msg: "Processing..." });

    try {
      let imageUrl = "";

      if (file) {
        setStatus({ type: "", msg: "Uploading photo..." });
        const storageRef = ref(storage, `testimonials/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      setStatus({ type: "", msg: "Saving story..." });
      await addDoc(collection(db, "testimonials"), {
        clientName: formData.clientName,
        profession: formData.profession,
        testimonial: formData.testimonial,
        imageUrl,
        submittedAt: serverTimestamp(),
        isApproved: false,
        displayOrder: 999,
      });

      setStatus({ type: "success", msg: "Thank you! Your story has been submitted for review." });
      setFormData({ clientName: "", profession: "", testimonial: "", consent: false });
      setFile(null);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", msg: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border-t-4 border-brand-red">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-dark">Share Your Experience</h1>
            <p className="text-gray-600 mt-2">Your story can inspire others.</p>
          </div>

          {status.type === "success" ? (
            <div className="text-center py-10">
              <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-800">Submission Received</h3>
              <p className="text-gray-600 mt-2 mb-6">{status.msg}</p>
              <Link href="/" className="btn-primary">Back to Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Story</label>
                <textarea
                  required
                  rows={5}
                  className="form-input"
                  placeholder="How has financial planning helped you?"
                  value={formData.testimonial}
                  onChange={(e) => setFormData({...formData, testimonial: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-brand-red hover:file:bg-red-100"
                />
              </div>

              <div className="flex items-start">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-brand-red focus:ring-brand-red border-gray-300 rounded"
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                />
                <label htmlFor="consent" className="ml-3 text-sm text-gray-600">
                  I consent for my story and photo to be featured on shawndabi.com.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Submitting..." : "Submit My Story"}
              </button>

              {status.type === "error" && (
                <p className="text-center text-red-600 font-medium">{status.msg}</p>
              )}
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}