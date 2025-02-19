'use client';

import { useProjectPage } from '@/lib/hooks/use-project-page';
import { ProjectHeader } from '../../../../views/projects-header';
import { ProjectContent } from '../../../../views/project-content';
import { ProjectModals } from '../../../../views/modals';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProjectDetailPage() {
  const { loading, error, headerProps, contentProps, modalProps } = useProjectPage();

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="space-y-2 animate-pulse">
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Hata</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ProjectHeader {...headerProps} />
        <ProjectContent {...contentProps} />
        <ProjectModals {...modalProps} />
      </div>
    </div>
  );
}