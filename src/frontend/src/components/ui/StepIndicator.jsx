import React from 'react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isActive = idx <= currentStep;
        return (
          <React.Fragment key={idx}>
            <div className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                {idx + 1}
              </div>
              <span className="text-[10px] mt-1 font-semibold">{step}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${idx < currentStep ? 'bg-primary' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
