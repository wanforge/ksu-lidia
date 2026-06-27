/**
 * Toggle/switch berbasis checkbox (pure CSS, tanpa JS) — aman dipakai di form
 * GET native maupun form lain. Warna danger (rose) saat aktif.
 */
export default function SwitchField({
  name,
  value = "1",
  defaultChecked,
  label,
}: {
  name: string;
  value?: string;
  defaultChecked?: boolean;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2.5">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        className="relative h-5 w-9 shrink-0 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-rose-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-rose-300 peer-focus-visible:ring-offset-1"
        aria-hidden
      />
      <span className="text-sm font-medium text-gray-700 peer-checked:text-rose-700">
        {label}
      </span>
    </label>
  );
}
