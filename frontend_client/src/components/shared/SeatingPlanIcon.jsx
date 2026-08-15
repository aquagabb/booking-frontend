const LIGHT_GRAY = "#d1d5db";
const DARK_GRAY = "#4b5563";

const Dot = ({ cx, cy, r = 2.5 }) => (
  <circle cx={cx} cy={cy} r={r} fill={DARK_GRAY} />
);

const StandingIcon = () => (
  <rect
    x="10"
    y="8"
    width="36"
    height="24"
    fill="none"
    stroke={LIGHT_GRAY}
    strokeWidth="2"
    strokeDasharray="4 3"
    rx="2"
  />
);

const DiningIcon = () => {
  const centerX = 28;
  const centerY = 20;
  const radius = 16;
  const dotCount = 10;

  return (
    <>
      <circle cx={centerX} cy={centerY} r="8" fill={LIGHT_GRAY} />
      {Array.from({ length: dotCount }, (_, i) => {
        const angle = (i * 360) / dotCount - 90;
        const rad = (angle * Math.PI) / 180;
        return (
          <Dot
            key={i}
            cx={centerX + radius * Math.cos(rad)}
            cy={centerY + radius * Math.sin(rad)}
          />
        );
      })}
    </>
  );
};

const BoardroomIcon = () => (
  <>
    <rect x="10" y="15" width="36" height="10" fill={LIGHT_GRAY} rx="1.5" />
    <Dot cx={16} cy={11} />
    <Dot cx={28} cy={11} />
    <Dot cx={40} cy={11} />
    <Dot cx={16} cy={29} />
    <Dot cx={28} cy={29} />
    <Dot cx={40} cy={29} />
    <Dot cx={6} cy={20} />
    <Dot cx={50} cy={20} />
  </>
);

const TheaterIcon = () => (
  <>
    <rect x="12" y="30" width="32" height="4" fill={LIGHT_GRAY} rx="1" />
    {[0, 1, 2].map((row) =>
      [0, 1, 2, 3, 4].map((col) => (
        <Dot key={`${row}-${col}`} cx={14 + col * 7} cy={12 + row * 6} r={2} />
      ))
    )}
  </>
);

const ClassroomIcon = () => (
  <>
    {[0, 1, 2].map((row) =>
      [0, 1, 2, 3].map((col) => (
        <g key={`${row}-${col}`}>
          <rect
            x={11 + col * 10}
            y={11 + row * 9}
            width="7"
            height="4"
            fill={LIGHT_GRAY}
            rx="0.5"
          />
          <Dot cx={14.5 + col * 10} cy={18 + row * 9} r={2} />
        </g>
      ))
    )}
  </>
);

const DefaultIcon = () => (
  <rect x="10" y="8" width="36" height="24" fill={LIGHT_GRAY} rx="2" opacity="0.5" />
);

const ICONS = {
  standing: StandingIcon,
  dining: DiningIcon,
  boardroom: BoardroomIcon,
  theater: TheaterIcon,
  classroom: ClassroomIcon,
};

const normalizeSeatingType = (type) =>
  type?.toLowerCase?.().replace(/\s+/g, "_") ?? "";

const SeatingPlanIcon = ({ type, className = "" }) => {
  const key = normalizeSeatingType(type);
  const Icon = ICONS[key] || DefaultIcon;

  return (
    <svg
      viewBox="0 0 56 40"
      className={`w-14 h-10 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <Icon />
    </svg>
  );
};

export default SeatingPlanIcon;
