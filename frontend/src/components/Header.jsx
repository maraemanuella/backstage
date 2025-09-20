import { useState } from "react";
import Logo from "../assets/Logo.png";

function Header(params) {

  return (
    <header className="flex flex-row w-auto border-b-2 border-black/10 h-[80px]">
      <h1 className="flex flex-row justify-center items-center ml-[150px] gap-2 font-script text-[25px]">
        <img src={Logo} alt="logo_backstage" className="w-[40px] h-[40px]" />
        BACKSTAGE
      </h1>

      <div
        id="profile"
        className="flex flex-col justify-center items-center gap-2 ml-auto mr-[200px]"
      >
        <button className="cursor-pointer">
          <img src="#" alt="profile_img" />
        </button>
        <span>Nick_name</span>
      </div>
    </header>
  );
}

export default Header;
