import Link from 'next/link';
import { ProjectHeaderProps } from '@/types/project';

// Projects list header - Title/count + creation CTA
// projectCount - Dynamic total with Turkish pluralization
// newProjectButton - Icon+text combo with focus states
// responsiveLayout - Flex → Grid on mobile breakpoints

export function ProjectHeader({ projectCount }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Projelerim
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Toplam {projectCount} proje
        </p>
      </div>
      <Link
        href="/dashboard/projects/new"
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Yeni Proje
      </Link>
    </div>
  );
} 