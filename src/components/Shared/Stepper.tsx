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
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 px-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${
              i === currentStep
                ? 'bg-purple-600 text-white font-medium'
                : i < currentStep
                ? 'bg-green-600/20 text-green-400'
                : 'bg-gray-800 text-gray-500'
            }`}
          >
            <span>{step.icon}</span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-6 sm:w-10 h-0.5 mx-1 ${
                i < currentStep ? 'bg-green-500' : 'bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
