/**
 * K10 Football — Position-Wise Attributes & Positional Co-efficients Configuration
 * Single Source of Truth based on official Client Excel Sheets & POSITION_ATTRIBUTES_AND_COEFFICIENTS.md
 */

export type PositionKey =
  | 'GK'
  | 'CB'
  | 'RB-LB'
  | 'RWB-LWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'RW-LW'
  | 'CF'
  | 'ST';

export interface PositionalAttributeItem {
  key: string;
  label: string;
  weight: number; // percentage (sum = 100)
}

export const POSITION_COEFFICIENTS_CONFIG: Record<PositionKey, PositionalAttributeItem[]> = {
  GK: [
    { key: 'reflexes', label: 'Reflexes', weight: 12 },
    { key: 'handling', label: 'Handling', weight: 9 },
    { key: 'positioning', label: 'GK Positioning', weight: 11 },
    { key: 'oneOnOne', label: 'One-on-One', weight: 10 },
    { key: 'aerialAbility', label: 'Aerial Ability', weight: 8 },
    { key: 'crossClaiming', label: 'Cross Claiming', weight: 7 },
    { key: 'shotStopping', label: 'Shot Stopping', weight: 12 },
    { key: 'footwork', label: 'Footwork', weight: 6 },
    { key: 'distribution', label: 'Distribution', weight: 7 },
    { key: 'decisions', label: 'Decision Making', weight: 7 },
    { key: 'communication', label: 'Communication', weight: 5 },
    { key: 'composure', label: 'Composure', weight: 6 },
  ],
  CB: [
    { key: 'positioning', label: 'Defensive Positioning', weight: 12 },
    { key: 'marking', label: 'Marking', weight: 10 },
    { key: 'tackling', label: 'Tackling', weight: 11 },
    { key: 'interceptions', label: 'Interceptions', weight: 10 },
    { key: 'anticipation', label: 'Anticipation', weight: 9 },
    { key: 'aerialDuels', label: 'Aerial Duels', weight: 9 },
    { key: 'strength', label: 'Strength', weight: 8 },
    { key: 'defensiveAwareness', label: 'Defensive Awareness', weight: 10 },
    { key: 'shortPassing', label: 'Passing', weight: 5 },
    { key: 'ballControl', label: 'Ball Control', weight: 4 },
    { key: 'decisions', label: 'Decision Making', weight: 7 },
    { key: 'composure', label: 'Composure', weight: 5 },
  ],
  'RB-LB': [
    { key: 'positioning', label: 'Defensive Positioning', weight: 10 },
    { key: 'oneOnOne', label: 'One-on-One Defending', weight: 10 },
    { key: 'tackling', label: 'Tackling', weight: 9 },
    { key: 'interceptions', label: 'Interceptions', weight: 7 },
    { key: 'acceleration', label: 'Acceleration', weight: 9 },
    { key: 'sprintSpeed', label: 'Sprint Speed', weight: 9 },
    { key: 'stamina', label: 'Stamina', weight: 9 },
    { key: 'crossing', label: 'Crossing', weight: 9 },
    { key: 'shortPassing', label: 'Passing', weight: 7 },
    { key: 'ballControl', label: 'Ball Control', weight: 6 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 7 },
    { key: 'decisions', label: 'Decision Making', weight: 8 },
  ],
  'RWB-LWB': [
    { key: 'acceleration', label: 'Acceleration', weight: 10 },
    { key: 'sprintSpeed', label: 'Sprint Speed', weight: 10 },
    { key: 'stamina', label: 'Stamina', weight: 11 },
    { key: 'dribbling', label: 'Dribbling', weight: 9 },
    { key: 'ballControl', label: 'Ball Control', weight: 8 },
    { key: 'crossing', label: 'Crossing', weight: 11 },
    { key: 'shortPassing', label: 'Passing', weight: 7 },
    { key: 'attPosition', label: 'Attacking Positioning', weight: 8 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 8 },
    { key: 'oneOnOne', label: 'One-on-One Defending', weight: 7 },
    { key: 'positioning', label: 'Defensive Positioning', weight: 6 },
    { key: 'decisions', label: 'Decision Making', weight: 5 },
  ],
  CDM: [
    { key: 'positioning', label: 'Defensive Positioning', weight: 11 },
    { key: 'interceptions', label: 'Interceptions', weight: 11 },
    { key: 'tackling', label: 'Tackling', weight: 9 },
    { key: 'defensiveAwareness', label: 'Defensive Awareness', weight: 10 },
    { key: 'anticipation', label: 'Anticipation', weight: 8 },
    { key: 'shortPassing', label: 'Short Passing', weight: 9 },
    { key: 'longPassing', label: 'Long Passing', weight: 7 },
    { key: 'ballControl', label: 'Ball Control', weight: 7 },
    { key: 'vision', label: 'Vision', weight: 6 },
    { key: 'decisions', label: 'Decision Making', weight: 9 },
    { key: 'composure', label: 'Composure', weight: 6 },
    { key: 'stamina', label: 'Stamina', weight: 7 },
  ],
  CM: [
    { key: 'firstTouch', label: 'First Touch', weight: 8 },
    { key: 'ballControl', label: 'Ball Control', weight: 9 },
    { key: 'shortPassing', label: 'Short Passing', weight: 11 },
    { key: 'longPassing', label: 'Long Passing', weight: 8 },
    { key: 'vision', label: 'Vision', weight: 10 },
    { key: 'decisions', label: 'Decision Making', weight: 10 },
    { key: 'awareness', label: 'Awareness', weight: 9 },
    { key: 'composure', label: 'Composure', weight: 8 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 6 },
    { key: 'interceptions', label: 'Interceptions', weight: 6 },
    { key: 'stamina', label: 'Stamina', weight: 8 },
    { key: 'teamwork', label: 'Teamwork', weight: 7 },
  ],
  CAM: [
    { key: 'firstTouch', label: 'First Touch', weight: 9 },
    { key: 'ballControl', label: 'Ball Control', weight: 10 },
    { key: 'dribbling', label: 'Dribbling', weight: 10 },
    { key: 'shortPassing', label: 'Short Passing', weight: 8 },
    { key: 'throughPassing', label: 'Through Passing', weight: 9 },
    { key: 'vision', label: 'Vision', weight: 11 },
    { key: 'creativity', label: 'Creativity', weight: 11 },
    { key: 'decisions', label: 'Decision Making', weight: 8 },
    { key: 'attPosition', label: 'Attacking Positioning', weight: 7 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 6 },
    { key: 'finishing', label: 'Finishing', weight: 5 },
    { key: 'composure', label: 'Composure', weight: 6 },
  ],
  'RW-LW': [
    { key: 'acceleration', label: 'Acceleration', weight: 10 },
    { key: 'sprintSpeed', label: 'Sprint Speed', weight: 9 },
    { key: 'agility', label: 'Agility', weight: 8 },
    { key: 'dribbling', label: 'Dribbling', weight: 12 },
    { key: 'ballControl', label: 'Ball Control', weight: 9 },
    { key: 'firstTouch', label: 'First Touch', weight: 7 },
    { key: 'oneOnOneAttacking', label: 'One-on-One Attacking', weight: 11 },
    { key: 'crossing', label: 'Crossing', weight: 7 },
    { key: 'chanceCreation', label: 'Chance Creation', weight: 7 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 7 },
    { key: 'finishing', label: 'Finishing', weight: 6 },
    { key: 'decisions', label: 'Decision Making', weight: 7 },
  ],
  CF: [
    { key: 'firstTouch', label: 'First Touch', weight: 9 },
    { key: 'ballControl', label: 'Ball Control', weight: 8 },
    { key: 'attPosition', label: 'Attacking Positioning', weight: 10 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 9 },
    { key: 'linkUpPlay', label: 'Link-Up Play', weight: 9 },
    { key: 'finishing', label: 'Finishing', weight: 11 },
    { key: 'shooting', label: 'Shooting', weight: 8 },
    { key: 'dribbling', label: 'Dribbling', weight: 7 },
    { key: 'shortPassing', label: 'Passing', weight: 7 },
    { key: 'strength', label: 'Strength', weight: 6 },
    { key: 'decisions', label: 'Decision Making', weight: 8 },
    { key: 'composure', label: 'Composure', weight: 8 },
  ],
  ST: [
    { key: 'finishing', label: 'Finishing', weight: 13 },
    { key: 'attPosition', label: 'Attacking Positioning', weight: 11 },
    { key: 'offTheBall', label: 'Off-the-Ball Movement', weight: 9 },
    { key: 'firstTouch', label: 'First Touch', weight: 8 },
    { key: 'shotAccuracy', label: 'Shot Accuracy', weight: 9 },
    { key: 'oneOnOneFinishing', label: 'One-on-One Finishing', weight: 10 },
    { key: 'aerialAbility', label: 'Aerial Ability', weight: 7 },
    { key: 'strength', label: 'Strength', weight: 6 },
    { key: 'acceleration', label: 'Acceleration', weight: 7 },
    { key: 'anticipation', label: 'Anticipation', weight: 7 },
    { key: 'decisions', label: 'Decision Making', weight: 6 },
    { key: 'composure', label: 'Composure', weight: 7 },
  ],
};

