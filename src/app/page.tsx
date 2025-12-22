"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Testimonial {
  id: string;
  clientName: string;
  profession: string;
  testimonial: string;
  imageUrl?: string;
  displayOrder: number;
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Testimonials
  useEffect(() => {
    const q = query(
      collection(db, "testimonials"),
      where("isApproved", "==", true),
      orderBy("displayOrder", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Testimonial[] = [];
      const images: string[] = [];

      snapshot.forEach((doc) => {
        const t = doc.data() as Testimonial;
        data.push({ ...t, id: doc.id });
        if (t.imageUrl) images.push(t.imageUrl);
      });

      setTestimonials(data);
      if (images.length > 0) setSlideshowImages(images);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Slideshow Logic
  useEffect(() => {
    if (slideshowImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideshowImages]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="bg-white">
          <div className="container mx-auto px-6 py-20 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <span className="font-bold text-brand-red uppercase tracking-wider text-sm">
                  Your Growth Partner in Singapore
                </span>
                <h1 className="font-display text-5xl md:text-7xl font-bold text-brand-dark mt-4 mb-6 leading-tight">
                  Make Your Time <br /> Here Count.
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                  I help Singaporean professionals and OFWs build a
                  secure and prosperous future—living comfortably back home,
                  funding a business, or growing wealth.
                </p>
                <Link
                  href="#contact"
                  className="inline-block bg-brand-red text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all duration-300"
                >
                  Let's Start Planning
                </Link>
              </div>

              {/* SLIDESHOW */}
              <div className="relative aspect-square w-full max-w-md mx-auto shadow-2xl rounded-2xl bg-gray-100 overflow-hidden border-4 border-white">
                {slideshowImages.length > 0 ? (
                  slideshowImages.map((src, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                    >
                      <Image
                        src={src}
                        alt="Client Story"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                    <i className="fas fa-user-friends text-4xl"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-20 bg-brand-gray">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-dark mb-6">
              My Journey, Your Security
            </h2>
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-700 mb-4 leading-relaxed text-lg">
                After my time as an auditor in the Big 4 and earning a degree in
                software engineering, I found my true calling in serving others by
                helping them map out their goals. Now in my second year, I'm
                privileged to serve a growing family of over 100 clients.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                My mission is simple: to bring a spirit of excellence and constant
                learning to my work, so I can add real, tangible value to your
                life.
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="testimonials" className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                Success Stories
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                The real measure of my success is the peace of mind and inner
                confidence my clients enjoy.
              </p>
              <Link href="/submit" className="mt-4 inline-block text-brand-red font-semibold hover:underline">
                Share your own story &rarr;
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-spinner fa-spin text-3xl text-brand-red"></i>
                </div>
              ) : testimonials.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">No stories yet. Be the first!</p>
              ) : (
                testimonials.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border-t-4 border-brand-red"
                  >
                    <div className="h-56 relative bg-gray-200">
                      <Image
                        src={story.imageUrl || "https://placehold.co/400x300/212121/FFFFFF?text=Client"}
                        alt={story.clientName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-grow relative">
                      <div className="absolute top-4 right-6 text-9xl text-gray-100 font-serif opacity-50 select-none pointer-events-none">
                        "
                      </div>
                      <div className="mb-6 text-gray-600 italic leading-relaxed flex-grow">"{story.testimonial}"</div>
                      <div className="mt-auto border-t border-gray-100 pt-4">
                        <h4 className="font-display font-bold text-brand-dark text-lg">{story.clientName}</h4>
                        <p className="text-sm text-brand-red font-semibold uppercase tracking-wide">{story.profession}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* INSIGHTS SECTION
        <section id="content" className="py-20 bg-brand-gray">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                Essential Insights
              </h2>
              <p className="text-gray-600">
                Actionable advice to help you thrive in Singapore.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 md:p-14 border-l-8 border-brand-red">
              <h3 className="font-display text-2xl font-bold text-brand-dark mb-6">
                New in Singapore? 5 Key Strategies
              </h3>
              <ul className="space-y-6 text-gray-600 mb-8 text-lg">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1">
                    <i className="fas fa-check text-brand-red"></i>
                  </div>
                  <span><strong>Mastering Remittance:</strong> Compare rates to ensure more money reaches home.</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1">
                     <i className="fas fa-check text-brand-red"></i>
                  </div>
                  <span><strong>Smart Grocery Shopping:</strong> Shop at local heartland supermarkets to save significantly.</span>
                </li>
                <li className="flex items-start">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4 mt-1">
                     <i className="fas fa-check text-brand-red"></i>
                   </div>
                  <span><strong>Work Permit Rights:</strong> Understand your employment pass to avoid illegal deductions.</span>
                </li>
              </ul>
              <p className="text-gray-500 italic border-t pt-6 mt-6">
                More in-depth guides on property acquisition and future-proofing are coming soon.
              </p>
            </div>
          </div>
        </section> */}

        {/* CONTACT SECTION */}
        <section id="contact" className="bg-brand-dark text-white py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Ready to Build Your Future?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
              I'm here to listen and help you create a clear, actionable plan.
            </p>
            <a
              href="https://wa.me/6594756001?text=Hi%20Shawn,%20I'd%20like%20to%20schedule%20a%20consultation."
              target="_blank"
              className="inline-flex items-center bg-brand-red text-white font-bold py-4 px-12 rounded-full transition-all duration-300 hover:bg-red-600 hover:shadow-2xl hover:-translate-y-1 text-xl"
            >
              <i className="fab fa-whatsapp mr-3 text-2xl"></i> Let's Chat
            </a>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}