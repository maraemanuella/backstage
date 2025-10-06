import {
  ChartNoAxesColumn,
  LayoutDashboard,
  LogOut,
  Settings,
  TicketCheck,
} from "lucide-react";
import MeuEvento from "./MeuEvento";
import profile from "../assets/profile.png"; // Adjust the path as necessary

function Modal({ isOpen, setOpenModal, user }) {
  if (isOpen) {
    return (
      <div
        className="modal fixed inset-0 bg-black/50"
        onClick={() => setOpenModal(false)}
      >
        <div
          className="absolute top-0 right-0 w-[300px] h-[100vh] bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <ul>
            <li className="relative">
              <div className="fixed top-[0px]">
                <MeuEvento />
              </div>
            </li>

            <li className="ml-2 text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer hover:bg-black  hover:text-white transition-colors duration-300 mt-15">
              <a href="#" className="flex gap-1 items-center">
                <LayoutDashboard className="h-5 w-5 ml-2" /> DashBoard
              </a>
            </li>

            <li className="ml-2 text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer mt-4 hover:bg-black  hover:text-white transition-colors duration-300">
              <a href="#" className="flex gap-1 items-center">
                <TicketCheck className="h-5 w-5 ml-2" /> Check-in
              </a>
            </li>

            <li className="ml-2 text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer mt-4 hover:bg-black  hover:text-white transition-colors duration-300">
              <a href="#" className="flex gap-1 items-center">
                <ChartNoAxesColumn className="h-5 w-5 ml-2" /> Painel Financeiro
              </a>
            </li>

            <li className="ml-2 text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer mt-4 hover:bg-black  hover:text-white transition-colors duration-300">
              <a href="#" className="flex gap-1 items-center">
                <Settings className="h-5 w-5 ml-2" /> Configurações
              </a>
            </li>
          </ul>

          <div className="flex flex-row items-center mt-[67vh] border-t-1 pt-5">
            <img
              src={`http://localhost:8000${user.profile_photo}`}
              alt="Foto de perfil"
              className="w-[40px] h-[40px] rounded-full object-cover ml-5"
            />

            <span className="mt-[0.5]">| {user.username}</span>

            <button className="ml-auto mr-5 cursor-pointer hover:text-red-600  transition-colors duration-300">
              <LogOut />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Modal;
