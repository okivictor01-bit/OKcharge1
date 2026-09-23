export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8 text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-gray-500">
          <a href="/about" className="hover:text-blue-600">About</a>
          <a href="/faq" className="hover:text-blue-600">FAQ</a>
          <a href="/contact" className="hover:text-blue-600">Contact</a>
          <a href="/terms" className="hover:text-blue-600">Terms &amp; Conditions</a>
          <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
        </div>
        <p className="text-xs text-gray-400">© 2026 OKcharge. All rights reserved.</p>
      </div>
    </footer>
  );
}
