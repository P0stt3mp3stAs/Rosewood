// src/components/reservation/PasscodeInput.tsx
interface PasscodeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
}

export function PasscodeInput({ 
  value, 
  onChange, 
  label = "4-Digit Passcode",
  placeholder = "••••",
  helpText,
  required = true
}: PasscodeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '');
    if (newValue.length <= 4) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        required={required}
        className="w-full px-4 py-2 bg-[#CF8989] rounded-full text-center text-2xl tracking-widest font-black focus:ring-2 focus:ring-rose-500 outline-none"
        placeholder={placeholder}
      />
      {helpText && (
        <p className="text-[9px] text-gray-400 mt-1 ml-3 leading-tight">
          {helpText}
        </p>
      )}
    </div>
  );
}