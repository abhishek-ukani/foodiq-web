import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { usePolicy } from '@/features/static-pages/hooks/use-content-queries'
import type { PolicySlug } from '@/types/database.types'
import dayjs from 'dayjs'
import { DATE_FORMAT } from '@/constants'
import { FileText } from 'lucide-react'

export function PolicyPage({ slug, fallbackTitle }: { slug: PolicySlug; fallbackTitle: string }) {
  const { data: policy, isPending } = usePolicy(slug)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : !policy ? (
        <EmptyState
          icon={FileText}
          title={fallbackTitle}
          description="This page hasn't been published yet — please check back soon."
        />
      ) : (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1 className="font-display text-4xl font-semibold">{policy.title}</h1>
          <p className="text-muted-foreground text-sm">
            Last updated {dayjs(policy.updated_at).format(DATE_FORMAT)}
          </p>
          <div className="mt-8 whitespace-pre-line">{policy.content}</div>
        </article>
      )}
    </div>
  )
}
