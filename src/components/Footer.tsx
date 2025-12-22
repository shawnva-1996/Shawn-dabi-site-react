export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-brand-dark text-white py-12">
            <div className="container mx-auto px-6 text-center text-gray-400">
                <p className="text-lg font-semibold text-white mb-2">&copy; {year} Shawn Dabi</p>
                <p className="text-sm mb-4">Representing Viz Alliance Pte. Ltd</p>
                <p className="text-xs max-w-2xl mx-auto border-t border-gray-700 pt-4">
                    This website is for informational purposes only. All major life decisions
                    should be made with the guidance of a qualified professional.
                </p>
                <a
                    href="https://wa.me/6594756001?text=Hi%20Shawn,%20I'd%20like%20to%20schedule%20a%20consultation."
                    target="_blank"
                    className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
                    aria-label="Chat on WhatsApp"
                >
                    <i className="fab fa-whatsapp text-3xl"></i>
                </a>
            </div>
        </footer>
    );
}


