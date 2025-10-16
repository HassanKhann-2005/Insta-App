import React from "react";
import { buildMediaUrl } from "../../constants/api";

const Stories = ({ users, onStoryClick }) => {
  return (
    <div className="flex space-x-3 sm:space-x-5 mx-2 sm:mx-10 p-2 sm:p-3 overflow-x-auto border border-black bg-black rounded-xl scrollbar-hide">
      {users && Array.isArray(users) && users.length > 0 ? (
        users.map((user, index) => (
          <div key={user.id || index} className="flex flex-col items-center space-y-1">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={buildMediaUrl(user.profilePicture)}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover cursor-pointer"
                  onClick={() => onStoryClick(user._id)}
                />
              </div>
            </div>
            <span className="text-xs text-gray-400 truncate w-16 text-center">
              {user.username}
            </span>
          </div>
        ))
      ) : (
        <div className="text-gray-400 text-sm">No users found</div>
      )}
    </div>
  );
};

export default Stories;
