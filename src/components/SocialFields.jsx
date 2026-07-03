import FormField from './FormField.jsx';

export default function SocialFields({ card, set }) {
  return (
    <>
      <FormField label="LinkedIn" value={card.linkedin} onChange={(v) => set({ linkedin: v })} placeholder="https://linkedin.com/in/..." />
      <FormField label="GitHub" value={card.github} onChange={(v) => set({ github: v })} placeholder="https://github.com/..." />
      <FormField label="Facebook" value={card.facebook} onChange={(v) => set({ facebook: v })} />
      <FormField label="Instagram" value={card.instagram} onChange={(v) => set({ instagram: v })} />
      <FormField label="X (Twitter)" value={card.twitter} onChange={(v) => set({ twitter: v })} />
      <FormField label="YouTube" value={card.youtube} onChange={(v) => set({ youtube: v })} />
      <FormField label="Telegram (@handle)" value={card.telegram} onChange={(v) => set({ telegram: v })} placeholder="@yourhandle" />
    </>
  );
}
