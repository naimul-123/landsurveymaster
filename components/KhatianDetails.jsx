import React from "react";

const KhatianDetails = ({ khatian }) => {
  console.log(khatian);
  return <div>{khatian?.khatian_No}</div>;
};

export default KhatianDetails;
