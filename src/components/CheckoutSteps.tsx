interface CheckoutStepsProps {
  activeStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { id: 1, label: "Revisar orden" },
  { id: 2, label: "Datos personales" },
  { id: 3, label: "Entrega" },
  { id: 4, label: "Datos de pago" },
];

export const CheckoutSteps = ({ activeStep }: CheckoutStepsProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-2 sm:px-4 py-3 sm:py-4 mb-5 sm:mb-6 overflow-hidden">
      <div className="grid grid-cols-4 gap-1 sm:gap-2 items-start">
        {STEPS.map((step, index) => {
          const isActive = step.id === activeStep;
          const isDone = step.id < activeStep;
          const showConnector = index < STEPS.length - 1;

          return (
            <div key={step.id} className="relative flex flex-col items-center text-center min-w-0">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                  isDone || isActive ? "bg-[#FA003F] text-white" : "bg-sky-400 text-white"
                }`}
              >
                {step.id}
              </div>
              <span className={`mt-2 text-[10px] leading-tight sm:text-xs md:text-sm ${isActive ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                {step.label}
              </span>
              {showConnector && (
                <div className="hidden sm:block absolute top-4 left-[56%] w-[88%] h-[2px] bg-slate-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
