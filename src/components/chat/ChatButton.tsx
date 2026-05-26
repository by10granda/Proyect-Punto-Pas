interface ChatButtonProps {
  onClick: () => void;
}

export const ChatButton = ({ onClick }: ChatButtonProps) => {
  const russoPrimaryImageCandidates = [
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573691/RUSSO1.png?v=20260526",
    "https://assets.distribuidor-puntopas.com/PERRO/RUSSO1.png",
    "https://assets.distribuidor-puntopas.com/PERRO/1.png",
  ];

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 w-16 h-16 rounded-full overflow-hidden shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]"
      aria-label="Abrir asistente Russo"
    >
      <img
        src={russoPrimaryImageCandidates[0]}
        alt="Russo asistente"
        className="w-full h-full object-contain"
        onError={(event) => {
          const image = event.currentTarget;
          const currentIndex = Number(image.dataset.fallbackIndex || "0");
          const nextIndex = currentIndex + 1;

          if (nextIndex >= russoPrimaryImageCandidates.length) {
            return;
          }

          image.dataset.fallbackIndex = String(nextIndex);
          image.src = russoPrimaryImageCandidates[nextIndex];
        }}
      />
    </button>
  );
};
