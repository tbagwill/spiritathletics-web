import CampaignForm from '../CampaignForm';

export default function NewCampaignPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-600">Set up a new pop-up shop campaign with start and end dates</p>
      </div>

      <CampaignForm />
    </div>
  );
}
