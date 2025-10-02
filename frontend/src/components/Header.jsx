import { useEffect, useState } from "react";
import api from "../api";

function Header({ user, setOpenModal }) {
  return (
    <header className="flex flex-row w-auto border-b-2 border-black/10 h-[80px]">
      <h1 className="flex flex-row justify-center items-center ml-[150px] gap-2 font-script text-[25px]">
        BACKSTAGE
      </h1>

      <div
        id="profile"
        className="flex flex-col justify-center items-center gap-2 ml-auto mr-[200px]"
      >
        {user && (
          <>
            <button
              className="cursor-pointer flex flex-col items-center"
              onClick={() => setOpenModal(true)}
            >
              <img
                src={`http://localhost:8000${user.profile_photo}`}
                alt="Foto de perfil"
                className="w-[40px] h-[40px] rounded-full object-cover"
              />
              <span className="mt-[0.5]">{user.username}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
