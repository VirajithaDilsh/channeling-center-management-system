const Footer = () => {
    return (
        <footer className="bg-white text-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
                <p className="text-sm sm:text-base">
                    © {new Date().getFullYear()} My Dashboard. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;