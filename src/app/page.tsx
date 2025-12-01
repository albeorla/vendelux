import { QuestionFlow } from '@/components/questions/QuestionFlow';

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-mesh flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-light)] mb-6">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></span>
          <span className="text-sm font-medium text-[var(--color-primary)]">Find your next experience</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-[var(--color-gray-900)] mb-4 tracking-tight">
          Discover Events
          <span className="text-[var(--color-primary)]">.</span>
        </h1>
        <p className="text-lg text-[var(--color-gray-600)] max-w-md mx-auto">
          Answer a few quick questions and we&apos;ll curate the perfect events tailored just for you.
        </p>
      </div>
      <QuestionFlow />
    </main>
  );
}
