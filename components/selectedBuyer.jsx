import React from "react";
import { FaAnglesLeft } from "react-icons/fa6";

const SelectedBuyer = ({ buyer, handler, idx }) => {
  const buyertotal = buyer.selectedLandInfo.reduce((khatianTotal, khatian) => {
    const plotTotal = khatian.plots.reduce(
      (sum, plot) => sum + Number(plot.selectedLand || 0),
      0
    );
    return plotTotal + khatianTotal;
  }, 0);

  return (
    <tr key={buyer._id}>
      <td>{idx + 1}.</td>
      <td>{buyer.name}</td>
      <td>{buyertotal} শতাংশ</td>
      <td>
        <button
          onClick={() => handler({ buyer })}
          className="btn btn-sm  w-40 btn-soft  btn-error"
        >
          <FaAnglesLeft />
        </button>
      </td>
    </tr>
  );
};

export default SelectedBuyer;
