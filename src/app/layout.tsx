import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd"; // Import the component

// Load fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ["600", "700"], 
  subsets: ["latin"], 
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Shawn Dabi | Financial Consultant for OFWs & Singaporeans",
  description: "Trusted financial advisor in Singapore for Filipinos and locals. Expert in wealth building, insurance claims, and future planning.",
  keywords: ["Financial Advisor Singapore", "Filipino Financial Advisor", "OFW Singapore Insurance", "Prudential Consultant Singapore", "Shawn Dabi"],
  openGraph: {
    title: "Shawn Dabi | Secure Your Future in SG",
    description: "Helping over 150+ clients build wealth and stability. Let's plan your future today.",
    url: "https://shawndabi.com", // Replace with your actual domain
    siteName: "Shawn Dabi Finance",
    images: [
      {
        url: "https://shawndabi.com/og-image.png", // Replace with an actual image URL
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_SG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {/* Inject Structured Data for SEO */}
        <JsonLd />
        
        {children}
        
        {/* Sticky WhatsApp Button (Global) */}
        <a
          href="https://wa.me/6594756001?text=Hi%20Shawn,%20I'd%20like%20to%20schedule%20a%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
          aria-label="Chat on WhatsApp"
        >
          <i className="fab fa-whatsapp text-3xl"></i>
        </a>
      </body>
    </html>
  );
}