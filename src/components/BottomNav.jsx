import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch, faPlusSquare, faHeart, faUser, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-gray-800">
      <div className="flex justify-around items-center h-14 text-white">
        <button className="p-3" onClick={() => navigate("/")}> 
          <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
        </button>
        <button className="p-3" onClick={() => navigate("/search")}> 
          <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
        </button>
        <button className="p-3" onClick={() => navigate("/messages")}> 
          <FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />
        </button>
        <button className="p-3" onClick={() => navigate("/createposts")}> 
          <FontAwesomeIcon icon={faPlusSquare} className="w-5 h-5" />
        </button>
        <button className="p-3" onClick={() => navigate("/notifications")}> 
          <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
        </button>
        <button className="p-3" onClick={() => navigate("/profile")}> 
          <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BottomNav;


