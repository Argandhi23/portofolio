import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/auth-guard';
import { ProjectTableActions } from '@/components/admin/ProjectTableActions';
import type { Project } from '@/types/database.types';
import {
  Plus,
  FolderGit2,
  Star,
  Image as ImageIcon,
} from 'lucide-react';

export default async function AdminProjectsPage() {
  const { supabase } = await requireAdmin();

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const projectList: Project[] = projects ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Manajemen Projects Portofolio
            </h1>
            <span className="rounded-full bg-[#181818] border border-white/[0.08] px-2.5 py-0.5 text-xs font-bold text-[#FF5510]">
              {projectList.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Kelola studi kasus portofolio, thumbnail rasio 16:10, urutan tampilan, dan status publish.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="pill-btn inline-flex items-center gap-2 rounded-full bg-[#FF5510] hover:bg-[#FF6B2B] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#FF5510]/20 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Project Baru</span>
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#121212] shadow-2xl backdrop-blur-sm">
        {projectList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white/40 mb-3">
              <FolderGit2 className="h-6 w-6 text-[#FF5510]" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Belum Ada Project
            </h3>
            <p className="text-xs text-white/50 max-w-sm mt-1 mb-5">
              Mulai buat studi kasus portofolio pertama Anda untuk dipamerkan kepada klien.
            </p>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF5510] px-4 py-2 text-xs font-bold text-white hover:bg-[#FF6B2B] transition"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Project Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.07] bg-[#161616] text-[11px] uppercase tracking-wider text-white/60 font-semibold">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3">
                    Thumbnail &amp; Judul Proyek
                  </th>
                  <th scope="col" className="px-3 py-4">
                    Kategori
                  </th>
                  <th scope="col" className="px-3 py-4 text-center">
                    Featured
                  </th>
                  <th scope="col" className="px-3 py-4 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-4 text-center">
                    Urutan
                  </th>
                  <th scope="col" className="py-4 pl-3 pr-6 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80">
                {projectList.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-white/[0.02] transition group"
                  >
                    {/* Thumbnail & Title */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-12 w-19 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181818]">
                          {project.thumbnail_url ? (
                            <Image
                              src={project.thumbnail_url}
                              alt={project.title}
                              fill
                              className="object-cover"
                              sizes="76px"
                              unoptimized={project.thumbnail_url.startsWith('data:') || project.thumbnail_url.endsWith('.svg')}
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
                            className="font-semibold text-white hover:text-[#FF5510] transition truncate block text-sm"
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-white/50 font-mono truncate">
                              /{project.slug}
                            </span>
                            {project.tech_stack && project.tech_stack.length > 0 && (
                              <span className="text-[10px] text-[#FF5510] bg-[#FF5510]/10 border border-[#FF5510]/20 px-2 py-0.5 rounded-full font-mono">
                                {project.tech_stack.slice(0, 2).join(', ')}{project.tech_stack.length > 2 ? ` +${project.tech_stack.length - 2}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-4 text-white/70">
                      <span className="inline-block rounded-full bg-[#181818] px-3 py-1 text-[11px] font-semibold text-white/85 border border-white/[0.07]">
                        {project.category}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="px-3 py-4 text-center">
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
                    <td className="px-3 py-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold border ${
                          project.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/[0.05] text-white/50 border-white/[0.08]'
                        }`}
                      >
                        {project.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    {/* Order */}
                    <td className="px-3 py-4 text-center font-mono text-white/60">
                      {project.display_order}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-3 pr-6 text-right">
                      <ProjectTableActions
                        id={project.id}
                        title={project.title}
                        status={project.status}
                        isFeatured={project.is_featured}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
