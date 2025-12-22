"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl font-bold text-brand-dark tracking-tight">
            Shawn Dabi
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#about" className="text-gray-600 hover:text-brand-red font-medium transition-colors">
              About
            </Link>
            <Link href="/#testimonials" className="text-gray-600 hover:text-brand-red font-medium transition-colors">
              Client Stories
            </Link>
            {/* <Link href="/#content" className="text-gray-600 hover:text-brand-red font-medium transition-colors">
              Insights
            </Link> */}
            <Link href="/#contact" className="text-gray-600 hover:text-brand-red font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-white border-b border-gray-100 shadow-lg absolute w-full left-0 top-full">
          <Link href="/#about" onClick={() => setIsOpen(false)} className="block py-3 text-gray-700 font-medium border-b border-gray-50">About</Link>
          <Link href="/#testimonials" onClick={() => setIsOpen(false)} className="block py-3 text-gray-700 font-medium border-b border-gray-50">Client Stories</Link>
          {/* <Link href="/#content" onClick={() => setIsOpen(false)} className="block py-3 text-gray-700 font-medium border-b border-gray-50">Insights</Link> */}
          <Link href="/#contact" onClick={() => setIsOpen(false)} className="block py-3 text-gray-700 font-medium">Contact</Link>
        </div>
      )}
    </nav>
  );
}