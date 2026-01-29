import { create } from "zustand";

export const useMauticStore = create((set) => ({
    smsCampaigns: [],
    smsStatsCache: {},   // { [smsId-page]: data }
    contactCache: {},    // { [contactId-smsId]: data }

    setSmsCampaigns: (data) => set({ smsCampaigns: data }),
    setSmsStats: (smsId, page, data) =>
        set((state) => ({
            smsStatsCache: {
                ...state.smsStatsCache,
                [`${smsId}-${page}`]: data,
            },
        })),
    setContactData: (contactId, smsId, data) =>
        set((state) => ({
            contactCache: {
                ...state.contactCache,
                [`${contactId}-${smsId || "all"}`]: data,
            },
        })),
}));
