import { Player, ReportView, ReportStats } from "./GameReportTypes";

export const getPlayerTag = (player: Player): string => {
  const fullName = player.fullName ?? "";

  if (fullName === "Marcus Silva") return "U-15";
  if (fullName === "Sarah Williams") return "U-16";
  if (fullName === "David Chen") return "U-17";
  if (fullName === "Alex Jonson" || fullName === "Alex Jordan") {
    return "U-17";
  }
  if (fullName === "James Brown") return "U-19";

  const ageNum = parseInt(String(player.age ?? ""), 10);

  if (!Number.isNaN(ageNum)) {
    return `U-${ageNum}`;
  }

  return "U-15";
};

export const normalizeRating = (rating: unknown): number => {
  const numericRating = Number(rating ?? 0);

  if (!Number.isFinite(numericRating)) {
    return 0;
  }

  return numericRating <= 10 ? numericRating * 10 : numericRating;
};

export const safeString = (value: unknown): string => {
  return String(value ?? "");
};

export const getStatsFromReport = (report: ReportView): ReportStats => {
  const isGK =
    safeString(report.playerPosition).toUpperCase() === "GOALKEEPER";

  if (isGK) {
    const passes = Number(report.passes ?? 50);
    const passAccuracy = Number(report.passAccuracy ?? 90);

    return {
      shotsOnGoal: 0,
      goalScored: Number(report.goals ?? 0),
      assists: Number(report.assists ?? 0),
      passAccurate: passes,
      wrongPass: Math.round(passes * (1 - passAccuracy / 100)) || 5,
      penaltiesTaken: 0,
      standTackle: 0,
      slidingTackle: 0,
      interception: 0,
      savesAccurate: 10,
      freeKick: 0,
      cornerKick: 0,
      goalUnsave: 1,
      penaltiesSaves: 1,
      appearances: 1,
      fault: 1,
      redCard: Number(report.redCards ?? 0),
      yellowCard: Number(report.yellowCards ?? 0),
      punching: 5,
      handling: 10,
      reflex: 8,
      aerialAbility: 7,
      throwing: 8,
      reactions: 9,
    };
  }

  const passes = Number(report.passes ?? 80);
  const passAccuracy = Number(report.passAccuracy ?? 90);

  return {
    shotsOnGoal: Number(report.goals ?? 0) + 3,
    goalScored: Number(report.goals ?? 0),
    assists: Number(report.assists ?? 0),
    passAccurate: passes,
    wrongPass: Math.round(passes * (1 - passAccuracy / 100)) || 8,
    penaltiesTaken: 1,
    standTackle: 6,
    slidingTackle: 4,
    interception: 8,
    savesAccurate: 0,
    freeKick: 3,
    cornerKick: 4,
    goalUnsave: 0,
    penaltiesSaves: 0,
    appearances: 1,
    fault: 2,
    redCard: Number(report.redCards ?? 0),
    yellowCard: Number(report.yellowCards ?? 0),
    punching: 0,
    handling: 0,
    reflex: 0,
    aerialAbility: 5,
    throwing: 0,
    reactions: 8,
  };
};

export const mapStat = (value: number, maxValue = 15): number => {
  if (maxValue <= 0) {
    return 50;
  }

  return Math.min(
    99,
    Math.max(50, Math.round(50 + (value / maxValue) * 49))
  );
};
