import React from "react";
import { Link } from "react-router-dom";

interface SourceCardProps {
  name: string;
  quality?: string[];
  languages: string[];
  id: string;
  logo: string;
}

const SourceCard: React.FC<SourceCardProps> = ({
  name,
  quality,
  languages,
  id,
  logo,
}) => {
  return (
    <Link to={`/source-details/${id}`}>
      <div className="p-4 col-span-1 bg-background-800 space-y-2 rounded-md hover:bg-white/20 transition duration-300">
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-full">
            <img
              src={logo}
              alt={name}
              className="absolute z-10 w-full h-full object-cover"
            />

            <div className="absolute w-full h-full z-0 animate-pulse bg-white/20 rounded-full"></div>
          </div>

          <h1 className="text-xl font-semibold">{name}</h1>
        </div>

        <div className="space-y-2">
          {quality?.length && (
            <div className="flex items-center gap-1 flex-wrap">
              <p className="text-sm font-semibold">Quality:</p>

              {quality.map((quality) => (
                <p
                  key={quality}
                  className="bg-gray-600 font-semibold rounded-md p-1"
                >
                  {quality}
                </p>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 flex-wrap">
            <p className="text-sm font-semibold">Language:</p>

            {languages.map((language) => (
              <p
                key={language}
                className="bg-gray-600 font-semibold rounded-md p-1"
              >
                {language}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SourceCard;
