export default function ModCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-2/3 skeleton" />
        <div className="flex justify-between">
          <div className="h-6 w-16 skeleton" />
          <div className="h-4 w-12 skeleton" />
        </div>
      </div>
    </div>
  )
}
