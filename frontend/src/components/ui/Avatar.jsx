/** Simple flat boy/girl avatar glyphs, recoloured to the emerald/amber palette. */
export default function Avatar({ type = "boy", size = 40, className = "" }) {
  const isBoy = type === "boy";
  return (
    <div
      className={`card-soft flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%">
        <circle cx="32" cy="32" r="32" fill={isBoy ? "#dff1ea" : "#fbefe0"} />
        {isBoy ? (
          <path d="M14 26c0-11 8-18 18-18s18 7 18 18v3H14z" fill="#0f7a57" />
        ) : (
          <path d="M12 30c0-13 9-22 20-22s20 9 20 22c0 4-1 7-2 10-2-6-4-9-6-9-3 3-7 5-12 5s-9-2-12-5c-2 0-4 3-6 9-1-3-2-6-2-10z" fill="#ee8420" />
        )}
        <circle cx="32" cy="34" r="14" fill="#f4d3ae" />
        <circle cx="27" cy="33" r="1.6" fill="#16181a" />
        <circle cx="37" cy="33" r="1.6" fill="#16181a" />
        <path d="M26 39c2 2.5 10 2.5 12 0" stroke="#a4560c" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M14 60c1-10 8-16 18-16s17 6 18 16z" fill={isBoy ? "#0f7a57" : "#f2a03d"} />
      </svg>
    </div>
  );
}
