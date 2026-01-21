export type OkHiAuth = {
  branchId: string;
  clientKey: string;
  env?: string;
};

export type OkHiUser = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  okhiUserId?: string;
  token?: string;
  appUserId?: string;
};

export type OkHiAppContext = {
  name: string;
  version: string;
  build: string;
};

export type OkHiLoginConfiguration = {
  withPermissionsRequest?: boolean;
};

export type OkHiLogin = {
  auth: OkHiAuth;
  user: OkHiUser;
  configuration?: OkHiLoginConfiguration;
  appContext?: OkHiAppContext;
};

export type OkCollectStyle = {
  color: string;
  logo: string;
};

export type OkCollectConfig = {
  streetView: boolean;
  withHomeAddressType: boolean;
  withWorkAddressType: boolean;
};

export type OkCollect = {
  style?: Partial<OkCollectStyle>;
  configuration?: Partial<OkCollectConfig>;
  locationId?: string;
};

export type OkHiLocation = {
  id?: string | null;
  lat?: number | null;
  lng?: number | null;
  placeId?: string | null;
  plusCode?: string | null;
  propertyName?: string | null;
  streetName?: string | null;
  title?: string | null;
  subtitle?: string | null;
  directions?: string | null;
  otherInformation?: string | null;
  url?: string | null;
  streetViewPanoId?: string | null;
  streetViewPanoUrl?: string | null;
  userId?: string | null;
  photoUrl?: string | null;
  propertyNumber?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  displayTitle?: string | null;
  countryCode?: string | null;
  neighborhood?: string | null;
  usageTypes?: string[] | null;
  ward?: string | null;
  formattedAddress?: string | null;
  postCode?: string | null;
};

export type OkHiException = {
  code: string;
  message: string;
};

export type OkHiSuccessResponse = {
  user: OkHiUser;
  location: OkHiLocation;
};
