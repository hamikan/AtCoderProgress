import type { AccountJourneyAnalytics } from '@/lib/services/db/stats';
import RatingFitnessPanel from './account-journey/RatingFitnessPanel';
import RatingJourney from './account-journey/RatingJourney';
import SummaryCards from './account-journey/SummaryCards';

interface AccountJourneyProps {
  data: AccountJourneyAnalytics;
}

export default function AccountJourney({ data }: AccountJourneyProps) {
  return (
    <div className="space-y-6">
      <SummaryCards data={data} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RatingJourney
            bands={data.bandSummaries}
            curriculumSections={data.curriculumSections}
          />
        </div>
        <RatingFitnessPanel data={data} />
      </div>
    </div>
  );
}
