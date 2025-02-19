import Link from 'next/link';
import { ProjectCardProps } from '@/types/project';

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
          <span className="text-xl font-bold text-white">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
          {project.project_members?.length || 0} üye
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
        {project.name}
      </h3>
      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
        {project.description || 'Açıklama eklenmemiş'}
      </p>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
        </svg>
        {new Date(project.created_at).toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </Link>
  );
} 