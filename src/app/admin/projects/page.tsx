import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/auth-guard';
import { ProjectTableActions } from '@/components/admin/ProjectTableActions';
import { pickLocalized } from '@/lib/i18n/localized';
import type { ProjectStatus } from '@/types/database.types';
import {
  Plus,
  FolderGit2,
  Star,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminProjectRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  thumbnail_url: string;
  tech_stack: string[];
  is_featured: boolean;
  status: ProjectStatus;
  display_order: number;
}

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();

  // Select only lightweight table columns (excludes heavy Markdown `content` & `gallery_urls`)
  const { data: projects } = await supabase
    .from('projects')
    .select(
      'id,title,slug,category,thumbnail_url,tech_stack,is_featured,status,display_order'
    )
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const projectList: AdminProjectRow[] = (projects as AdminProjectRow[] | null) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Projects
          </h1>
          <span className="rounded-full bg-[#181818] border border-white/[0.08] px-2.5 py-0.5 text-xs font-bold text-[#9E1B32]">
            {projectList.length}
          </span>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] hover:bg-[#B8233E] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Project</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212]">
        {projectList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-11 w-11 rounded-2xl bg-[#181818] border border-white/[0.08] flex items-center justify-center mb-3">
              <FolderGit2 className="h-5 w-5 text-[#9E1B32]" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Belum ada project
            </h3>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#9E1B32] px-4 py-2 text-xs font-bold text-white hover:bg-[#B8233E] transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Project</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.07] bg-[#161616] text-[10.5px] uppercase tracking-wider text-white/55 font-semibold">
                <tr>
                  <th scope="col" className="py-3.5 pl-5 pr-3">
                    Project
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Kategori
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    Featured
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    Urutan
                  </th>
                  <th scope="col" className="py-3.5 pl-3 pr-5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-white/80">
                {projectList.map((project) => {
                  const cleanTitle = pickLocalized(project.title, 'en');
                  const cleanCategory = pickLocalized(project.category, 'en');

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Thumbnail & Title */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181818]">
                            {project.thumbnail_url ? (
                              <Image
                                src={project.thumbnail_url}
                                alt={cleanTitle}
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized={
                                  project.thumbnail_url.startsWith('data:') ||
                                  project.thumbnail_url.endsWith('.svg')
                                }
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white/30">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <Link
                              href={`/admin/projects/${project.id}/edit`}
                              className="font-semibold text-white hover:text-[#9E1B32] transition-colors truncate block text-sm"
                            >
                              {cleanTitle}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-white/45 font-mono truncate">
                                /{project.slug}
                              </span>
                              {project.tech_stack &&
                                project.tech_stack.length > 0 && (
                                  <span className="text-[10px] text-[#9E1B32] bg-[#9E1B32]/10 border border-[#9E1B32]/20 px-2 py-0.5 rounded-full font-mono">
                                    {project.tech_stack.slice(0, 2).join(', ')}
                                    {project.tech_stack.length > 2
                                      ? ` +${project.tech_stack.length - 2}`
                                      : ''}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3.5 text-white/70">
                        <span className="inline-block rounded-full bg-[#181818] px-2.5 py-1 text-[11px] font-medium text-white/80 border border-white/[0.07]">
                          {cleanCategory}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="px-3 py-3.5 text-center">
                        {project.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-white/30 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold border ${
                            project.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-white/[0.05] text-white/50 border-white/[0.08]'
                          }`}
                        >
                          {project.status === 'published'
                            ? 'Published'
                            : 'Draft'}
                        </span>
                      </td>

                      {/* Order */}
                      <td className="px-3 py-3.5 text-center font-mono text-white/60">
                        {project.display_order}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <ProjectTableActions
                          id={project.id}
                          title={cleanTitle}
                          status={project.status}
                          isFeatured={project.is_featured}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
