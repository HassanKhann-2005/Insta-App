import React from "react";
import { buildMediaUrl } from "../../constants/api";
import { useNavigate } from "react-router-dom";

const ViewStory = ({
  selectedStory,
  selectedStoryIndex,
  handleCloseStory,
  handlePrevStory,
  handleNextStory,
  showInfo,
  setShowInfo,
  currentUser,
}) => {
  if (!selectedStory) return null;

  const story = selectedStory.stories[selectedStoryIndex];
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="relative w-[400px] h-[700px] bg-black rounded-lg overflow-hidden">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-white text-2xl z-10"
          onClick={handleCloseStory}
        >
          &times;
        </button>

        {/* Story Content */}
        {story.media.endsWith(".mp4") ? (
          <video
            key={story._id}
            src={buildMediaUrl(story.media)}
            controls
            autoPlay
            className="w-full h-[600px] object-contain"
          />
        ) : (
          <img
            src={buildMediaUrl(story.media)}
            alt="story"
            className="w-full h-[600px] object-contain"
          />
        )}

        {/* User Info */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 text-white">
          <img
            src={buildMediaUrl(selectedStory.user.profilePicture)}
            alt="profile"
            className="w-8 h-8 rounded-full border"
          />
          <span className="font-semibold">{selectedStory.user.username}</span>
        </div>

        {/* Navigation Arrows */}
        {selectedStoryIndex > 0 && (
          <button
            onClick={handlePrevStory}
            className="absolute left-5 top-1/2 -translate-y-1/2 
               bg-black/50 text-white rounded-full p-3 
               hover:bg-black/70 transition"
          >
            ‹
          </button>
        )}

        {selectedStoryIndex < selectedStory.stories.length - 1 && (
          <button
            onClick={handleNextStory}
            className="absolute right-5 top-1/2 -translate-y-1/2 
               bg-black/50 text-white rounded-full p-3 
               hover:bg-black/70 transition"
          >
            ›
          </button>
        )}


        {/* Eye Icon for currentUser */}
        {selectedStory.user._id === currentUser.id && (
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className="absolute bottom-3 right-3 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700"
          >
            <i className="fas fa-eye"></i>
          </button>
        )}

        {/* Story Info */}
        {showInfo && selectedStory.user._id === currentUser.id && (
          <div className="absolute bottom-14 left-0 w-full bg-gray-900 bg-opacity-95 text-white p-3 text-sm rounded-t-lg max-h-56 overflow-y-auto">
            <p>Total Views: {story.viewers?.length || 0}</p>

            {story.viewers?.length > 0 ? (
              <div className="mt-2 space-y-2">
                {story.viewers.map((viewer) => (
                  <div key={viewer._id} className="flex items-center space-x-2"
                    onClick={() => navigate(`/userprofile/${viewer._id}`)}
                  >

                    <img
                      src={buildMediaUrl(viewer.profilePicture)}
                      alt={viewer.username}

                      className="w-6 h-6 rounded-full border"
                    />
                    {console.log(viewer)}
                    <span className="cursor-default">{viewer.username}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-gray-400">No viewers yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStory;
