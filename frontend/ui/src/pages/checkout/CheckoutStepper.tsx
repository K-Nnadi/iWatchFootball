import { Stepper } from '@mantine/core';

interface CheckoutStepperProps {
    activeStep: number;
    isLoggedIn: boolean;
    onStepClick: (step: number) => void;
}

export function CheckoutStepper({ activeStep, isLoggedIn, onStepClick }: CheckoutStepperProps) {
    // Get the display step for the stepper (0-based index for the stepper component)
    const getStepperStep = () => {
        if (isLoggedIn) {
            // When logged in, step 1 becomes stepper step 0, step 2 becomes 1, step 3 becomes 2
            return activeStep - 1;
        }
        // When not logged in, steps match directly
        return activeStep;
    };

    const currentStepperStep = getStepperStep();

    const steps = isLoggedIn
        ? [
              { label: 'Your Details', description: 'Email and billing address', number: 1 },
              { label: 'Additional Information', description: 'Terms and preferences', number: 2 },
              { label: 'Payment', description: 'Payment method', number: 3 },
          ]
        : [
              { label: 'Authentication', description: 'Sign in or continue as guest', number: 1 },
              { label: 'Your Details', description: 'Email and billing address', number: 2 },
              { label: 'Additional Information', description: 'Terms and preferences', number: 3 },
              { label: 'Payment', description: 'Payment method', number: 4 },
          ];

    return (
        <Stepper
            active={currentStepperStep}
            onStepClick={(step) => {
                if (step <= currentStepperStep) {
                    onStepClick(step);
                }
            }}
            orientation="horizontal"
            mb="xl"
            size="md"
            iconSize={42}
            styles={{
                stepBody: {
                    paddingTop: '8px',
                },
                step: {
                    flex: 1,
                },
                separator: {
                    marginLeft: '8px',
                    marginRight: '8px',
                },
            }}
        >
            {steps.map((step) => (
                <Stepper.Step key={step.number} label={step.label} description={step.description} />
            ))}
        </Stepper>
    );
}


