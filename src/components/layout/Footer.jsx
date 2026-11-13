
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()}{" "}
                        <span className="font-semibold text-[#0F172A]">Codex</span>
                        . All rights reserved.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm font-medium">
                        <Link
                            to="/privacy-policy"
                            className="text-slate-500 hover:text-[#0284C7] transition-colors"
                        >
                            Privacy Policy
                        </Link>

                        <span className="hidden sm:block h-3.5 w-px bg-slate-200" />

                        <Link
                            to="/terms-and-conditions"
                            className="text-slate-500 hover:text-[#0284C7] transition-colors"
                        >
                            Terms & Conditions
                        </Link>

                        <span className="hidden sm:block h-3.5 w-px bg-slate-200" />

                        <Link
                            to="/contact-us"
                            className="text-[#0284C7] hover:text-[#026694] transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
