import { Medal } from "lucide-react";

function Score({ user }) {
  return (
    <div className="w-full px-4 mt-6 md:mt-8">
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl p-4 md:p-5 shadow-md">
        <div className="flex items-center justify-between">
          {/* Left side - Medal and tier */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-600 rounded-full p-2">
              <Medal className="text-white" size={24} />
            </div>
            <div className="text-white">
              <p className="text-xs md:text-sm opacity-90">Seu Score Atual</p>
              <p className="text-lg md:text-xl font-bold">Prata</p>
            </div>
          </div>

          {/* Right side - Score points */}
          <div className="text-white text-right">
            <p className="text-2xl md:text-3xl font-bold">
              {user ? `${user.score} pts` : "..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Score;
