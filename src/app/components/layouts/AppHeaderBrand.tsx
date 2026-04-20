import { Sparkles } from 'lucide-react';

export function AppHeaderBrand() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 ring-1 ring-blue-200">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-blue-600">
          МАОУ ОЦ2
        </p>
        <h1 className="truncate text-xl font-semibold text-gray-900">
          Банк одаренных детей
        </h1>
      </div>
    </div>
  )
}
