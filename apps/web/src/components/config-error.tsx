/** Shown instead of a blank page when apps/web/.env is missing values. */
export const ConfigError = ({ missing }: { missing: string[] }) => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="max-w-lg rounded-2xl border border-red-500/30 bg-white p-6 text-left shadow-xl dark:bg-[#0f1829]">
      <h1 className="mb-2 text-lg font-semibold text-red-600 dark:text-red-400">
        Apply Radar isn't configured
      </h1>
      <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">
        Missing in <code>apps/web/.env</code>:
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm text-gray-800 dark:text-slate-200">
        {missing.map((name) => (
          <li key={name}>
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p className="text-sm text-gray-600 dark:text-slate-300">
        Copy <code>apps/web/.env.example</code> to <code>.env</code>, fill it in and
        restart <code>pnpm dev:web</code>.
      </p>
    </div>
  </div>
);
