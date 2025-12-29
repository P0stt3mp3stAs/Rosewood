// src/components/reservation/ContactForm.tsx
interface ContactFormProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
}

export function ContactForm({ name, setName, email, setEmail, phone, setPhone }: ContactFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full px-4 py-2 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
          placeholder="(000) 000-0000"
        />
      </div>
    </div>
  );
}