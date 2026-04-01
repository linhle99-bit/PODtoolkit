interface Step {
  label: string;
  icon: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-5 px-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 ${
              i === currentStep
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-lg shadow-purple-600/20'
                : i < currentStep
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-gray-800/60 text-gray-500 border border-gray-700/30'
            }`}
          >
            <span className="text-base">{step.icon}</span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-6 sm:w-10 h-0.5 mx-1 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gray-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
