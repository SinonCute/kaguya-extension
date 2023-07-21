import React from "react";
import { useParams } from "react-router-dom";

const SourceDetails = () => {
  const { id } = useParams();

  return <div>{id}</div>;
};

export default SourceDetails;
