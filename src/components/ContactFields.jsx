import FormField from './FormField.jsx';

export default function ContactFields({ card, set }) {
  return (
    <>
      <FormField label="Phone" value={card.phone} onChange={(v) => set({ phone: v })} placeholder="+91 98765 43210" />
      <FormField label="WhatsApp number" value={card.whatsapp} onChange={(v) => set({ whatsapp: v })} placeholder="+91 98765 43210" />
      <FormField label="WhatsApp opening message" value={card.whatsappMessage} onChange={(v) => set({ whatsappMessage: v })} />
      <FormField label="Email address" value={card.email} onChange={(v) => set({ email: v })} type="email" />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Email subject (optional)" value={card.emailSubject} onChange={(v) => set({ emailSubject: v })} />
        <FormField label="Email body (optional)" value={card.emailBody} onChange={(v) => set({ emailBody: v })} />
      </div>
      <FormField label="Website" value={card.website} onChange={(v) => set({ website: v })} placeholder="https://" />
      <FormField label="Physical address" value={card.address} onChange={(v) => set({ address: v })} textarea rows={2} />
      <FormField label="Google Maps link (optional)" value={card.mapsUrl} onChange={(v) => set({ mapsUrl: v })} placeholder="https://maps.google.com/..." />
    </>
  );
}
