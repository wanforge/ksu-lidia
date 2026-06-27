/**
 * CSS-only on/off switch backed by a native checkbox (peer + sr-only), so it
 * submits with plain FormData exactly like a checkbox. Use for boolean
 * active/inactive style toggles.
 */
export default function ToggleSwitch({
  name,
  defaultChecked,
  checked,
  onChange,
  form,
  label,
  disabled,
}: {
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  form?: string;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        name={name}
        form={form}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
      />
      <span className="relative h-5 w-9 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-red-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-red-400 peer-focus-visible:ring-offset-1" />
      {label ? (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      ) : null}
    </label>
  );
}
