import { create } from "zustand";

type SocialLinkProps = {
  id?: string;
  link: string;
  platform: string;
};

interface SocialLinksStoreState {
  socialLinks: SocialLinkProps[];

  setSocialLinks: (newLinks: SocialLinkProps[]) => void;

  sortSocialLinks: (
    puklaId: string,
    socialLinks: any,
    sortSocialLinksHandler: any,
  ) => void;

  addSocialLink: (
    puklaId: string,
    newLink: SocialLinkProps,
    addSocialLinkHandler: any,
  ) => void;

  deleteSocialLink: (
    puklaId: string,
    socialLinkId: string,
    deleteSocialLinkHandler: any,
  ) => Promise<void>;

  updateSocialLink: (
    puklaId: string,
    socialLinkId: string,
    newLink: SocialLinkProps,
    updateSocialLinkHandler: any,
  ) => void;
}

export const useSocialLinksStore = create<SocialLinksStoreState>()(
  (set, get) => ({
    socialLinks: [],
    setSocialLinks: (newLinks) => {
      set({ socialLinks: newLinks });
    },

    sortSocialLinks: async (puklaId, socialLinks, sortSocialLinksHandler) => {
      set((state) => ({ socialLinks }));
      await sortSocialLinksHandler(puklaId, socialLinks);
    },

    addSocialLink: async (puklaId, newLink, addSocialLinkHandler) => {
      let newSocialLinkId = await addSocialLinkHandler(
        puklaId,
        newLink.platform,
        newLink.link,
      );
      set((state) => ({
        socialLinks: [
          { id: newSocialLinkId, ...newLink },
          ...state.socialLinks,
        ],
      }));
    },

    updateSocialLink: async (
      puklaId,
      socialLinkId,
      newLink,
      updateSocialLinkHandler,
    ) => {
      await updateSocialLinkHandler(
        puklaId,
        socialLinkId,
        newLink.platform,
        newLink.link,
      );
      set((state) => ({
        socialLinks: state.socialLinks.map((link) =>
          link.id === socialLinkId ? { id: socialLinkId, ...newLink } : link,
        ),
      }));
    },

    deleteSocialLink: async (
      puklaId,
      socialLinkId,
      deleteSocialLinkHandler,
    ) => {
      await deleteSocialLinkHandler(socialLinkId, puklaId);
      set((state) => ({
        socialLinks: state.socialLinks.filter(
          (link) => link.id !== socialLinkId,
        ),
      }));
    },
  }),
);
