import {Link} from "react-router-dom";

function FooterNavigation() {
    return(
        <footer className="p-6 text-center text-sm text-gray-500 bg-white border-t border-gray-200
        flex w-full flex-wrap flex-row items-center justify-between ">
        © {new Date().getFullYear()} DataSmart Learning
        <ul className="flex flex-wrap items-center gap-x-12">
            <li>
                <Link to="/Impressum">Impressum</Link>
            </li>
            <li>
                <Link to="/Dateschutz">Datenschutz</Link>
            </li>
            <li>
                <Link to="/AGB">AGBs und Widerrufsbelehrung</Link>
            </li>
        </ul>
        </footer>
    );
}

export default FooterNavigation