export type OkHiAuth = {
  branchId: string
  clientKey: string
  env?: string
}

export type OkHiUser = {
  firstName: string
  lastName: string
  phone: string
  email: string
  okhiUserId?: string
  token?: string
  appUserId?: string
}

export type OkHiLoginConfiguration = {
  withPermissionsRequest?: boolean
}

export type OkHiLogin = {
  auth: OkHiAuth
  user: OkHiUser
  configuration?: OkHiLoginConfiguration
}

export type OkHiSuccessResponse = {
  user: string
  location: string
}

export type OkHiException = {
  code: string
  message: string
}

export type OkHiLocation = {
  id?: string | null
  lat?: number | null
  lng?: number | null
  placeId?: string | null
  plusCode?: string | null
  propertyName?: string | null
  streetName?: string | null
  title?: string | null
  subtitle?: string | null
  directions?: string | null
  otherInformation?: string | null
  url?: string | null
  streetViewPanoId?: string | null
  streetViewPanoUrl?: string | null
  userId?: string | null
  photoUrl?: string | null
  propertyNumber?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  displayTitle?: string | null
  countryCode?: string | null
  neighborhood?: string | null
  usageTypes?: string[] | null
  ward?: string | null
  formattedAddress?: string | null
  postCode?: string | null
  lga?: string | null
  lgaCode?: string | null
  unit?: string | null
  gpsAccuracy?: string | null
  businessName?: string | null
  type?: string | null
  district?: string | null
  addressLine?: string | null
  jsonResponse?: string | null
}

export type OkCollectStyle = {
  color: string | null
  name: string | null
  logo: string | null
}

export type OkCollectConfig = {
  streetView?: boolean | null
  withHomeAddressType?: boolean | null
  withWorkAddressType?: boolean | null
  withAppBar?: boolean | null
}

export type OkCollectLocationConfig = {
  id: string
}

export type OkCollect = {
  style?: OkCollectStyle
  configuration?: OkCollectConfig
  location?: OkCollectLocationConfig
}

export type NitroOkCollectStyle = {
  color: string
  name: string
  logo: string
}

export type NitroOkCollectConfig = {
  streetView: boolean
  withHomeAddressType: boolean
  withWorkAddressType: boolean
  withAppBar: boolean
}

export type NitroOkCollect = {
  style: NitroOkCollectStyle
  configuration: NitroOkCollectConfig
  location: OkCollectLocationConfig | null
}

export type OkHiVerificationType =
  | 'DIGITAL'
  | 'PHYSICAL'
  | 'DIGITALANDPHYSICAL'
  | 'ADDRESSBOOK' //TODO: rename to usage type