/**
 * Normalizes any free-form or futsal position string into one of 10 canonical position keys.
 */
export const normalizePositionKey = (position?: string): PositionKey => {
  if (!position) return 'CM';
  const p = position.toUpperCase().trim();

  // Goalkeeper
  if (p === 'GK' || p.includes('GOALKEEPER') || p.includes('KEEPER')) return 'GK';

  // Center Back / Fixo
  if (
    p === 'CB' ||
    p.includes('CENTER BACK') ||
    p.includes('CENTRE BACK') ||
    p.includes('FIXO') ||
    (p.includes('DEFENDER') && !p.includes('MIDFIELDER') && !p.includes('WING') && !p.includes('BACK'))
  ) {
    return 'CB';
  }

  // Wing Backs (Check before full backs)
  if (
    p === 'RWB' ||
    p === 'LWB' ||
    p === 'RWB-LWB' ||
    p === 'RWB/LWB' ||
    p.includes('WING BACK') ||
    p.includes('WINGBACK')
  ) {
    return 'RWB-LWB';
  }

  // Full Backs
  if (
    p === 'RB' ||
    p === 'LB' ||
    p === 'RB-LB' ||
    p === 'RB/LB' ||
    p.includes('RIGHT BACK') ||
    p.includes('LEFT BACK') ||
    p.includes('FULL BACK')
  ) {
    return 'RB-LB';
  }

  // Central Defensive Midfielder
  if (p === 'CDM' || p.includes('DEFENSIVE MIDFIELDER') || p.includes('HOLDING MIDFIELDER')) {
    return 'CDM';
  }

  // Central Attacking Midfielder
  if (p === 'CAM' || p.includes('ATTACKING MIDFIELDER') || p.includes('PLAYMAKER')) {
    return 'CAM';
  }

  // Wingers / Alas
  if (
    p === 'RW' ||
    p === 'LW' ||
    p === 'RW-LW' ||
    p === 'RW/LW' ||
    p.includes('WINGER') ||
    p.includes('RIGHT WING') ||
    p.includes('LEFT WING') ||
    p.includes('ALAS')
  ) {
    return 'RW-LW';
  }

  // Center Forward / Pivot
  if (
    p === 'CF' ||
    p.includes('CENTER FORWARD') ||
    p.includes('CENTRE FORWARD') ||
    p.includes('SECOND STRIKER') ||
    p.includes('SHADOW STRIKER') ||
    p.includes('PIVOT')
  ) {
    return 'CF';
  }

  // Striker
  if (
    p === 'ST' ||
    p.includes('STRIKER') ||
    p.includes('FORWARD') ||
    p.includes('ATTACKER')
  ) {
    return 'ST';
  }

  // Central Midfielder default
  if (p === 'CM' || p.includes('MIDFIELDER')) {
    return 'CM';
  }

  return 'CM';
};

