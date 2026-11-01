import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-guard';
import { ProjectForm } from '@/components/admin/ProjectForm';
import type { Project } from '@/types/database.types';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ProjectForm initialData={project as Project} isEdit />
    </div>
  );
}
