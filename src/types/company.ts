export interface Company {
  id: string;
  name: string;
  website_urls: {
    main?: string;
    careers?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  industry?: string;
  location?: string[];
  email: {
    main?: string;
    careers?: string;
    support?: string;
  };
  phone?: string;
  photo_url?: string;
  founded_at?: number;
  size?: string;
}
