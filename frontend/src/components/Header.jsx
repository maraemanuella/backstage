import { useState } from "react";
import Logo from "../assets/Logo.png";
import profile from "../assets/profile.png";

function Header(params) {
  return (
    <header className="flex flex-row w-auto border-b-2 border-black/10 h-[80px]">
      <h1 className="flex flex-row justify-center items-center ml-[150px] gap-2 font-script text-[25px] cursor-pointer">
        <img src={Logo} alt="logo_backstage" className="w-[40px] h-[40px]" />
        BACKSTAGE
      </h1>

      <div
        id="profile"
        className="flex flex-col justify-center items-center ml-auto mr-[200px]"
      >
        <button className="cursor-pointer">
          <img
            src={profile}
            alt="profile_img"
            className="w-10 rounded-3xl hover:scale-110 hover:duration-200"
          />
        </button>
        <span className="font-[600]">Nick Name</span>
      </div>
    </header>
  );
}

export default Header;
