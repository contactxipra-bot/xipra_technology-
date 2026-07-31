export type TechnologyCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  technologies: { id: string; name: string }[];
};

export type Technology = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  categoryId: string;
  category: { id: string; name: string };
  order: number;
};
