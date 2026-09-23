export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 py-3">
      <div className="max-w-2xl mx-auto px-6 flex justify-center">
        <a href="/">
          <img src="/logo.png" alt="OKcharge" className="h-10 w-auto" />
        </a>
      </div>
    </header>
  );
}
