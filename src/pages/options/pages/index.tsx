import SourceCard from "../components/SourceCard";
import { anime, manga } from "@src/sources";

const Options = () => {
  return (
    <div className="min-h-[inherit] flex items-center justify-center">
      <div className="w-2/3">
        <h1 className="text-3xl font-semibold mb-8">Your sources</h1>

        <h2 className="text-xl mb-2 font-semibold">Anime</h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {Object.entries(anime).map(([key, value]) => (
            <SourceCard
              key={key}
              name={key}
              languages={value.languages}
              quality={value.quality}
              id={key}
              logo={value.logo}
            />
          ))}
        </div>

        <h2 className="text-xl mb-2 font-semibold">Manga</h2>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(manga).map(([key, value]) => (
            <SourceCard
              key={key}
              name={key}
              languages={value.languages}
              id={key}
              logo={value.logo}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Options;
