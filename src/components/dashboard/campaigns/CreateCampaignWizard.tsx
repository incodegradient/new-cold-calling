import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import { toast } from 'sonner';
import { Stepper, StepperItem, StepperSeparator } from '@/components/ui/stepper';
import Step1Details from './steps/Step1_Details';
import Step2Leads from './steps/Step2_Leads';
import Step3Schedule from './steps/Step3_Schedule';
import Step4Summary from './steps/Step4_Summary';

interface CreateCampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCampaignWizard = ({ isOpen, onClose }: CreateCampaignWizardProps) => {
  const [step, setStep] = useState(0);
  const [campaignData, setCampaignData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { createCampaign } = useCampaigns();

  const steps = ["Details", "Leads", "Schedule", "Summary"];

  const handleNext = (data: any) => {
    setCampaignData((prev: any) => ({ ...prev, ...data }));
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const { name, agent_id, schedule, pacing, retry_rules } = campaignData;
        const { selectedLeads, selectedGroups } = campaignData;
        
        await createCampaign(
            { name, agent_id, schedule, pacing, retry_rules },
            selectedLeads,
            selectedGroups
        );

      toast.success("Campaign created successfully!");
      onClose();
    } catch (error: any) {
      toast.error(`Failed to create campaign: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step1Details onNext={handleNext} initialData={campaignData} />;
      case 1:
        return <Step2Leads onNext={handleNext} onBack={handleBack} initialData={campaignData} />;
      case 2:
        return <Step3Schedule onNext={handleNext} onBack={handleBack} initialData={campaignData} />;
      case 3:
        return <Step4Summary onSubmit={handleSubmit} onBack={handleBack} data={campaignData} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Follow the steps to set up your outbound calling campaign.</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">
          <Stepper>
            {steps.map((label, index) => (
              <React.Fragment key={label}>
                <StepperItem isActive={step === index} isCompleted={step > index}>
                  {label}
                </StepperItem>
                {index < steps.length - 1 && <StepperSeparator />}
              </React.Fragment>
            ))}
          </Stepper>
        </div>
        <div className="flex-grow overflow-y-auto px-6 pb-6">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dummy Stepper for structure
const React: any = {}; // To avoid ts error on React.Fragment
export default CreateCampaignWizard;
