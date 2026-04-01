import { useAppStore } from './store/useAppStore';
import Stepper from '../../components/Shared/Stepper';
import Step1_UploadMockup from './components/Step1_UploadMockup';
import Step2_DefinePrintArea from './components/Step2_DefinePrintArea';
import Step3_UploadDesigns from './components/Step3_UploadDesigns';
import Step4_PreviewExport from './components/Step4_PreviewExport';

const stepDefs = [
  { label: 'Upload Mockup', icon: '\uD83D\uDC55' },
  { label: 'Print Area', icon: '\u2702\uFE0F' },
  { label: 'Upload Design', icon: '\uD83C\uDFA8' },
  { label: 'Preview & Export', icon: '\uD83D\uDCF8' },
];

const stepComponents = [Step1_UploadMockup, Step2_DefinePrintArea, Step3_UploadDesigns, Step4_PreviewExport];

export default function MockupGenerator() {
  const { currentStep, mockups, designs, results } = useAppStore();
  const StepComponent = stepComponents[currentStep];

  return (
    <div>
      <Stepper steps={stepDefs} currentStep={currentStep} />

      <div className="mt-4">
        <StepComponent />
      </div>

      {/* Stats bar */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-950/80 backdrop-blur-xl border-t border-gray-800/50 z-40">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-gray-400">{mockups.length} mockup(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-400">{designs.length} design(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">{results.length} output(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
