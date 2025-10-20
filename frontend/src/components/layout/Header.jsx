const Header = () => {
  return (
    <header className="flex items-center justify-between p-6 bg-gray-800 border-b border-gray-700 shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard de Energia</h1>
      </div>
      <div>
        <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;