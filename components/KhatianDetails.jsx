import React from "react";

const KhatianDetails = ({ khatian }) => {
  console.log(khatian);
  return (
    <div>


      <table className="table table-border">
        <thead>
          <tr>
            <th>মালিকগণের নাম ও ঠিকানা</th>
            <th>অত্র খতিয়ানে মালিকের অংশ</th>
            <th>খতিয়ানে মালিকের মোট জমি</th>
          </tr>
        </thead>
        <tbody>
          {khatian?.owners.map(owner => (
            <>
              <tr>
                <td>{owner.name}</td>
                <td>{owner.share}</td>
                <td>{owner.share * khatian.totalLand}</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <table>
                    <thead>
                      <th>দাগ নং</th>
                      <th>দাগে মোট জমি</th>
                      <th>দাগে মালিকের জমি</th>
                    </thead>
                    <tbody>
                      {khatian.plots.map(plot => (
                        <tr>
                          <td>{plot.plot_no
                          }</td>
                          <td>{plot.totalLandInPlot * plot.share}</td>
                          <td>{plot.totalLandInPlot * plot.share * owner.share}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>

            </>
          ))}

        </tbody>
      </table>

    </div>);
};

export default KhatianDetails;
