import React from 'react';
import Icon from '../AppIcon';

const BookingProgress = ({ currentStep = 1, steps = [], onStepClick }) => {
  const defaultSteps = [
    { id: 1, label: 'Location', icon: 'MapPin', completed: false },
    { id: 2, label: 'Accommodation', icon: 'Home', completed: false },
    { id: 3, label: 'Activities', icon: 'Compass', completed: false },
    { id: 4, label: 'Review', icon: 'ShoppingCart', completed: false }
  ];

  const bookingSteps = steps?.length > 0 ? steps : defaultSteps;

  const handleStepClick = (step) => {
    if (step?.completed && onStepClick) {
      onStepClick(step?.id);
    }
  };

  return (
    <div className="bg-card border-b border-border py-6 px-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between">
          {bookingSteps?.map((step, index) => (
            <React.Fragment key={step?.id}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!step?.completed && step?.id !== currentStep}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-organic ${
                    step?.id === currentStep
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : step?.completed
                      ? 'bg-success text-success-foreground hover-lift cursor-pointer'
                      : 'bg-muted text-muted-foreground'
                  } ${step?.completed ? 'active-press' : ''}`}
                  aria-label={`Step ${step?.id}: ${step?.label}`}
                  aria-current={step?.id === currentStep ? 'step' : undefined}
                >
                  {step?.completed ? (
                    <Icon name="Check" size={24} strokeWidth={2.5} />
                  ) : (
                    <Icon name={step?.icon} size={24} strokeWidth={2} />
                  )}
                </button>
                <span
                  className={`text-sm font-medium transition-organic hidden md:block ${
                    step?.id === currentStep
                      ? 'text-primary font-semibold'
                      : step?.completed
                      ? 'text-success' :'text-muted-foreground'
                  }`}
                >
                  {step?.label}
                </span>
                <span className="text-xs text-muted-foreground md:hidden">
                  {step?.id}
                </span>
              </div>

              {index < bookingSteps?.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative" style={{ maxWidth: '120px' }}>
                  <div className="absolute inset-0 bg-muted" />
                  <div
                    className={`absolute inset-0 transition-organic ${
                      step?.completed ? 'bg-success' : 'bg-transparent'
                    }`}
                    style={{
                      width: step?.completed ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <div className="flex items-center justify-center gap-2">
            <Icon
              name={bookingSteps?.[currentStep - 1]?.icon || 'Circle'}
              size={20}
              strokeWidth={2}
              color="var(--color-primary)"
            />
            <span className="text-sm font-medium text-primary">
              {bookingSteps?.[currentStep - 1]?.label || `Step ${currentStep}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProgress;