export const getShortPositionForm = (pos: string): string => {
  if (!pos) return "";
  const upper = pos.toUpperCase();
  if (upper.includes("GOALKEEPER") || upper === "GK") return "GK";
  if (
    upper.includes("DEFENDER") ||
    upper.includes("CB") ||
    upper.includes("LB") ||
    upper.includes("RB") ||
    upper.includes("DF")
  )
    return "DF";
  if (
    upper.includes("MIDFIELDER") ||
    upper.includes("CM") ||
    upper.includes("CAM") ||
    upper.includes("CDM") ||
    upper.includes("MF")
  )
    return "MF";
  if (
    upper.includes("FORWARD") ||
    upper.includes("ST") ||
    upper.includes("CF") ||
    upper.includes("LW") ||
    upper.includes("RW") ||
    upper.includes("FW")
  )
    return "FW";
  return pos;
};

export const calculateWeightedRating = (
  position: string,
  strengths: {
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
  }
): number => {
  const shortPos = getShortPositionForm(position);
  const {
    pace = 75,
    shooting = 75,
    passing = 75,
    dribbling = 75,
    defending = 75,
    physical = 75,
  } = strengths || {};

  switch (shortPos) {
    case "GK":
      return Math.round(
        defending * 0.5 + physical * 0.3 + passing * 0.15 + pace * 0.05
      );
    case "DF":
      return Math.round(
        defending * 0.4 +
          physical * 0.25 +
          pace * 0.15 +
          passing * 0.1 +
          dribbling * 0.05 +
          shooting * 0.05
      );
    case "MF":
      return Math.round(
        passing * 0.35 +
          dribbling * 0.2 +
          pace * 0.15 +
          physical * 0.15 +
          defending * 0.1 +
          shooting * 0.05
      );
    case "FW":
    default:
      return Math.round(
        shooting * 0.35 +
          pace * 0.25 +
          dribbling * 0.2 +
          passing * 0.1 +
          physical * 0.1
      );
  }
};