/**
 * Calculates exact weighted position overall (0-100) from 12 positional attributes
 */
export const calculatePositionOverall = (
  position: string,
  values: Record<string, number>,
): number => {
  const normKey = normalizePositionKey(position);
  const items = POSITION_COEFFICIENTS_CONFIG[normKey] || POSITION_COEFFICIENTS_CONFIG.CM;
  const total = items.reduce((sum, item) => {
    const score = Number(values[item.key] ?? 50);
    return sum + score * (item.weight / 100);
  }, 0);
  return Math.min(99, Math.max(1, Math.round(total)));
};

/**
 * Dropdown options for Player Position selector (matching POSITION_ATTRIBUTES_AND_COEFFICIENTS.md)
 */
export const POSITION_DROPDOWN_OPTIONS = [
  '--Football Positions--',
  'Goalkeeper (GK)',
  'Center Back (CB)',
  'Right Back (RB)',
  'Left Back (LB)',
  'Right Wing Back (RWB)',
  'Left Wing Back (LWB)',
  'Central Defensive Midfielder (CDM)',
  'Central Midfielder (CM)',
  'Central Attacking Midfielder (CAM)',
  'Right Winger (RW)',
  'Left Winger (LW)',
  'Center Forward (CF)',
  'Striker (ST)',
  '--Futsal Positions--',
  'Goalkeeper (GK)',
  'Fixo (Defender / CB)',
  'Alas (Right Wing / RW)',
  'Alas (Left Wing / LW)',
  'Pivot (Forward / CF)',
];
