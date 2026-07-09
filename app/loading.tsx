export default function Loading() {
  return (
    <div className="grid min-h-[80vh] place-items-center">
      <div className="relative h-24 w-24">
        {["46,155,255", "255,46,85", "46,203,124"].map((c, i) => (
          <span
            key={c}
            className="absolute inset-0 rounded-full blur-lg animate-breathe"
            style={{
              background: `radial-gradient(circle, rgba(${c},0.7), transparent 70%)`,
              mixBlendMode: "multiply",
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
