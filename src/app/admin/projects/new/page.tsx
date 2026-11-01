import { requireAdmin } from '@/lib/auth-guard';
import { ProjectForm } from '@/components/admin/ProjectForm';


export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl mx-auto">
      <ProjectForm />
    </div>
  );
}
