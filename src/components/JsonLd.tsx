export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Shawn Dabi Financial Consultant",
    // "image": "https://shawndabi.com/your-profile-photo.jpg",
    "telephone": "+65 8073 2938",
    "url": "https://shawndabi.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Singapore",
      "addressCountry": "SG"
    },
    "priceRange": "$$",
    "description": "Financial planning services for Singaporeans and Filipino OFWs, specializing in wealth accumulation and insurance.",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}