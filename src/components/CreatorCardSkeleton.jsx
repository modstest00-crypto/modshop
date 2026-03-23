export default function CreatorCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-6">
      <div className="avatar-lg skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 skeleton" />
        <div className="h-4 w-24 skeleton" />
        <div className="h-3 w-40 skeleton" />
      </div>
    </div>
  )
}
