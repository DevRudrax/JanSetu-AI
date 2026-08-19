import React from 'react';
import { UniversalSearch } from '../hero/UniversalSearch';
import { GrievanceCard } from '../bento/GrievanceCard';
import { SchemeMatcherCard } from '../bento/SchemeMatcherCard';
import { DocSimplifierCard } from '../bento/DocSimplifierCard';
import { LiveIntelligenceFeed } from '../bento/LiveIntelligenceFeed';

export const DashboardView: React.FC = () => {
  return (
    <div className="flex flex-col w-full gap-10 p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto animate-in fade-in duration-200">
      {/* Hero / Universal AI Search & Query Bar */}
      <UniversalSearch />

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 w-full">
        {/* Card A: Multimodal Grievance Submission (7 cols) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col">
          <GrievanceCard />
        </div>

        {/* Card B: AI Welfare Scheme Matcher (5 cols) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col">
          <SchemeMatcherCard />
        </div>

        {/* Card C: Official Document Simplifier (12 cols) */}
        <div className="col-span-1 lg:col-span-12 flex flex-col">
          <DocSimplifierCard />
        </div>
      </div>

      {/* Live Transparency & Resolution Feed */}
      <LiveIntelligenceFeed />
    </div>
  );
};
