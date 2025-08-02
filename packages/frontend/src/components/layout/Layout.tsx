import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";

const Layout = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Grid lines */}
        <div
          className={`absolute inset-0 transition-opacity duration-1500 ${
            loaded ? "opacity-30" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzMzMzM2NiIgc3Ryb2tlLXdpZHRoPSIwLjIiPjxyZWN0IHg9Ii0wLjUiIHk9Ii0wLjUiIHdpZHRoPSI2MSIgaGVpZ2h0PSI2MSIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        </div>

        {/* Glowing orbs */}
        <div
          className={`transition-opacity duration-2000 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-blue-600/20 rounded-full blur-[60px]"></div>
          <div className="absolute top-[30%] right-[25%] w-64 h-64 bg-pink-600/20 rounded-full blur-[70px]"></div>
        </div>
      </div>

      {/* Gaming-inspired footer */}
      <footer className="mt-16 py-6 px-4 border-t border-gray-800 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <div className="mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold">
              CodeQuest
            </span>
            <span className="mx-2">•</span>
            <span>Level Up Your Coding Skills</span>
          </div>
          <div className="text-xs">
            &copy; {new Date().getFullYear()} | All Rights Reserved
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
