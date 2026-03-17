import { useEffect, useState } from "react";
import "./About.css";
import data from "../data/resume.json";
import { useXP } from "../hooks/useXP";

function About() {
  // Keep input data defensive so malformed JSON does not crash this panel.
  const hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
  const defaultHobby =
    hobbies.find((hobby) => hobby.name === "Board Games") || hobbies[0];
  const [selectedHobby, setSelectedHobby] = useState(defaultHobby);
  const { grantXp, hasClicked } = useXP();
  const photoGrid = Array.isArray(selectedHobby?.photos)
    ? selectedHobby.photos.filter((photo) => photo?.src)
    : [];
  const hasPhotoGrid = photoGrid.length > 0;
  const isCooking = selectedHobby?.name === "Cooking";

  useEffect(() => {
    // First visible hobby grants XP once to reward discovering this page.
    if (!defaultHobby?.name) return;
    grantXp(`hobby-open-${defaultHobby.name}`, 27);
  }, [defaultHobby?.name, grantXp]);

  return (
    <div className="about">
      <div className="about-cards">
        <div className="about-card">
          <h1 className="about-title">Hobbies</h1>
          <div className="about-hobbies">
            {hobbies.map((hobby) => (
              <button
                key={hobby.name}
                type="button"
                className={
                  hasClicked(`hobby-open-${hobby.name}`)
                    ? "about-hobby about-hobby--active"
                    : "about-hobby"
                }
                onClick={() => {
                  setSelectedHobby(hobby);
                  grantXp(`hobby-open-${hobby.name}`, 27);
                }}
              >
                {hobby.name}
              </button>
            ))}
          </div>
        </div>
        <div className="about-card about-card--photo">
          <div
            className={
              isCooking
                ? "about-photo-frame about-photo-frame--cooking"
                : "about-photo-frame"
            }
          >
            {hasPhotoGrid ? (
              <div
                className={
                  isCooking
                    ? "about-photo-grid about-photo-grid--cooking"
                    : "about-photo-grid"
                }
              >
                {photoGrid.slice(0, 4).map((photo, index) => (
                  <img
                    key={`${selectedHobby?.name || "hobby"}-${photo.src}-${index}`}
                    className="about-photo-tile"
                    src={photo.src}
                    alt={
                      photo.alt ||
                      `${selectedHobby?.name || "Hobby"} hobby photo ${index + 1}`
                    }
                  />
                ))}
              </div>
            ) : selectedHobby?.photo ? (
              <img
                className="about-photo"
                src={selectedHobby.photo}
                alt={
                  selectedHobby.alt ||
                  `${selectedHobby.name} hobby photo`
                }
              />
            ) : (
              <p className="about-photo-empty">
                Add a photo for {selectedHobby?.name || "this hobby"}.
              </p>
            )}
          </div>
        </div>
        <div className="about-card about-card--context">
          <div className="about-context-block">
            <p className="about-context-name">
              {selectedHobby?.name || "Hobby"}
            </p>
            <p className="about-context">
              {selectedHobby?.context || "Add a short note about this hobby."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;