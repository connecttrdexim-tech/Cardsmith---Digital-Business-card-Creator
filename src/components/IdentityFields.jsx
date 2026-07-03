import FormField from './FormField.jsx';
import ImageUploadField from './ImageUploadField.jsx';

export default function IdentityFields({ card, set }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <ImageUploadField label="Logo" value={card.logo} onChange={(v) => set({ logo: v })} />
        <ImageUploadField label="Profile picture" value={card.profilePicture} onChange={(v) => set({ profilePicture: v })} shape="circle" />
      </div>
      <FormField label="Company / business name" value={card.companyName} onChange={(v) => set({ companyName: v })} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Owner / representative" value={card.ownerName} onChange={(v) => set({ ownerName: v })} />
        <FormField label="Designation" value={card.designation} onChange={(v) => set({ designation: v })} />
      </div>
      <FormField label="Business description" value={card.description} onChange={(v) => set({ description: v })} textarea />
      <FormField label="Working hours" value={card.workingHours} onChange={(v) => set({ workingHours: v })} placeholder="Mon–Fri, 9am–6pm" />
    </>
  );
}
