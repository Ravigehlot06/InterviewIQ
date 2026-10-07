import Avatar from "./Avatar";

export default function AvatarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-4">
      {["boy", "girl"].map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
            value === type ? "card ring-2 ring-emerald/50" : "card-soft"
          }`}
        >
          <Avatar type={type} size={56} />
          <span className="text-xs font-medium text-ink-soft capitalize">{type}</span>
        </button>
      ))}
    </div>
  );
}
