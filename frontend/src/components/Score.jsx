import { CircleStar } from "lucide-react";

function Score({ user }) {
  return (
    <div className="w-[50%] bg-linear-to-r from-orange-600 to-orange-400 ml-auto mr-auto rounded-2xl mt-[15px] flex justify-center items-center border-amber-700 p-2">
      <div className="flex flex-row gap-2 justify-center items-center">
        <CircleStar className="text-orange-200 bg-orange-600 rounded-2xl size-8" />
        <span className="ml-auto mr-[20px] text-white font-[600]">
          BRONZE
        </span>
      </div>

      <div className="ml-auto mr-[20px] text-white font-[600] flex flex-col justify-center items-center">
        <span>Score Atual</span>
        {user ? <span>{user.score}</span> : <span>Carregando...</span>}
      </div>
    </div>
  );
}

export default Score;
