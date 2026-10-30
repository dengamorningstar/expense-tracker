import { create } from 'zustand';

export const useFormStore = create((set) => ({
  formTitle: 'Untitled Form',
  fields: [],

  // Actions
  setFormTitle: (title) => set({ formTitle: title }),
  
  addField: (type) =>
    set((state) => ({
      fields: [
        ...state.fields,
        {
          id: Date.now().toString(),
          type, // e.g., 'text', 'number', 'checkbox'
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
          required: false,
        },
      ],
    })),
    
  removeField: (id) =>
    set((state) => ({
      fields: state.fields.filter((field) => field.id !== id),
    })),
    
  resetForm: () => set({ formTitle: 'Untitled Form', fields: [] }),
}));