interface ChatButtonProps {
  onClick: () => void;
}

export const ChatButton = ({ onClick }: ChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 w-16 h-16 rounded-full overflow-hidden shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]"
      aria-label="Abrir asistente Russo"
    >
      <img
        src="https://assets.distribuidor-puntopas.com/image/upload/v1777752695/1.png"
        alt="Russo asistente"
        className="w-full h-full object-cover"
      />
    </button>
  );
};
