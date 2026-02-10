export interface Platform {
  id: string;
  name: string;
  icon: string | null;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string | null;
  originalPrice: number;
  originalPriceText?: string | null;
  salePrice: number;
  salePriceText?: string | null;
  cpsLink: string;
  downloadUrl?: string | null;
  officialSite?: string | null;
  coverImage: string | null;
  images?: string[];
  logo: string | null;
  slug: string | null;
  platforms: Platform[];
}

export interface BannerSlide {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
}

export interface FriendLink {
  id: string;
  name: string;
  url: string;
  logo: string | null;
}

export interface SiteConfig {
  site_name: string;
  site_logo: string;
  footer_copyright: string;
  footer_description: string;
  contact_service_link?: string;
  product_sidebar_ad_image?: string;
  product_sidebar_ad_link?: string;
}
