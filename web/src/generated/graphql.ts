export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  URL: { input: any; output: any; }
};

/** An Account represents the accounting of a banking relationship. */
export type Account = {
  __typename?: 'Account';
  /** The most recent Balance for the Account. */
  balance?: Maybe<Balance>;
  /** The primary Connection for this Account. */
  connection?: Maybe<Connection>;
  /** The ISO-4217 currency code of the Account */
  currencyCode?: Maybe<CurrencyCode>;
  /** The Account's list of Investment Holdings. */
  holdings?: Maybe<HoldingConnection>;
  /** The ID of the Account. */
  id: Scalars['ID']['output'];
  /** The Institution where the Account is held. */
  institution: Institution;
  /** Represents the classification of an Account. */
  kind?: Maybe<AccountKind>;
  /** A mostly unique identifier, typically the last 4 numbers of the Account. */
  mask?: Maybe<Scalars['String']['output']>;
  /**
   * Custom metadata about the Account, stored in a 'key-value' format.
   *
   * See the [Custom Metadata](https://quiltt.dev/api/custom-metadata) guide for more information and examples.
   *
   */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** The Name of the Account */
  name: Scalars['String']['output'];
  /** @deprecated Use `provider` */
  origin: ConnectionProvider;
  /** The Account's list of Account Owners. */
  owners?: Maybe<Array<AccountOwner>>;
  /** The original provider of the Account. */
  provider: ConnectionProvider;
  /**
   * The Remote Data associated with the Account.
   *
   * See the [Remote Data guide](https://quiltt.dev/api/remote-data) for more information.
   *
   */
  remoteData?: Maybe<AccountRemoteData>;
  /** The State of the Account */
  state: AccountState;
  /** The Account's list of Statements. */
  statements?: Maybe<StatementConnection>;
  /**
   * Represents the taxonomic hierarchy of an Account, as an array of Taxonomy Members.
   *
   * Level 1: The balance sheet category - ASSET or LIABILITY
   * Level 2: The high-level classification - DEPOSITORY, INVESTMENT, LOAN, or CREDIT
   * Level 3 and beyond: The specific classification of the Account - SPENDING, SAVINGS, etc.
   *
   */
  taxonomy: Array<AccountTaxonomyMember>;
  /** The date of the earliest known Transaction. */
  transactedFirstOn?: Maybe<Scalars['Date']['output']>;
  /** The date of the most recent known Transaction. */
  transactedLastOn?: Maybe<Scalars['Date']['output']>;
  /** A paginated list of Transactions. */
  transactions: TransactionConnection;
  /**
   * Represents the classification of an Account.
   * @deprecated Use `kind` or `taxonomy`
   */
  type: AccountType;
  /** Specifies whether the Account has been verified for money movement. */
  verified: Scalars['Boolean']['output'];
};


/** An Account represents the accounting of a banking relationship. */
export type AccountHoldingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** An Account represents the accounting of a banking relationship. */
export type AccountStatementsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<StatementFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<StatementSort>;
};


/** An Account represents the accounting of a banking relationship. */
export type AccountTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TransactionFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<TransactionSort>;
};

/** Options for filtering Accounts. */
export type AccountFilter = {
  /**
   * Filter accounts by the status of its Connection.
   *
   * Examples:
   * - `{ status: SYNCED }` to only return Connections that are successfully synced
   * - `{ status: ERROR_REPAIRABLE }` to only return Connections that need to be reconnected
   * - `{ status: [INITIALIZING SYNCING] }` to only return Connections that are in the process of syncing
   *
   */
  connection_status?: InputMaybe<Array<ConnectionStatus>>;
  /**
   * Exclude accounts by the status of its Connection.
   *
   * Examples:
   * - `{ status_not: DISCONNECTED }` to exclude disconnected Accounts.
   * - `{ status_not: [INITIALIZING SYNCING] }` to exclude Accounts that are syncing
   *
   */
  connection_status_not?: InputMaybe<Array<ConnectionStatus>>;
  /** The Account classifications to include, supplied as an array or a single value. */
  kind?: InputMaybe<Array<AccountKind>>;
  /** The Account classifications to exclude, supplied as an array or a single value. */
  kind_not?: InputMaybe<Array<AccountKind>>;
  /**
   * Filter by the contents of Account `metadata`.
   *
   * Examples:
   * - `{ metadata: { hidden: true } }` to only return Accounts marked as "hidden" in your metadata
   * - `{ metadata: { internal_id: "acnt_12345" } }` to only return Accounts that match your internal ID
   * - `{ metadata: null }` to only return Accounts without metadata
   *
   */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** The date of the earliest known Transaction. */
  transactedFirstOn?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than the date of the earliest known Transaction. */
  transactedFirstOn_gt?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than or equal to the date of the earliest known Transaction. */
  transactedFirstOn_gte?: InputMaybe<Scalars['Date']['input']>;
  /** Less than the date of the earliest known Transaction. */
  transactedFirstOn_lt?: InputMaybe<Scalars['Date']['input']>;
  /** Less than or equal to the date of the earliest known Transaction. */
  transactedFirstOn_lte?: InputMaybe<Scalars['Date']['input']>;
  /** The date of the most recent known Transaction. */
  transactedLastOn?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than the date of the most recent known Transaction. */
  transactedLastOn_gt?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than or equal to the date of the most recent known Transaction. */
  transactedLastOn_gte?: InputMaybe<Scalars['Date']['input']>;
  /** Less than the date of the most recent known Transaction. */
  transactedLastOn_lt?: InputMaybe<Scalars['Date']['input']>;
  /** Less than or equal to the date of the most recent known Transaction. */
  transactedLastOn_lte?: InputMaybe<Scalars['Date']['input']>;
  /** Filter by whether Accounts have been verified for money movement. */
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Represents the classification of an Account. */
export enum AccountKind {
  /** Credit cards, and Lines of Credit. */
  Credit = 'CREDIT',
  /** Checking, Savings and cash management. */
  Depository = 'DEPOSITORY',
  /** Brokerage, retirement and other investments. */
  Investment = 'INVESTMENT',
  /** Mortgage, student and installment loans. */
  Loan = 'LOAN'
}

/** Options for filtering Merchants. */
export type AccountMerchantFilter = {
  /** The date of the first Transaction. */
  transactedFirstOn?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than the date of the first Transaction. */
  transactedFirstOn_gt?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than or equal to the date of the first Transaction. */
  transactedFirstOn_gte?: InputMaybe<Scalars['Date']['input']>;
  /** Less than the date of the first Transaction. */
  transactedFirstOn_lt?: InputMaybe<Scalars['Date']['input']>;
  /** Less than or equal to the date of the first Transaction. */
  transactedFirstOn_lte?: InputMaybe<Scalars['Date']['input']>;
  /** The date of the most recent Transaction. */
  transactedLastOn?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than the date of the most recent Transaction. */
  transactedLastOn_gt?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than or equal to the date of the most recent Transaction. */
  transactedLastOn_gte?: InputMaybe<Scalars['Date']['input']>;
  /** Less than the date of the most recent Transaction. */
  transactedLastOn_lt?: InputMaybe<Scalars['Date']['input']>;
  /** Less than or equal to the date of the most recent Transaction. */
  transactedLastOn_lte?: InputMaybe<Scalars['Date']['input']>;
};

/** Autogenerated input type of AccountMerchantUpdate */
export type AccountMerchantUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the Merchant to be updated. */
  id: Scalars['ID']['input'];
  /** Customizable metadata. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
};

/** Autogenerated return type of AccountMerchantUpdate. */
export type AccountMerchantUpdatePayload = {
  __typename?: 'AccountMerchantUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The updated merchant. */
  record?: Maybe<Merchant>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Represents the registered details of an Account Owner. */
export type AccountOwner = {
  __typename?: 'AccountOwner';
  /** The registered addresses of the Account Owner. */
  addresses?: Maybe<Array<Address>>;
  /** The registered email addresses of the Account Owner. */
  emails?: Maybe<Array<Email>>;
  /** The ID of the Account Owner. */
  id: Scalars['ID']['output'];
  /** The registered legal names of the Account Owner. */
  names?: Maybe<Array<Name>>;
  /** The registered phone numbers of the Account Owner. */
  phones?: Maybe<Array<Phone>>;
  /** The remote data associated with an Account Owner. */
  remoteData?: Maybe<AccountOwnerRemoteData>;
};

/** Remote data associated with an Account Owner. */
export type AccountOwnerRemoteData = {
  __typename?: 'AccountOwnerRemoteData';
  /** The Finicity remote data associated with the Account Owner. */
  finicity?: Maybe<AccountOwnerRemoteDataFinicity>;
  /** The Mock remote data associated with the Account Owner. */
  mock?: Maybe<AccountOwnerRemoteDataMock>;
  /** The MX remote data associated with the Account Owner. */
  mx?: Maybe<AccountOwnerRemoteDataMx>;
  /** The Plaid remote data associated with the Account Owner. */
  plaid?: Maybe<AccountOwnerRemoteDataPlaid>;
};

/** Finicity Account Owner Remote Data */
export type AccountOwnerRemoteDataFinicity = {
  __typename?: 'AccountOwnerRemoteDataFinicity';
  /** Finicity Account Owner Remote Data */
  owner?: Maybe<AccountRemoteDataFinicityOwner>;
};

/** Mock Account Owner Remote Data */
export type AccountOwnerRemoteDataMock = {
  __typename?: 'AccountOwnerRemoteDataMock';
  /** Mock Account Owner Remote Data */
  owner?: Maybe<AccountRemoteDataMockOwner>;
};

/** MX Account Owner Remote Data */
export type AccountOwnerRemoteDataMx = {
  __typename?: 'AccountOwnerRemoteDataMx';
  /** MX Account Owner Remote Data */
  owner?: Maybe<AccountRemoteDataMxOwner>;
};

/** Plaid Account Owner Remote Data */
export type AccountOwnerRemoteDataPlaid = {
  __typename?: 'AccountOwnerRemoteDataPlaid';
  /** Plaid Account Owner Remote Data */
  owner?: Maybe<AccountRemoteDataPlaidOwner>;
};

/** Remote data associated with an Account. */
export type AccountRemoteData = {
  __typename?: 'AccountRemoteData';
  /** The Finicity remote data associated with the Account. */
  finicity?: Maybe<AccountRemoteDataFinicity>;
  /** The Mock remote data associated with the Account. */
  mock?: Maybe<AccountRemoteDataMock>;
  /** The MX remote data associated with the Account. */
  mx?: Maybe<AccountRemoteDataMx>;
  /** The Plaid remote data associated with the Account. */
  plaid?: Maybe<AccountRemoteDataPlaid>;
};

/** Account-level data from Finicity. */
export type AccountRemoteDataFinicity = {
  __typename?: 'AccountRemoteDataFinicity';
  /** The base Account data from Finicity. */
  account?: Maybe<AccountRemoteDataFinicityAccount>;
};

/** The Account data from Finicity. */
export type AccountRemoteDataFinicityAccount = {
  __typename?: 'AccountRemoteDataFinicityAccount';
  /** The record's Finicity ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFinicityCustomerAccount>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Owner data from Finicity. */
export type AccountRemoteDataFinicityOwner = {
  __typename?: 'AccountRemoteDataFinicityOwner';
  /** The record's Finicity ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFinicityAccountOwnerDetails>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Account-level data from Mock. */
export type AccountRemoteDataMock = {
  __typename?: 'AccountRemoteDataMock';
  /** The base Account data from Mock. */
  account?: Maybe<AccountRemoteDataMockAccount>;
};

/** The Account data from Mock. */
export type AccountRemoteDataMockAccount = {
  __typename?: 'AccountRemoteDataMockAccount';
  /** The record's Mock ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMockAccount>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Owner data from Mock. */
export type AccountRemoteDataMockOwner = {
  __typename?: 'AccountRemoteDataMockOwner';
  /** The record's Mock ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMockOwner>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Account-level data from MX. */
export type AccountRemoteDataMx = {
  __typename?: 'AccountRemoteDataMx';
  /** The base Account data from MX. */
  account?: Maybe<AccountRemoteDataMxAccount>;
};

/** The Account data from Mx. */
export type AccountRemoteDataMxAccount = {
  __typename?: 'AccountRemoteDataMxAccount';
  /** The record's Mx ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMxAccount>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Owner data from Mx. */
export type AccountRemoteDataMxOwner = {
  __typename?: 'AccountRemoteDataMxOwner';
  /** The record's Mx ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMxAccountOwner>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Account-level data from Plaid. */
export type AccountRemoteDataPlaid = {
  __typename?: 'AccountRemoteDataPlaid';
  /** The base Account data from Plaid. */
  account?: Maybe<AccountRemoteDataPlaidAccount>;
};

/** The Account data from Plaid. */
export type AccountRemoteDataPlaidAccount = {
  __typename?: 'AccountRemoteDataPlaidAccount';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidAccount>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Owner data from Plaid. */
export type AccountRemoteDataPlaidOwner = {
  __typename?: 'AccountRemoteDataPlaidOwner';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidOwner>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Options for sorting Accounts. */
export enum AccountSort {
  /** Least-recently used first, most-recently used last */
  LastTransactedOnAsc = 'LAST_TRANSACTED_ON_ASC',
  /** Most-recently used first, least-recently used last */
  LastTransactedOnDesc = 'LAST_TRANSACTED_ON_DESC'
}

/** Represents the current state of an Account. */
export enum AccountState {
  /** Terminated */
  Closed = 'CLOSED',
  /** Open */
  Open = 'OPEN'
}

/** Represents a member of the Account classification taxonomy */
export enum AccountTaxonomyMember {
  /** Level 1: A financial resource expected to provide future benefits. */
  Asset = 'ASSET',
  /** Level 3+: Auto Account */
  Auto = 'AUTO',
  /** Level 3+: Card Account */
  Card = 'CARD',
  /** Level 3+: Cash Management Account */
  CashManagement = 'CASH_MANAGEMENT',
  /** Level 3+: Certificate Of Deposit Account */
  CertificateOfDeposit = 'CERTIFICATE_OF_DEPOSIT',
  /** Level 2: Credit cards, and Lines of Credit. */
  Credit = 'CREDIT',
  /** Level 2: Checking, Savings and cash management. */
  Depository = 'DEPOSITORY',
  /** Level 3+: Electronic Benefit Transfer Account */
  ElectronicBenefitTransfer = 'ELECTRONIC_BENEFIT_TRANSFER',
  /** Level 3+: Health Savings Account */
  HealthSavingsAccount = 'HEALTH_SAVINGS_ACCOUNT',
  /** Level 3+: Home Equity Account */
  HomeEquity = 'HOME_EQUITY',
  /** Level 2: Brokerage, retirement and other investments. */
  Investment = 'INVESTMENT',
  /** Level 1: A financial obligation or debt owed to another party. */
  Liability = 'LIABILITY',
  /** Level 3+: Line Of Credit Account */
  LineOfCredit = 'LINE_OF_CREDIT',
  /** Level 2: Mortgage, student and installment loans. */
  Loan = 'LOAN',
  /** Level 3+: Money Market Account */
  MoneyMarket = 'MONEY_MARKET',
  /** Level 3+: Mortgage Account */
  Mortgage = 'MORTGAGE',
  /** Level 3+: Prepaid Account */
  Prepaid = 'PREPAID',
  /** Level 3+: Retirement Account */
  Retirement = 'RETIREMENT',
  /** Level 3+: Savings Account */
  Savings = 'SAVINGS',
  /** Level 3+: Spending Account */
  Spending = 'SPENDING',
  /** Level 3+: Student Account */
  Student = 'STUDENT',
  /** Level 1: The balance sheet classification is unknown. */
  Unknown = 'UNKNOWN'
}

/** Represents the classification of an Account. */
export enum AccountType {
  /** Checking and cash management. */
  Checking = 'CHECKING',
  /** Credit cards. */
  Credit = 'CREDIT',
  /** Brokerage, retirement and other investments. */
  Investment = 'INVESTMENT',
  /** Lines of credit, mortgage, student and installment loans. */
  Loan = 'LOAN',
  /** All other Account types. */
  Other = 'OTHER',
  /** Savings and money market. */
  Savings = 'SAVINGS'
}

/** Autogenerated input type of AccountUpdate */
export type AccountUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the Account to be updated. */
  id: Scalars['ID']['input'];
  /** Customizable metadata. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
};

/** Autogenerated return type of AccountUpdate. */
export type AccountUpdatePayload = {
  __typename?: 'AccountUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The updated Account. */
  record?: Maybe<Account>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated return type of AccountVerified. */
export type AccountVerifiedPayload = {
  __typename?: 'AccountVerifiedPayload';
  /** The verified Account */
  account?: Maybe<Account>;
};

/** The legal address associated with the Profile. */
export type Address = {
  __typename?: 'Address';
  /** The city. */
  city?: Maybe<Scalars['String']['output']>;
  /** The short name of the country. */
  country?: Maybe<Scalars['String']['output']>;
  /** ISO 3166-1 alpha-3 country code. */
  countryCode?: Maybe<AddressCountryCode>;
  /** The first line of the address. */
  line1?: Maybe<Scalars['String']['output']>;
  /** The second line of the address. */
  line2?: Maybe<Scalars['String']['output']>;
  /** The third line of the address. */
  line3?: Maybe<Scalars['String']['output']>;
  /** The postal code or zip code. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** The state or province. */
  region?: Maybe<Scalars['String']['output']>;
  /** The two letter state or province code if available */
  regionCode?: Maybe<Scalars['String']['output']>;
};

/** ISO 3166-1 alpha-3 country code. */
export enum AddressCountryCode {
  /** Aruba */
  Abw = 'ABW',
  /** Afghanistan */
  Afg = 'AFG',
  /** Angola */
  Ago = 'AGO',
  /** Anguilla */
  Aia = 'AIA',
  /** Åland Islands */
  Ala = 'ALA',
  /** Albania */
  Alb = 'ALB',
  /** Andorra */
  And = 'AND',
  /** United Arab Emirates */
  Are = 'ARE',
  /** Argentina */
  Arg = 'ARG',
  /** Armenia */
  Arm = 'ARM',
  /** American Samoa */
  Asm = 'ASM',
  /** Antarctica */
  Ata = 'ATA',
  /** French Southern Territories */
  Atf = 'ATF',
  /** Antigua and Barbuda */
  Atg = 'ATG',
  /** Australia */
  Aus = 'AUS',
  /** Austria */
  Aut = 'AUT',
  /** Azerbaijan */
  Aze = 'AZE',
  /** Burundi */
  Bdi = 'BDI',
  /** Belgium */
  Bel = 'BEL',
  /** Benin */
  Ben = 'BEN',
  /** Bonaire, Sint Eustatius and Saba */
  Bes = 'BES',
  /** Burkina Faso */
  Bfa = 'BFA',
  /** Bangladesh */
  Bgd = 'BGD',
  /** Bulgaria */
  Bgr = 'BGR',
  /** Bahrain */
  Bhr = 'BHR',
  /** Bahamas */
  Bhs = 'BHS',
  /** Bosnia and Herzegovina */
  Bih = 'BIH',
  /** Saint Barthélemy */
  Blm = 'BLM',
  /** Belarus */
  Blr = 'BLR',
  /** Belize */
  Blz = 'BLZ',
  /** Bermuda */
  Bmu = 'BMU',
  /** Bolivia (Plurinational State of) */
  Bol = 'BOL',
  /** Brazil */
  Bra = 'BRA',
  /** Barbados */
  Brb = 'BRB',
  /** Brunei Darussalam */
  Brn = 'BRN',
  /** Bhutan */
  Btn = 'BTN',
  /** Bouvet Island */
  Bvt = 'BVT',
  /** Botswana */
  Bwa = 'BWA',
  /** Central African Republic */
  Caf = 'CAF',
  /** Canada */
  Can = 'CAN',
  /** Cocos (Keeling) Islands */
  Cck = 'CCK',
  /** Switzerland */
  Che = 'CHE',
  /** Chile */
  Chl = 'CHL',
  /** China */
  Chn = 'CHN',
  /** Côte d'Ivoire */
  Civ = 'CIV',
  /** Cameroon */
  Cmr = 'CMR',
  /** Congo (Democratic Republic of the) */
  Cod = 'COD',
  /** Congo */
  Cog = 'COG',
  /** Cook Islands */
  Cok = 'COK',
  /** Colombia */
  Col = 'COL',
  /** Comoros */
  Com = 'COM',
  /** Cabo Verde */
  Cpv = 'CPV',
  /** Costa Rica */
  Cri = 'CRI',
  /** Cuba */
  Cub = 'CUB',
  /** Curaçao */
  Cuw = 'CUW',
  /** Christmas Island */
  Cxr = 'CXR',
  /** Cayman Islands */
  Cym = 'CYM',
  /** Cyprus */
  Cyp = 'CYP',
  /** Czechia */
  Cze = 'CZE',
  /** Germany */
  Deu = 'DEU',
  /** Djibouti */
  Dji = 'DJI',
  /** Dominica */
  Dma = 'DMA',
  /** Denmark */
  Dnk = 'DNK',
  /** Dominican Republic */
  Dom = 'DOM',
  /** Algeria */
  Dza = 'DZA',
  /** Ecuador */
  Ecu = 'ECU',
  /** Egypt */
  Egy = 'EGY',
  /** Eritrea */
  Eri = 'ERI',
  /** Western Sahara */
  Esh = 'ESH',
  /** Spain */
  Esp = 'ESP',
  /** Estonia */
  Est = 'EST',
  /** Ethiopia */
  Eth = 'ETH',
  /** Finland */
  Fin = 'FIN',
  /** Fiji */
  Fji = 'FJI',
  /** Falkland Islands (Malvinas) */
  Flk = 'FLK',
  /** France */
  Fra = 'FRA',
  /** Faroe Islands */
  Fro = 'FRO',
  /** Micronesia (Federated States of) */
  Fsm = 'FSM',
  /** Gabon */
  Gab = 'GAB',
  /** United Kingdom of Great Britain and Northern Ireland */
  Gbr = 'GBR',
  /** Georgia */
  Geo = 'GEO',
  /** Guernsey */
  Ggy = 'GGY',
  /** Ghana */
  Gha = 'GHA',
  /** Gibraltar */
  Gib = 'GIB',
  /** Guinea */
  Gin = 'GIN',
  /** Guadeloupe */
  Glp = 'GLP',
  /** Gambia */
  Gmb = 'GMB',
  /** Guinea-Bissau */
  Gnb = 'GNB',
  /** Equatorial Guinea */
  Gnq = 'GNQ',
  /** Greece */
  Grc = 'GRC',
  /** Grenada */
  Grd = 'GRD',
  /** Greenland */
  Grl = 'GRL',
  /** Guatemala */
  Gtm = 'GTM',
  /** French Guiana */
  Guf = 'GUF',
  /** Guam */
  Gum = 'GUM',
  /** Guyana */
  Guy = 'GUY',
  /** Hong Kong */
  Hkg = 'HKG',
  /** Heard Island and McDonald Islands */
  Hmd = 'HMD',
  /** Honduras */
  Hnd = 'HND',
  /** Croatia */
  Hrv = 'HRV',
  /** Haiti */
  Hti = 'HTI',
  /** Hungary */
  Hun = 'HUN',
  /** Indonesia */
  Idn = 'IDN',
  /** Isle of Man */
  Imn = 'IMN',
  /** India */
  Ind = 'IND',
  /** British Indian Ocean Territory */
  Iot = 'IOT',
  /** Ireland */
  Irl = 'IRL',
  /** Iran (Islamic Republic of) */
  Irn = 'IRN',
  /** Iraq */
  Irq = 'IRQ',
  /** Iceland */
  Isl = 'ISL',
  /** Israel */
  Isr = 'ISR',
  /** Italy */
  Ita = 'ITA',
  /** Jamaica */
  Jam = 'JAM',
  /** Jersey */
  Jey = 'JEY',
  /** Jordan */
  Jor = 'JOR',
  /** Japan */
  Jpn = 'JPN',
  /** Kazakhstan */
  Kaz = 'KAZ',
  /** Kenya */
  Ken = 'KEN',
  /** Kyrgyzstan */
  Kgz = 'KGZ',
  /** Cambodia */
  Khm = 'KHM',
  /** Kiribati */
  Kir = 'KIR',
  /** Saint Kitts and Nevis */
  Kna = 'KNA',
  /** Korea (Republic of) */
  Kor = 'KOR',
  /** Kuwait */
  Kwt = 'KWT',
  /** Lao People's Democratic Republic */
  Lao = 'LAO',
  /** Lebanon */
  Lbn = 'LBN',
  /** Liberia */
  Lbr = 'LBR',
  /** Libya */
  Lby = 'LBY',
  /** Saint Lucia */
  Lca = 'LCA',
  /** Liechtenstein */
  Lie = 'LIE',
  /** Sri Lanka */
  Lka = 'LKA',
  /** Lesotho */
  Lso = 'LSO',
  /** Lithuania */
  Ltu = 'LTU',
  /** Luxembourg */
  Lux = 'LUX',
  /** Latvia */
  Lva = 'LVA',
  /** Macao */
  Mac = 'MAC',
  /** Saint Martin (French part) */
  Maf = 'MAF',
  /** Morocco */
  Mar = 'MAR',
  /** Monaco */
  Mco = 'MCO',
  /** Moldova (Republic of) */
  Mda = 'MDA',
  /** Madagascar */
  Mdg = 'MDG',
  /** Maldives */
  Mdv = 'MDV',
  /** Mexico */
  Mex = 'MEX',
  /** Marshall Islands */
  Mhl = 'MHL',
  /** North Macedonia */
  Mkd = 'MKD',
  /** Mali */
  Mli = 'MLI',
  /** Malta */
  Mlt = 'MLT',
  /** Myanmar */
  Mmr = 'MMR',
  /** Montenegro */
  Mne = 'MNE',
  /** Mongolia */
  Mng = 'MNG',
  /** Northern Mariana Islands */
  Mnp = 'MNP',
  /** Mozambique */
  Moz = 'MOZ',
  /** Mauritania */
  Mrt = 'MRT',
  /** Montserrat */
  Msr = 'MSR',
  /** Martinique */
  Mtq = 'MTQ',
  /** Mauritius */
  Mus = 'MUS',
  /** Malawi */
  Mwi = 'MWI',
  /** Malaysia */
  Mys = 'MYS',
  /** Mayotte */
  Myt = 'MYT',
  /** Namibia */
  Nam = 'NAM',
  /** New Caledonia */
  Ncl = 'NCL',
  /** Niger */
  Ner = 'NER',
  /** Norfolk Island */
  Nfk = 'NFK',
  /** Nigeria */
  Nga = 'NGA',
  /** Nicaragua */
  Nic = 'NIC',
  /** Niue */
  Niu = 'NIU',
  /** Netherlands */
  Nld = 'NLD',
  /** Norway */
  Nor = 'NOR',
  /** Nepal */
  Npl = 'NPL',
  /** Nauru */
  Nru = 'NRU',
  /** New Zealand */
  Nzl = 'NZL',
  /** Oman */
  Omn = 'OMN',
  /** Pakistan */
  Pak = 'PAK',
  /** Panama */
  Pan = 'PAN',
  /** Pitcairn */
  Pcn = 'PCN',
  /** Peru */
  Per = 'PER',
  /** Philippines */
  Phl = 'PHL',
  /** Palau */
  Plw = 'PLW',
  /** Papua New Guinea */
  Png = 'PNG',
  /** Poland */
  Pol = 'POL',
  /** Puerto Rico */
  Pri = 'PRI',
  /** Korea (Democratic People's Republic of) */
  Prk = 'PRK',
  /** Portugal */
  Prt = 'PRT',
  /** Paraguay */
  Pry = 'PRY',
  /** Palestine, State of */
  Pse = 'PSE',
  /** French Polynesia */
  Pyf = 'PYF',
  /** Qatar */
  Qat = 'QAT',
  /** Réunion */
  Reu = 'REU',
  /** Romania */
  Rou = 'ROU',
  /** Russian Federation */
  Rus = 'RUS',
  /** Rwanda */
  Rwa = 'RWA',
  /** Saudi Arabia */
  Sau = 'SAU',
  /** Sudan */
  Sdn = 'SDN',
  /** Senegal */
  Sen = 'SEN',
  /** Singapore */
  Sgp = 'SGP',
  /** South Georgia and the South Sandwich Islands */
  Sgs = 'SGS',
  /** Saint Helena, Ascension and Tristan da Cunha */
  Shn = 'SHN',
  /** Svalbard and Jan Mayen */
  Sjm = 'SJM',
  /** Solomon Islands */
  Slb = 'SLB',
  /** Sierra Leone */
  Sle = 'SLE',
  /** El Salvador */
  Slv = 'SLV',
  /** San Marino */
  Smr = 'SMR',
  /** Somalia */
  Som = 'SOM',
  /** Saint Pierre and Miquelon */
  Spm = 'SPM',
  /** Serbia */
  Srb = 'SRB',
  /** South Sudan */
  Ssd = 'SSD',
  /** Sao Tome and Principe */
  Stp = 'STP',
  /** Suriname */
  Sur = 'SUR',
  /** Slovakia */
  Svk = 'SVK',
  /** Slovenia */
  Svn = 'SVN',
  /** Sweden */
  Swe = 'SWE',
  /** Eswatini */
  Swz = 'SWZ',
  /** Sint Maarten (Dutch part) */
  Sxm = 'SXM',
  /** Seychelles */
  Syc = 'SYC',
  /** Syrian Arab Republic */
  Syr = 'SYR',
  /** Turks and Caicos Islands */
  Tca = 'TCA',
  /** Chad */
  Tcd = 'TCD',
  /** Togo */
  Tgo = 'TGO',
  /** Thailand */
  Tha = 'THA',
  /** Tajikistan */
  Tjk = 'TJK',
  /** Tokelau */
  Tkl = 'TKL',
  /** Turkmenistan */
  Tkm = 'TKM',
  /** Timor-Leste */
  Tls = 'TLS',
  /** Tonga */
  Ton = 'TON',
  /** Trinidad and Tobago */
  Tto = 'TTO',
  /** Tunisia */
  Tun = 'TUN',
  /** Türkiye */
  Tur = 'TUR',
  /** Tuvalu */
  Tuv = 'TUV',
  /** Taiwan, Province of China */
  Twn = 'TWN',
  /** Tanzania, United Republic of */
  Tza = 'TZA',
  /** Uganda */
  Uga = 'UGA',
  /** Ukraine */
  Ukr = 'UKR',
  /** United States Minor Outlying Islands */
  Umi = 'UMI',
  /** Uruguay */
  Ury = 'URY',
  /** United States of America */
  Usa = 'USA',
  /** Uzbekistan */
  Uzb = 'UZB',
  /** Holy See */
  Vat = 'VAT',
  /** Saint Vincent and the Grenadines */
  Vct = 'VCT',
  /** Venezuela (Bolivarian Republic of) */
  Ven = 'VEN',
  /** Virgin Islands (British) */
  Vgb = 'VGB',
  /** Virgin Islands (U.S.) */
  Vir = 'VIR',
  /** Viet Nam */
  Vnm = 'VNM',
  /** Vanuatu */
  Vut = 'VUT',
  /** Wallis and Futuna */
  Wlf = 'WLF',
  /** Samoa */
  Wsm = 'WSM',
  /** Yemen */
  Yem = 'YEM',
  /** South Africa */
  Zaf = 'ZAF',
  /** Zambia */
  Zmb = 'ZMB',
  /** Zimbabwe */
  Zwe = 'ZWE'
}

/** Represents an Account Balance. */
export type Balance = {
  __typename?: 'Balance';
  /** The timestamp of the Account Balance record. */
  at: Scalars['DateTime']['output'];
  /** The amount of funds accounting for pending Transactions. */
  available?: Maybe<Scalars['Float']['output']>;
  /** The amount of funds based on posted Transactions. */
  current?: Maybe<Scalars['Float']['output']>;
  /** The ID of the Balance. */
  id: Scalars['ID']['output'];
  /** The amount of funds that may be overdraft or spent on credit. */
  limit?: Maybe<Scalars['Float']['output']>;
  /** The source of the Balance data. */
  source: BalanceSource;
};

/** Represents the source of the Balance data. */
export enum BalanceSource {
  /** Initial value from the provider. */
  Initial = 'INITIAL',
  /** Provider response from a triggered **Refresh Balance** call. */
  Refresh = 'REFRESH',
  /** Regular sync with the provider. */
  Sync = 'SYNC'
}

/**
 * A Connection represents the data source for a Profile's accounts and transactions, such as a Plaid **Item** or MX **member**.
 *
 * The easiest way to register connections is with the Quiltt Connector, which handles the configuration for Plaid Link and MX Connect.
 *
 */
export type Connection = {
  __typename?: 'Connection';
  /** A list of Accounts. */
  accounts: Array<Account>;
  /**
   * Specifies whether this Connection is managed by an external system.
   *
   * When a Connection is imported as externally-managed, Quiltt will sync it,
   * but disconnecting it will not revoke access from the upstream provider.
   *
   */
  externallyManaged: Scalars['Boolean']['output'];
  /** The features currently enabled on the Connection. */
  features: Array<ConnectionFeature>;
  /** The ID of the Connection. */
  id: Scalars['ID']['output'];
  /** The Institution of the Connection. */
  institution: Institution;
  /**
   * Custom metadata about the Connection, stored in a 'key-value' format.
   *
   * See the [Custom Metadata](https://quiltt.dev/api/custom-metadata) guide for more information and examples.
   *
   */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Whether the Connection is currently established via OAuth. */
  oauth?: Maybe<Scalars['Boolean']['output']>;
  /** Represents the data provider for the Connection. */
  provider: ConnectionProvider;
  /**
   * The Remote Data associated with the Connection.
   *
   * See the [Remote Data guide](https://quiltt.dev/api/remote-data) for more information.
   *
   */
  remoteData?: Maybe<ConnectionRemoteData>;
  /** Represents the status of a Connection. */
  status: ConnectionStatus;
};


/**
 * A Connection represents the data source for a Profile's accounts and transactions, such as a Plaid **Item** or MX **member**.
 *
 * The easiest way to register connections is with the Quiltt Connector, which handles the configuration for Plaid Link and MX Connect.
 *
 */
export type ConnectionAccountsArgs = {
  filter?: InputMaybe<AccountFilter>;
  sort?: InputMaybe<AccountSort>;
};

/** Autogenerated return type of ConnectionCreated. */
export type ConnectionCreatedPayload = {
  __typename?: 'ConnectionCreatedPayload';
  /** The newly created Connection. */
  connection?: Maybe<Connection>;
};

/** Autogenerated input type of ConnectionDisconnect */
export type ConnectionDisconnectInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the Connection to be disconnected. */
  id: Scalars['ID']['input'];
};

/** Autogenerated return type of ConnectionDisconnect. */
export type ConnectionDisconnectPayload = {
  __typename?: 'ConnectionDisconnectPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The Connection to be disconnected. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/**
 * Represents a feature of a Connection.
 *
 */
export enum ConnectionFeature {
  /**
   * Access to Account Balances and Transaction with up to 24 months of history, depending on the provider.
   *
   * Note that MX typically provides 3-4 months of history and accessing 24 months
   * of history is a "premium" feature that incurs a one-time per-Connection fee.
   * You can configure whether Quiltt should attempt to sync full history on the MX
   * Integration page in the Dashboard
   *
   */
  AccountBalancesAndTransactions = 'ACCOUNT_BALANCES_AND_TRANSACTIONS',
  /**
   * The ability to trigger live refreshes of account balances.
   *
   */
  AccountBalanceRefreshes = 'ACCOUNT_BALANCE_REFRESHES',
  /**
   * Access to verified account numbers to support money movement operations.
   *
   * When this feature is provisioned, eligible accounts will be enabled for the
   * [Account Numbers](https://www.quiltt.dev/api-reference/platform#tag/Account-Numbers)
   * and [Processor Tokens](https://www.quiltt.dev/api-reference/platform#tag/Processor-Tokens)
   * endpoints.
   *
   */
  AccountNumbers = 'ACCOUNT_NUMBERS',
  /**
   * Access to account-holder information to validate identity and account ownership.
   *
   * When this feature is provisioned, account-holder information will become available
   * via [Remote Data](https://www.quiltt.dev/api/remote-data).
   *
   */
  AccountOwners = 'ACCOUNT_OWNERS',
  /**
   * Access to historical account statements in PDF format.
   *
   */
  AccountStatements = 'ACCOUNT_STATEMENTS',
  /**
   * Access to account investments holdings and transactions.
   *
   * Note that for some providers like MX, this feature may be provisioned automatically.
   *
   */
  Investments = 'INVESTMENTS',
  /**
   * Access to detailed account liabilities data.
   *
   * Note that for some providers like MX, this feature may be provisioned automatically.
   *
   */
  Liabilities = 'LIABILITIES'
}

/** Options for filtering Connections. */
export type ConnectionFilter = {
  /**
   * Filter by the contents of Connection `metadata`.
   *
   * Examples:
   * - `{ metadata: { hidden: true } }` to only return Connections marked as "hidden" in your metadata
   * - `{ metadata: { internal_id: "cxn_12345" } }` to only return Connections that match your internal ID
   * - `{ metadata: null }` to only return Connections without metadata
   *
   */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Filter Connections by provider. */
  provider?: InputMaybe<Array<ConnectionProvider>>;
  /**
   * Filter Connections by one or more statuses.
   *
   * Examples:
   * - `{ status: SYNCED }` to only return Connections that are successfully synced
   * - `{ status: ERROR_REPAIRABLE }` to only return Connections that need to be reconnected
   * - `{ status: [INITIALIZING SYNCING] }` to only return Connections that are in the process of syncing
   *
   */
  status?: InputMaybe<Array<ConnectionStatus>>;
  /**
   * Filter out Connections by one or more statuses.
   *
   * Examples:
   * - `{ status_not: DISCONNECTED }` to exclude connections that have been disconnected
   * - `{ status_not: [INITIALIZING SYNCING] }` to exclude Connections that are syncing
   *
   */
  status_not?: InputMaybe<Array<ConnectionStatus>>;
};

/** Represents the data provider for the Connection. */
export enum ConnectionProvider {
  /** Disconnected */
  Disconnected = 'DISCONNECTED',
  /** Finicity */
  Finicity = 'FINICITY',
  /** Mock data */
  Mock = 'MOCK',
  /** MX */
  Mx = 'MX',
  /** Plaid */
  Plaid = 'PLAID'
}

/** Remote data associated with a Connection. */
export type ConnectionRemoteData = {
  __typename?: 'ConnectionRemoteData';
  /** The Finicity remote data associated with the Connection. */
  finicity?: Maybe<ConnectionRemoteDataFinicity>;
  /** The Mock remote data associated with the Connection. */
  mock?: Maybe<ConnectionRemoteDataMock>;
  /** The MX remote data associated with the Connection. */
  mx?: Maybe<ConnectionRemoteDataMx>;
  /** The Plaid remote data associated with the Connection. */
  plaid?: Maybe<ConnectionRemoteDataPlaid>;
};

/** Connection-level data from Finicity. */
export type ConnectionRemoteDataFinicity = {
  __typename?: 'ConnectionRemoteDataFinicity';
  /** The Connection data from Finicity. */
  connection?: Maybe<ConnectionRemoteDataFinicityConnection>;
};

/** The Connection data from Finicity. */
export type ConnectionRemoteDataFinicityConnection = {
  __typename?: 'ConnectionRemoteDataFinicityConnection';
  /** The record's Finicity ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFinicityConnectionDetails>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Connection-level data from Mock. */
export type ConnectionRemoteDataMock = {
  __typename?: 'ConnectionRemoteDataMock';
  /** The Connection data from Mock. */
  connection?: Maybe<ConnectionRemoteDataMockConnection>;
};

/** The Connection data from Mock. */
export type ConnectionRemoteDataMockConnection = {
  __typename?: 'ConnectionRemoteDataMockConnection';
  /** The record's Mock ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMockConnection>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Connection-level data from MX. */
export type ConnectionRemoteDataMx = {
  __typename?: 'ConnectionRemoteDataMx';
  /**
   * The Account Owners data from MX.
   * @deprecated Use the Account `owners` field instead.
   */
  accountOwners?: Maybe<ConnectionRemoteDataMxAccountOwners>;
  /** The base Connection data from MX. */
  connection?: Maybe<ConnectionRemoteDataMxConnection>;
};

/** The Account Owners data from Mx. */
export type ConnectionRemoteDataMxAccountOwners = {
  __typename?: 'ConnectionRemoteDataMxAccountOwners';
  /** The response body. */
  response?: Maybe<Array<RemoteDataMxAccountOwner>>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Connection data from Mx. */
export type ConnectionRemoteDataMxConnection = {
  __typename?: 'ConnectionRemoteDataMxConnection';
  /** The record's Mx ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMxMember>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Connection-level data from Plaid. */
export type ConnectionRemoteDataPlaid = {
  __typename?: 'ConnectionRemoteDataPlaid';
  /**
   * The Account Owners data from Plaid.
   * @deprecated Use the Account `owners` field instead.
   */
  accountOwners?: Maybe<ConnectionRemoteDataPlaidAccountOwners>;
  /** The base Connection data from Plaid. */
  connection?: Maybe<ConnectionRemoteDataPlaidConnection>;
  /** The Liabilities data from Plaid. */
  liabilities?: Maybe<ConnectionRemoteDataPlaidLiabilities>;
};

/** The Account Owners data from Plaid. */
export type ConnectionRemoteDataPlaidAccountOwners = {
  __typename?: 'ConnectionRemoteDataPlaidAccountOwners';
  /** The response body. */
  response?: Maybe<Array<RemoteDataPlaidAccountIdentity>>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Connection data from Plaid. */
export type ConnectionRemoteDataPlaidConnection = {
  __typename?: 'ConnectionRemoteDataPlaidConnection';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidItem>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Liabilities data from Plaid. */
export type ConnectionRemoteDataPlaidLiabilities = {
  __typename?: 'ConnectionRemoteDataPlaidLiabilities';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidLiabilitiesObject>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Autogenerated input type of ConnectionSimulateError */
export type ConnectionSimulateErrorInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the Connection to be put in a repairable state. */
  id: Scalars['ID']['input'];
};

/** Autogenerated return type of ConnectionSimulateError. */
export type ConnectionSimulateErrorPayload = {
  __typename?: 'ConnectionSimulateErrorPayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The Connection put in a repairable state. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Represents the status of a Connection. */
export enum ConnectionStatus {
  /** The Connection has been fully disconnected from all providers and no new data will be synced. */
  Disconnected = 'DISCONNECTED',
  /** The Connection is in the process of being disconnected from its provider. */
  Disconnecting = 'DISCONNECTING',
  /** The Connection provider is reporting an error with the Institution. */
  ErrorInstitution = 'ERROR_INSTITUTION',
  /**
   * The Connection provider is reporting an error with the Connection.
   * Inspect the Connection's [Remote Data](https://quiltt.dev/api/remote-data) for more information.
   */
  ErrorProvider = 'ERROR_PROVIDER',
  /**
   * The Connection must be re-authenticated to resume syncing.
   * Have the user complete the Connector [Reconnect flow](https://quiltt.dev/connector/reconnect) to resolve this error.
   */
  ErrorRepairable = 'ERROR_REPAIRABLE',
  /**
   * Quiltt is experiencing an unexpected error attempting to sync this Connection.
   * Visit our [Status page](https://status.quiltt.io) or contact Quiltt Support for more information.
   */
  ErrorService = 'ERROR_SERVICE',
  /** The Connection is being initialized and will begin syncing soon. */
  Initializing = 'INITIALIZING',
  /** The Connection is synced and up to date with the provider. */
  Synced = 'SYNCED',
  /** The Connection is currently syncing with the provider. */
  Syncing = 'SYNCING',
  /** The Connection is attempting to add new features. */
  Upgrading = 'UPGRADING'
}

/** Autogenerated return type of ConnectionSynced. */
export type ConnectionSyncedPayload = {
  __typename?: 'ConnectionSyncedPayload';
  /** The synced Connection */
  connection?: Maybe<Connection>;
};

/** Autogenerated input type of ConnectionUpdate */
export type ConnectionUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the Connection to be updated. */
  id: Scalars['ID']['input'];
  /** Customizable metadata. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
};

/** Autogenerated return type of ConnectionUpdate. */
export type ConnectionUpdatePayload = {
  __typename?: 'ConnectionUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The updated Connection. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated return type of ConnectionUpdated. */
export type ConnectionUpdatedPayload = {
  __typename?: 'ConnectionUpdatedPayload';
  /** The updated Connection */
  connection?: Maybe<Connection>;
};

/** Autogenerated input type of ConnectorFinicityClose */
export type ConnectorFinicityCloseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `token` from the `connectorFinicityInitialize` response. */
  token: Scalars['String']['input'];
};

/** Autogenerated return type of ConnectorFinicityClose. */
export type ConnectorFinicityClosePayload = {
  __typename?: 'ConnectorFinicityClosePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The Connection. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorFinicityInitialize */
export type ConnectorFinicityInitializeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * The ID of the Connection to be updated.
   *
   */
  connectionId?: InputMaybe<Scalars['ID']['input']>;
  /** The Connection features to be attempted to be enabled. */
  featuresOptional?: InputMaybe<Array<ConnectionFeature>>;
  /** The Connection features to be enabled. */
  featuresRequired: Array<ConnectionFeature>;
  /**
   * The ID of the Institution Portals Provider used to create a new Connection.
   *
   */
  portalsProviderId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * The URI to redirect to after an OAuth Handshake
   *
   */
  redirectUri?: InputMaybe<Scalars['String']['input']>;
};

/** Autogenerated return type of ConnectorFinicityInitialize. */
export type ConnectorFinicityInitializePayload = {
  __typename?: 'ConnectorFinicityInitializePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** Connector payload for a Finicity Connector. */
  record?: Maybe<FinicityConnectorSession>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorMockClose */
export type ConnectorMockCloseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `token` from the `connectorMockInitialize` response. */
  token: Scalars['String']['input'];
};

/** Autogenerated return type of ConnectorMockClose. */
export type ConnectorMockClosePayload = {
  __typename?: 'ConnectorMockClosePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The Connection. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorMockInitialize */
export type ConnectorMockInitializeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * The ID of the Connection to be updated.
   *
   */
  connectionId?: InputMaybe<Scalars['ID']['input']>;
  /** The Connection features to be attempted to be enabled. */
  featuresOptional?: InputMaybe<Array<ConnectionFeature>>;
  /** The Connection features to be enabled. */
  featuresRequired: Array<ConnectionFeature>;
  /**
   * The ID of the Institution Portals Provider used to create a new Connection.
   *
   */
  portalsProviderId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * The URI to redirect to after an OAuth Handshake
   *
   */
  redirectUri?: InputMaybe<Scalars['String']['input']>;
};

/** Autogenerated return type of ConnectorMockInitialize. */
export type ConnectorMockInitializePayload = {
  __typename?: 'ConnectorMockInitializePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** Connector payload for a Mock Connector. */
  record?: Maybe<MockConnectorSession>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorMxClose */
export type ConnectorMxCloseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `metadata` object from MX Connect's `memberConnected` callback. */
  metadata: Scalars['JSON']['input'];
  /** The `token` from the `connectorMxInitialize` response. */
  token: Scalars['String']['input'];
};

/** Autogenerated return type of ConnectorMxClose. */
export type ConnectorMxClosePayload = {
  __typename?: 'ConnectorMxClosePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** A list of MX API errors from the mutation. */
  errors?: Maybe<Array<MxMutationError>>;
  /** The Connection. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorMxInitialize */
export type ConnectorMxInitializeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * Used as a redirect destination at the end of OAuth, if used with `is_mobile_webview: true` or `oauth_referral_source: "APP"`.
   *
   */
  clientRedirectUrl?: InputMaybe<Scalars['String']['input']>;
  /**
   * Load the Connect widget in the specified `color_scheme`; options are `light` and `dark`. Defaults to `light`.
   *
   */
  colorScheme?: InputMaybe<Scalars['String']['input']>;
  /**
   * The ID of the Connection that will be updated with MX Connect. This is typically used when repairing a connection with an `ERROR_REPAIRABLE` status.
   *
   */
  connectionId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Set to `true` or `false` to explicitly set the value of `background_aggregation_is_disabled` for new members created through the Connect widget
   *
   */
  disableBackgroundAgg?: InputMaybe<Scalars['Boolean']['input']>;
  /** The Connection features to be attempted to be enabled. */
  featuresOptional?: InputMaybe<Array<ConnectionFeature>>;
  /** The Connection features to be enabled. */
  featuresRequired: Array<ConnectionFeature>;
  /**
   * When set to `false` while creating or updating a member, transaction data will not be automatically aggregated. Future manual or background aggregations will not be affected.
   *
   */
  includeTransactions?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Renders the widget in a mobile WebView. Executes URL updates in place of the JavaScript event postMessages.
   *
   */
  isMobileWebview?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * This determines how MX will respond to the result of an OAuth flow.
   *
   * When set to `APP`, MX will redirect to the URI specified in the ui_message_webview_url_scheme.
   *
   * When set to `BROWSER`, MX will send a postMessage but not redirect.
   *
   * If `is_mobile_webview` is `true`, this defaults to `APP`. If false, it defaults to `BROWSER`.
   *
   */
  oauthReferralSource?: InputMaybe<Scalars['String']['input']>;
  /**
   * The ID of the Institution Portals Provider used to create a new Connection.
   *
   */
  portalsProviderId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * The URI to redirect to after an OAuth Handshake
   *
   */
  redirectUri?: InputMaybe<Scalars['String']['input']>;
  /**
   * Used in postMessages and OAuth redirects in WebViews. Defaults to `mx`.
   *
   */
  uiMessageWebviewUrlScheme?: InputMaybe<Scalars['String']['input']>;
};

/** Autogenerated return type of ConnectorMxInitialize. */
export type ConnectorMxInitializePayload = {
  __typename?: 'ConnectorMxInitializePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** A list of MX API errors from the mutation. */
  errors?: Maybe<Array<MxMutationError>>;
  /** Connector payload for MX Connect. */
  record?: Maybe<MxConnectorSession>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorPlaidClose */
export type ConnectorPlaidCloseInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The `metadata` object from Plaid Link's `onSuccess` callback. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** The `public_token` string from Plaid Link's `onSuccess` callback. */
  publicToken: Scalars['String']['input'];
  /** The `token` from the `connectorPlaidInitialize` response. */
  token: Scalars['String']['input'];
};

/** Autogenerated return type of ConnectorPlaidClose. */
export type ConnectorPlaidClosePayload = {
  __typename?: 'ConnectorPlaidClosePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** A list of Plaid API errors from the mutation. */
  errors?: Maybe<Array<PlaidMutationError>>;
  /** The Connection. */
  record?: Maybe<Connection>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Autogenerated input type of ConnectorPlaidInitialize */
export type ConnectorPlaidInitializeInput = {
  /**
   * By default, Link will provide limited account filtering: it will only display Institutions that are compatible with all products supplied in the `products` parameter of `/link/token/create`, and, if `auth` is specified in the `products` array, will also filter out accounts other than `checking` and `savings` accounts on the Account Select pane. You can further limit the accounts shown in Link by using `account_filters` to specify the account subtypes to be shown in Link. Only the specified subtypes will be shown. This filtering applies to both the Account Select view (if enabled) and the Institution Select view. Institutions that do not support the selected subtypes will be omitted from Link. To indicate that all subtypes should be shown, use the value `"all"`. If the `account_filters` filter is used, any account type for which a filter is not specified will be entirely omitted from Link. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).
   *
   * The filter may or may not impact the list of accounts shown by the institution in the OAuth account selection flow, depending on the specific institution. If the user selects excluded account subtypes in the OAuth flow, these accounts will not be added to the Item. If the user selects only excluded account subtypes, the link attempt will fail and the user will be prompted to try again.
   *
   */
  accountFilters?: InputMaybe<RemoteDataPlaidAccountFiltersInput>;
  /** The name of your app's Android package. Required if using the `link_token` to initialize Link on Android. Any package name specified here must also be added to the Allowed Android package names setting on the [developer dashboard](https://dashboard.plaid.com/team/api). When creating a `link_token` for initializing Link on other platforms, `android_package_name` must be left blank and `redirect_uri` should be used instead. */
  androidPackageName?: InputMaybe<Scalars['String']['input']>;
  /** Specifies options for initializing Link for use with the Auth product. This field can be used to enable or disable extended Auth flows for the resulting Link session. Omitting any field will result in a default that can be configured by your account manager. The default behavior described in the documentation is the default behavior that will apply if you have not requested your account manager to apply a different default. */
  auth?: InputMaybe<RemoteDataPlaidAuthInput>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The name of your application, as it should be displayed in Link. Maximum length of 30 characters. If a value longer than 30 characters is provided, Link will display "This Application" instead. */
  clientName?: InputMaybe<Scalars['String']['input']>;
  /**
   * The ID of the Connection that will be updated with Plaid Link. This is typically used when repairing a connection with an `ERROR_REPAIRABLE` status or for completing the Same-day (manual) Micro-deposit flow.
   *
   */
  connectionId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Specify an array of Plaid-supported country codes using the ISO-3166-1 alpha-2 country code standard. Institutions from all listed countries will be shown. For a complete mapping of supported products by country, see https://plaid.com/global/.
   *
   * If using Identity Verification, `country_codes` should be set to the country where your company is based, not the country where your user is located. For all other products, `country_codes` represents the location of your user's financial institution.
   *
   * If Link is launched with multiple country codes, only products that you are enabled for in all countries will be used by Link. Note that while all countries are enabled by default in Sandbox and Development, in Production only US and Canada are enabled by default. Access to European institutions requires additional compliance steps. To request access to European institutions in the Production environment, [file a product access Support ticket](https://dashboard.plaid.com/support/new/product-and-development/product-troubleshooting/request-product-access) via the Plaid dashboard. If you initialize with a European country code, your users will see the European consent panel during the Link flow.
   *
   * If using a Link customization, make sure the country codes in the customization match those specified in `country_codes`, or the customization may not be applied.
   *
   * If using the Auth features Instant Match, Same-day Micro-deposits, or Automated Micro-deposits, `country_codes` must be set to `['US']`.
   */
  countryCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The Connection features to be attempted to be enabled. */
  featuresOptional?: InputMaybe<Array<ConnectionFeature>>;
  /** The Connection features to be enabled. */
  featuresRequired: Array<ConnectionFeature>;
  /** A map containing data used to highlight institutions in Link. */
  institutionData?: InputMaybe<RemoteDataPlaidInstitutionDataInput>;
  /**
   * The language that Link should be displayed in. When initializing with Identity Verification, this field is not used; for more details, see [Identity Verification supported languages](https://www.plaid.com/docs/identity-verification/#supported-languages).
   *
   * Supported languages are:
   * - Danish (`'da'`)
   * - Dutch (`'nl'`)
   * - English (`'en'`)
   * - Estonian (`'et'`)
   * - French (`'fr'`)
   * - German (`'de'`)
   * - Italian (`'it'`)
   * - Latvian (`'lv'`)
   * - Lithuanian (`'lt'`)
   * - Norwegian (`'no'`)
   * - Polish (`'pl'`)
   * - Portuguese (`'pt'`)
   * - Romanian (`'ro'`)
   * - Spanish (`'es'`)
   * - Swedish (`'sv'`)
   *
   * When using a Link customization, the language configured here must match the setting in the customization, or the customization will not be applied.
   */
  language?: InputMaybe<Scalars['String']['input']>;
  /** The name of the Link customization from the Plaid Dashboard to be applied to Link. If not specified, the `default` customization will be used. When using a Link customization, the language in the customization must match the language selected via the `language` parameter, and the countries in the customization should match the country codes selected via `country_codes`. */
  linkCustomizationName?: InputMaybe<Scalars['String']['input']>;
  /**
   * List of Plaid product(s) that you may wish to use but that are not required for your use case. Plaid will attempt to fetch data for these products on a best-effort basis, and failure to support these products will not affect Item creation.
   *
   * There should be no overlap between this array and the `products`, `required_if_supported_products`, or `additional_consented_products` arrays. The `products` array must have at least one product.
   *
   * For more details on using this feature, see [Optional Products](https://www.plaid.com/docs/link/initializing-products/#optional-products).
   */
  optionalProducts?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * The ID of the Institution Portals Provider used to create a new Connection.
   *
   */
  portalsProviderId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * List of Plaid product(s) you wish to use. If launching Link in update mode, should be omitted (unless you are using update mode to add Income or Assets to an Item); required otherwise.
   *
   * `balance` is *not* a valid value, the Balance product does not require explicit initialization and will automatically be initialized when any other product is initialized.
   *
   * The products specified here will determine which institutions will be available to your users in Link. Only institutions that support *all* requested products can be selected; a if a user attempts to select an institution that does not support a listed product, a "Connectivity not supported" error message will appear in Link. To maximize the number of institutions available, initialize Link with the minimal product set required for your use case. Additional products can be included via the [`optional_products`](https://plaid.com/docs/api/tokens/#link-token-create-request-optional-products) or  [`required_if_supported_products`](https://plaid.com/docs/api/tokens/#link-token-create-request-required-if-supported-products) fields, or can be initialized by calling the endpoint after obtaining an access token. For details and exceptions, see [Choosing when to initialize products](https://plaid.com/docs/link/initializing-products/).
   *
   * Note that, unless you have opted to disable Instant Match support, institutions that support Instant Match will also be shown in Link if `auth` is specified as a product, even though these institutions do not contain `auth` in their product array.
   *
   * In Production, you will be billed for each product that you specify when initializing Link. Note that a product cannot be removed from an Item once the Item has been initialized with that product. To stop billing on an Item for subscription-based products, such as Liabilities, Investments, and Transactions, remove the Item via `/item/remove`.
   */
  products?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * The URI to redirect to after an OAuth Handshake
   *
   */
  redirectUri?: InputMaybe<Scalars['String']['input']>;
  /** Configuration parameters for the Transactions product */
  transactions?: InputMaybe<RemoteDataPlaidTransactionsInput>;
  /** Specifies options for initializing Link for [update mode](https://plaid.com/docs/link/update-mode). */
  update?: InputMaybe<RemoteDataPlaidUpdateInput>;
};

/** Autogenerated return type of ConnectorPlaidInitialize. */
export type ConnectorPlaidInitializePayload = {
  __typename?: 'ConnectorPlaidInitializePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** A list of Plaid API errors from the mutation. */
  errors?: Maybe<Array<PlaidMutationError>>;
  /** Connector payload for Plaid Link. */
  record?: Maybe<PlaidConnectorSession>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Represents the next step with initializing a Connector session. */
export enum ConnectorStatus {
  /** Unable to upgrade feature as it is not supported by the Institution. */
  Abort = 'ABORT',
  /** The end-user must interact with the Connection provider. */
  ActionRequired = 'ACTION_REQUIRED',
  /** No end-user interaction is required. */
  Continue = 'CONTINUE',
  /** An asynchronous operation is occurring that may need further end-user interaction. */
  Wait = 'WAIT'
}

/** The actionable status for the attempted upgrade */
export type ConnectorUpgrade = {
  __typename?: 'ConnectorUpgrade';
  /** The actionable status of the Upgrade. */
  status: ConnectorStatus;
};

/** Autogenerated input type of ConnectorUpgrade */
export type ConnectorUpgradeInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * The ID of the Connection to be updated.
   *
   */
  connectionId?: InputMaybe<Scalars['ID']['input']>;
  /** The Connection features to be attempted to be enabled. */
  featuresOptional?: InputMaybe<Array<ConnectionFeature>>;
  /** The Connection features to be enabled. */
  featuresRequired: Array<ConnectionFeature>;
};

/** Autogenerated return type of ConnectorUpgrade. */
export type ConnectorUpgradePayload = {
  __typename?: 'ConnectorUpgradePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** Connector features upgrade statuses. */
  record?: Maybe<ConnectorUpgrade>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** Represents a supported ISO-4217 currency code. */
export enum CurrencyCode {
  /** United Arab Emirates Dirham */
  Aed = 'AED',
  /** Afghan Afghani */
  Afn = 'AFN',
  /** Albanian Lek */
  All = 'ALL',
  /** Armenian Dram */
  Amd = 'AMD',
  /** Netherlands Antillean Gulden */
  Ang = 'ANG',
  /** Angolan Kwanza */
  Aoa = 'AOA',
  /** Argentine Peso */
  Ars = 'ARS',
  /** Australian Dollar */
  Aud = 'AUD',
  /** Aruban Florin */
  Awg = 'AWG',
  /** Azerbaijani Manat */
  Azn = 'AZN',
  /** Bosnia and Herzegovina Convertible Mark */
  Bam = 'BAM',
  /** Barbadian Dollar */
  Bbd = 'BBD',
  /** Bangladeshi Taka */
  Bdt = 'BDT',
  /** Bulgarian Lev */
  Bgn = 'BGN',
  /** Bahraini Dinar */
  Bhd = 'BHD',
  /** Burundian Franc */
  Bif = 'BIF',
  /** Bermudian Dollar */
  Bmd = 'BMD',
  /** Brunei Dollar */
  Bnd = 'BND',
  /** Bolivian Boliviano */
  Bob = 'BOB',
  /** Brazilian Real */
  Brl = 'BRL',
  /** Bahamian Dollar */
  Bsd = 'BSD',
  /** Bhutanese Ngultrum */
  Btn = 'BTN',
  /** Botswana Pula */
  Bwp = 'BWP',
  /** Belarusian Ruble */
  Byn = 'BYN',
  /** Belarusian Ruble */
  Byr = 'BYR',
  /** Belize Dollar */
  Bzd = 'BZD',
  /** Canadian Dollar */
  Cad = 'CAD',
  /** Congolese Franc */
  Cdf = 'CDF',
  /** Swiss Franc */
  Chf = 'CHF',
  /** Unidad de Fomento */
  Clf = 'CLF',
  /** Chilean Peso */
  Clp = 'CLP',
  /** Chinese Renminbi Yuan */
  Cny = 'CNY',
  /** Colombian Peso */
  Cop = 'COP',
  /** Costa Rican Colón */
  Crc = 'CRC',
  /** Cuban Convertible Peso */
  Cuc = 'CUC',
  /** Cuban Peso */
  Cup = 'CUP',
  /** Cape Verdean Escudo */
  Cve = 'CVE',
  /** Czech Koruna */
  Czk = 'CZK',
  /** Djiboutian Franc */
  Djf = 'DJF',
  /** Danish Krone */
  Dkk = 'DKK',
  /** Dominican Peso */
  Dop = 'DOP',
  /** Algerian Dinar */
  Dzd = 'DZD',
  /** Egyptian Pound */
  Egp = 'EGP',
  /** Eritrean Nakfa */
  Ern = 'ERN',
  /** Ethiopian Birr */
  Etb = 'ETB',
  /** Euro */
  Eur = 'EUR',
  /** Fijian Dollar */
  Fjd = 'FJD',
  /** Falkland Pound */
  Fkp = 'FKP',
  /** British Pound */
  Gbp = 'GBP',
  /** Georgian Lari */
  Gel = 'GEL',
  /** Ghanaian Cedi */
  Ghs = 'GHS',
  /** Gibraltar Pound */
  Gip = 'GIP',
  /** Gambian Dalasi */
  Gmd = 'GMD',
  /** Guinean Franc */
  Gnf = 'GNF',
  /** Guatemalan Quetzal */
  Gtq = 'GTQ',
  /** Guyanese Dollar */
  Gyd = 'GYD',
  /** Hong Kong Dollar */
  Hkd = 'HKD',
  /** Honduran Lempira */
  Hnl = 'HNL',
  /** Haitian Gourde */
  Htg = 'HTG',
  /** Hungarian Forint */
  Huf = 'HUF',
  /** Indonesian Rupiah */
  Idr = 'IDR',
  /** Israeli New Sheqel */
  Ils = 'ILS',
  /** Indian Rupee */
  Inr = 'INR',
  /** Iraqi Dinar */
  Iqd = 'IQD',
  /** Iranian Rial */
  Irr = 'IRR',
  /** Icelandic Króna */
  Isk = 'ISK',
  /** Jamaican Dollar */
  Jmd = 'JMD',
  /** Jordanian Dinar */
  Jod = 'JOD',
  /** Japanese Yen */
  Jpy = 'JPY',
  /** Kenyan Shilling */
  Kes = 'KES',
  /** Kyrgyzstani Som */
  Kgs = 'KGS',
  /** Cambodian Riel */
  Khr = 'KHR',
  /** Comorian Franc */
  Kmf = 'KMF',
  /** North Korean Won */
  Kpw = 'KPW',
  /** South Korean Won */
  Krw = 'KRW',
  /** Kuwaiti Dinar */
  Kwd = 'KWD',
  /** Cayman Islands Dollar */
  Kyd = 'KYD',
  /** Kazakhstani Tenge */
  Kzt = 'KZT',
  /** Lao Kip */
  Lak = 'LAK',
  /** Lebanese Pound */
  Lbp = 'LBP',
  /** Sri Lankan Rupee */
  Lkr = 'LKR',
  /** Liberian Dollar */
  Lrd = 'LRD',
  /** Lesotho Loti */
  Lsl = 'LSL',
  /** Libyan Dinar */
  Lyd = 'LYD',
  /** Moroccan Dirham */
  Mad = 'MAD',
  /** Moldovan Leu */
  Mdl = 'MDL',
  /** Malagasy Ariary */
  Mga = 'MGA',
  /** Macedonian Denar */
  Mkd = 'MKD',
  /** Myanmar Kyat */
  Mmk = 'MMK',
  /** Mongolian Tögrög */
  Mnt = 'MNT',
  /** Macanese Pataca */
  Mop = 'MOP',
  /** Mauritanian Ouguiya */
  Mru = 'MRU',
  /** Mauritian Rupee */
  Mur = 'MUR',
  /** Maldivian Rufiyaa */
  Mvr = 'MVR',
  /** Malawian Kwacha */
  Mwk = 'MWK',
  /** Mexican Peso */
  Mxn = 'MXN',
  /** Malaysian Ringgit */
  Myr = 'MYR',
  /** Mozambican Metical */
  Mzn = 'MZN',
  /** Namibian Dollar */
  Nad = 'NAD',
  /** Nigerian Naira */
  Ngn = 'NGN',
  /** Nicaraguan Córdoba */
  Nio = 'NIO',
  /** Norwegian Krone */
  Nok = 'NOK',
  /** Nepalese Rupee */
  Npr = 'NPR',
  /** New Zealand Dollar */
  Nzd = 'NZD',
  /** Omani Rial */
  Omr = 'OMR',
  /** Panamanian Balboa */
  Pab = 'PAB',
  /** Peruvian Sol */
  Pen = 'PEN',
  /** Papua New Guinean Kina */
  Pgk = 'PGK',
  /** Philippine Peso */
  Php = 'PHP',
  /** Pakistani Rupee */
  Pkr = 'PKR',
  /** Polish Złoty */
  Pln = 'PLN',
  /** Paraguayan Guaraní */
  Pyg = 'PYG',
  /** Qatari Riyal */
  Qar = 'QAR',
  /** Romanian Leu */
  Ron = 'RON',
  /** Serbian Dinar */
  Rsd = 'RSD',
  /** Russian Ruble */
  Rub = 'RUB',
  /** Rwandan Franc */
  Rwf = 'RWF',
  /** Saudi Riyal */
  Sar = 'SAR',
  /** Solomon Islands Dollar */
  Sbd = 'SBD',
  /** Seychellois Rupee */
  Scr = 'SCR',
  /** Sudanese Pound */
  Sdg = 'SDG',
  /** Swedish Krona */
  Sek = 'SEK',
  /** Singapore Dollar */
  Sgd = 'SGD',
  /** Saint Helenian Pound */
  Shp = 'SHP',
  /** Slovak Koruna */
  Skk = 'SKK',
  /** New Leone */
  Sle = 'SLE',
  /** Sierra Leonean Leone */
  Sll = 'SLL',
  /** Somali Shilling */
  Sos = 'SOS',
  /** Surinamese Dollar */
  Srd = 'SRD',
  /** South Sudanese Pound */
  Ssp = 'SSP',
  /** São Tomé and Príncipe Dobra */
  Std = 'STD',
  /** São Tomé and Príncipe Second Dobra */
  Stn = 'STN',
  /** Salvadoran Colón */
  Svc = 'SVC',
  /** Syrian Pound */
  Syp = 'SYP',
  /** Swazi Lilangeni */
  Szl = 'SZL',
  /** Thai Baht */
  Thb = 'THB',
  /** Tajikistani Somoni */
  Tjs = 'TJS',
  /** Turkmenistani Manat */
  Tmt = 'TMT',
  /** Tunisian Dinar */
  Tnd = 'TND',
  /** Tongan Paʻanga */
  Top = 'TOP',
  /** Turkish Lira */
  Try = 'TRY',
  /** Trinidad and Tobago Dollar */
  Ttd = 'TTD',
  /** New Taiwan Dollar */
  Twd = 'TWD',
  /** Tanzanian Shilling */
  Tzs = 'TZS',
  /** Ukrainian Hryvnia */
  Uah = 'UAH',
  /** Ugandan Shilling */
  Ugx = 'UGX',
  /** United States Dollar */
  Usd = 'USD',
  /** Uruguayan Peso */
  Uyu = 'UYU',
  /** Uzbekistan Som */
  Uzs = 'UZS',
  /** Venezuelan Bolívar Soberano */
  Ves = 'VES',
  /** Vietnamese Đồng */
  Vnd = 'VND',
  /** Vanuatu Vatu */
  Vuv = 'VUV',
  /** Samoan Tala */
  Wst = 'WST',
  /** Central African Cfa Franc */
  Xaf = 'XAF',
  /** Silver (Troy Ounce) */
  Xag = 'XAG',
  /** Gold (Troy Ounce) */
  Xau = 'XAU',
  /** European Composite Unit */
  Xba = 'XBA',
  /** European Monetary Unit */
  Xbb = 'XBB',
  /** European Unit of Account 9 */
  Xbc = 'XBC',
  /** European Unit of Account 17 */
  Xbd = 'XBD',
  /** East Caribbean Dollar */
  Xcd = 'XCD',
  /** Special Drawing Rights */
  Xdr = 'XDR',
  /** West African Cfa Franc */
  Xof = 'XOF',
  /** Palladium */
  Xpd = 'XPD',
  /** Cfp Franc */
  Xpf = 'XPF',
  /** Platinum */
  Xpt = 'XPT',
  /** Codes specifically reserved for testing purposes */
  Xts = 'XTS',
  /** Yemeni Rial */
  Yer = 'YER',
  /** South African Rand */
  Zar = 'ZAR',
  /** Zambian Kwacha */
  Zmk = 'ZMK',
  /** Zambian Kwacha */
  Zmw = 'ZMW',
  /** Zimbabwean Dollar */
  Zwl = 'ZWL'
}

/** Represents a Date Month. */
export type DateMonth = {
  /** The month */
  month: Scalars['String']['input'];
  /** The year */
  year: Scalars['String']['input'];
};

/** Represents a Date Range. */
export type DateRange = {
  /** The end date of the range */
  end: Scalars['Date']['input'];
  /** The start date of the range */
  start: Scalars['Date']['input'];
};

/** The details of an email address */
export type Email = {
  __typename?: 'Email';
  /** The email address */
  address?: Maybe<Scalars['String']['output']>;
};

/** Represents an Error. */
export type Error = {
  __typename?: 'Error';
  /** A description of the error. */
  message?: Maybe<Scalars['String']['output']>;
  /** Which input value this error came from. */
  path?: Maybe<Array<Scalars['String']['output']>>;
};

/** The Connector configuration for the Finicity provider. */
export type FinicityConnectorSession = {
  __typename?: 'FinicityConnectorSession';
  /** A generated Connect URL */
  link?: Maybe<Scalars['String']['output']>;
  /** The status of the Finicity Connector Session. */
  status: ConnectorStatus;
  /** The unique token for the Finicity Connector Session. */
  token?: Maybe<Scalars['String']['output']>;
};

/** Represents an Investment Holding. */
export type Holding = {
  __typename?: 'Holding';
  /** @deprecated Use `Account.holdings` to see account */
  account: Account;
  /** The timestamp of the Holding record. */
  at: Scalars['DateTime']['output'];
  /** The ID of the Holding. */
  id: Scalars['ID']['output'];
  /** The price for the holding */
  price?: Maybe<Scalars['Float']['output']>;
  /** The number of shares being held */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** @deprecated Use `Account.remoteData` to see the Remote Data */
  remoteData?: Maybe<HoldingRemoteData>;
  /** The Security associated with the Investment Holding. */
  security?: Maybe<Security>;
  /** The value of the holding */
  value?: Maybe<Scalars['Float']['output']>;
};

/** The connection type for Holding. */
export type HoldingConnection = {
  __typename?: 'HoldingConnection';
  /** The total number of records. */
  count: Scalars['Int']['output'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<HoldingEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Holding>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type HoldingEdge = {
  __typename?: 'HoldingEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node?: Maybe<Holding>;
};

/** Remote data associated with a Investment Holding. */
export type HoldingRemoteData = {
  __typename?: 'HoldingRemoteData';
  /** The Finicity remote data associated with the Investment Holding. */
  finicity?: Maybe<HoldingRemoteDataFinicity>;
  /** The Plaid remote data associated with the Investment Holding. */
  plaid?: Maybe<HoldingRemoteDataPlaid>;
};

/** Remote Data from Finicity */
export type HoldingRemoteDataFinicity = {
  __typename?: 'HoldingRemoteDataFinicity';
  /** Finicity's Holding Remote Data */
  holding?: Maybe<HoldingRemoteDataFinicityHolding>;
};

/** The Holding data from Finicity. */
export type HoldingRemoteDataFinicityHolding = {
  __typename?: 'HoldingRemoteDataFinicityHolding';
  /** The record's Finicity ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFinicityCustomerAccountPosition>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Remote Data from Plaid */
export type HoldingRemoteDataPlaid = {
  __typename?: 'HoldingRemoteDataPlaid';
  /** Plaids's Investments Holding Remote Data */
  holding?: Maybe<HoldingRemoteDataPlaidHolding>;
  /** Plaids's Investments Security Remote Data */
  security?: Maybe<HoldingRemoteDataPlaidSecurity>;
};

/** The Holding data from Plaid. */
export type HoldingRemoteDataPlaidHolding = {
  __typename?: 'HoldingRemoteDataPlaidHolding';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidHolding>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Security data from Plaid. */
export type HoldingRemoteDataPlaidSecurity = {
  __typename?: 'HoldingRemoteDataPlaidSecurity';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidSecurity>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Represents an Image. */
export type Image = {
  __typename?: 'Image';
  /**
   * The source of the Image.
   * @deprecated This field will be removed in the next version of the API
   */
  _sourcename: ImageSource;
  /** The URL for the Image. */
  url?: Maybe<Scalars['URL']['output']>;
};

/** Represents the data provider for the Image. */
export enum ImageSource {
  /** FinGoal */
  Fingoal = 'FINGOAL',
  /** Finicity */
  Finicity = 'FINICITY',
  /** Mock data */
  Mock = 'MOCK',
  /** MX */
  Mx = 'MX',
  /** Plaid */
  Plaid = 'PLAID',
  /** Quiltt */
  Quiltt = 'QUILTT'
}

/** Represents an Institution. */
export type Institution = {
  __typename?: 'Institution';
  /** The ID of the Institution. */
  id: Scalars['ID']['output'];
  /** A single Transaction Logo. */
  logo?: Maybe<Image>;
  /** The name of the Institution. */
  name: Scalars['String']['output'];
};


/** Represents an Institution. */
export type InstitutionLogoArgs = {
  source?: InputMaybe<ImageSource>;
};

/** A Merchant represents the accounting of a merchant relationship. */
export type Merchant = {
  __typename?: 'Merchant';
  /** The ID of the Merchant. */
  id: Scalars['ID']['output'];
  /**
   * Custom metadata about the Merchant, stored in a 'key-value' format.
   *
   * See the [Custom Metadata](https://quiltt.dev/api/custom-metadata) guide for more information and examples.
   *
   */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** The Name of the Account */
  name: Scalars['String']['output'];
  /** The State of the Account */
  state: AccountState;
  /** The date of the earliest known Transaction. */
  transactedFirstOn?: Maybe<Scalars['Date']['output']>;
  /** The date of the most recent known Transaction. */
  transactedLastOn?: Maybe<Scalars['Date']['output']>;
  /** A paginated list of Transactions. */
  transactions: TransactionConnection;
};


/** A Merchant represents the accounting of a merchant relationship. */
export type MerchantTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TransactionFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<TransactionSort>;
};

/** The Connector configuration for the Mock provider. */
export type MockConnectorSession = {
  __typename?: 'MockConnectorSession';
  /** The status of the Mock Connector Session. */
  status: ConnectorStatus;
  /** The unique token for the Mock Connector Session. */
  token?: Maybe<Scalars['String']['output']>;
  /** OAuth Flow URL. */
  url?: Maybe<Scalars['URL']['output']>;
};

/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Update an Account's [metadata](https://quiltt.dev/api/custom-metadata).
   *
   * See the [Accounts guide](https://www.quiltt.dev/api/core-resources/accounts#the-accountupdate-mutation) for more information and examples.
   *
   */
  accountUpdate?: Maybe<AccountUpdatePayload>;
  /**
   * Enqueue a Connection to be disconnected. This will begin the process of disconnecting the Connection from the upstream provider and change the Connection's status. to `DISCONNECTED`.
   *
   * See the [Connections guide](https://www.quiltt.dev/api/core-resources/connections#the-connectiondisconnect-mutation) for more information and examples.
   *
   */
  connectionDisconnect?: Maybe<ConnectionDisconnectPayload>;
  /**
   * Put an active Connection into a user-repairable error state. This allows you to simulate repairing
   * Connection errors by passing the Connection ID to the Quiltt Connector. Note that this mutation is not available in `PRODUCTION` environments.
   *
   * See the [Reconnect guide](https://www.quiltt.dev/connector/reconnect) for more information and examples.
   *
   */
  connectionSimulateError?: Maybe<ConnectionSimulateErrorPayload>;
  /**
   * Update a Connection's [metadata](https://quiltt.dev/api/custom-metadata).
   *
   * See the [Connections guide](https://www.quiltt.dev/api/core-resources/connections#the-connectionupdate-mutation) for more information and examples.
   *
   * Note that updating a Connection's features requires the end-user going through the Connector [Reconnect flow](https://www.quiltt.dev/connector/reconnect).
   *
   */
  connectionUpdate?: Maybe<ConnectionUpdatePayload>;
  /** Create or update a Finicity-sourced Connection from a successful Finicity Connector submission. */
  connectorFinicityClose?: Maybe<ConnectorFinicityClosePayload>;
  /** Generate a Finicity Connector token. */
  connectorFinicityInitialize?: Maybe<ConnectorFinicityInitializePayload>;
  /** Create or update a Mock-sourced Connection from a successful Mock Connector submission. */
  connectorMockClose?: Maybe<ConnectorMockClosePayload>;
  /** Generate a Mock Connector token. */
  connectorMockInitialize?: Maybe<ConnectorMockInitializePayload>;
  /** Create or update an MX-sourced Connection from a successful MX Connect submission. */
  connectorMxClose?: Maybe<ConnectorMxClosePayload>;
  /** Generate a widget URL to initialize MX Connect. */
  connectorMxInitialize?: Maybe<ConnectorMxInitializePayload>;
  /** Create or update a Plaid-sourced Connection from a successful Plaid Link submission. */
  connectorPlaidClose?: Maybe<ConnectorPlaidClosePayload>;
  /** Generate a Plaid Link token or Hosted Link URL to launch Plaid Link. */
  connectorPlaidInitialize?: Maybe<ConnectorPlaidInitializePayload>;
  /** Attempt to upgrade a Connection. */
  connectorUpgrade?: Maybe<ConnectorUpgradePayload>;
  /**
   * Update a Merchant's metadata.
   * @deprecated This feature is in alpha
   */
  merchantUpdate?: Maybe<AccountMerchantUpdatePayload>;
  /**
   * Update Profile information like the name, email or [metadata](https://quiltt.dev/api/custom-metadata).
   *
   * See the [Profiles guide](https://www.quiltt.dev/api/core-resources/profiles#the-profileupdate-mutation) for more information and examples.
   *
   */
  profileUpdate?: Maybe<ProfileUpdatePayload>;
  /** Update a transaction's metadata. */
  transactionUpdate?: Maybe<TransactionUpdatePayload>;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationAccountUpdateArgs = {
  input: AccountUpdateInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectionDisconnectArgs = {
  input: ConnectionDisconnectInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectionSimulateErrorArgs = {
  input: ConnectionSimulateErrorInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectionUpdateArgs = {
  input: ConnectionUpdateInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorFinicityCloseArgs = {
  input: ConnectorFinicityCloseInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorFinicityInitializeArgs = {
  input: ConnectorFinicityInitializeInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorMockCloseArgs = {
  input: ConnectorMockCloseInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorMockInitializeArgs = {
  input: ConnectorMockInitializeInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorMxCloseArgs = {
  input: ConnectorMxCloseInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorMxInitializeArgs = {
  input: ConnectorMxInitializeInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorPlaidCloseArgs = {
  input: ConnectorPlaidCloseInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorPlaidInitializeArgs = {
  input: ConnectorPlaidInitializeInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationConnectorUpgradeArgs = {
  input: ConnectorUpgradeInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationMerchantUpdateArgs = {
  input: AccountMerchantUpdateInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationProfileUpdateArgs = {
  input: ProfileUpdateInput;
};


/** The top-level Mutation type. Mutations are used to make requests that create or modify data. */
export type MutationTransactionUpdateArgs = {
  input: TransactionUpdateInput;
};

/** The Connector configuration for MX Connect. */
export type MxConnectorSession = {
  __typename?: 'MxConnectorSession';
  /** The status of the MX Connector Session. */
  status: ConnectorStatus;
  /** The unique token for the MX Connector Session. */
  token?: Maybe<Scalars['String']['output']>;
  /** The MX Connect Widget URL. */
  url?: Maybe<Scalars['String']['output']>;
};

/** An MX API error encountered while executing the mutation. */
export type MxMutationError = {
  __typename?: 'MxMutationError';
  /** A developer-friendly representation of the MX error. */
  message?: Maybe<Scalars['String']['output']>;
  /** A representation of the HTTP status code. */
  status?: Maybe<Scalars['String']['output']>;
  /** A categorization of the MX error. */
  type?: Maybe<Scalars['String']['output']>;
};

/** The details of a name */
export type Name = {
  __typename?: 'Name';
  /** The first name */
  first?: Maybe<Scalars['String']['output']>;
  /** The full name */
  full?: Maybe<Scalars['String']['output']>;
  /** The last name */
  last?: Maybe<Scalars['String']['output']>;
  /** The middle name */
  middle?: Maybe<Scalars['String']['output']>;
  /** The prefix */
  prefix?: Maybe<Scalars['String']['output']>;
  /** The suffix */
  suffix?: Maybe<Scalars['String']['output']>;
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** The details of a phone number */
export type Phone = {
  __typename?: 'Phone';
  /** The phone number */
  number?: Maybe<Scalars['String']['output']>;
};

/** Autogenerated return type of Ping. */
export type PingPayload = {
  __typename?: 'PingPayload';
  /** Time */
  timestamp?: Maybe<Scalars['String']['output']>;
};

/** The Connector configuration for Plaid Link. */
export type PlaidConnectorSession = {
  __typename?: 'PlaidConnectorSession';
  /** The expiration date for the `link_token`, in [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format. A `link_token` created to generate a `public_token` that will be exchanged for a new `access_token` expires after 4 hours. A `link_token` created for an existing Item (such as when updating an existing `access_token` by launching Link in update mode) expires after 30 minutes. */
  expiration?: Maybe<Scalars['DateTime']['output']>;
  /** A URL of a Plaid-hosted Link flow that will use the Link token returned by this request. Only present if the client is enabled for Hosted Link. */
  hostedLinkUrl?: Maybe<Scalars['String']['output']>;
  /** A `link_token`, which can be supplied to Link in order to initialize it and receive a `public_token`, which can be exchanged for an `access_token`. */
  linkToken?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive. */
  requestId?: Maybe<Scalars['String']['output']>;
  /** The status of the Plaid Connector Session. */
  status: ConnectorStatus;
  /** The unique token for the Plaid Connector Session. */
  token?: Maybe<Scalars['String']['output']>;
};

/** A Plaid API error encountered while executing the mutation. */
export type PlaidMutationError = {
  __typename?: 'PlaidMutationError';
  /** The particular Plaid error code. */
  code?: Maybe<Scalars['String']['output']>;
  /** A user-friendly representation of the Plaid error code. */
  displayMessage?: Maybe<Scalars['String']['output']>;
  /** A developer-friendly representation of the Plaid error code. */
  message?: Maybe<Scalars['String']['output']>;
  /** A unique ID identifying the request, to be used for troubleshooting purposes. */
  requestId?: Maybe<Scalars['String']['output']>;
  /** A broad categorization of the Plaid error. */
  type?: Maybe<Scalars['String']['output']>;
};

/** A Profile represents an entity with data in a Quiltt Environment, typically a physical person or company end-user of your application. */
export type Profile = {
  __typename?: 'Profile';
  /** The legal address associated with the Profile. */
  address?: Maybe<ProfileAddress>;
  /** A physical person's date of birth. */
  dateOfBirth?: Maybe<Scalars['Date']['output']>;
  /**
   * The email associated with the Profile.
   *
   * This field can be used to power passwordless authentication in the Connector.
   *
   */
  email?: Maybe<Scalars['String']['output']>;
  /** The ID of the Profile. */
  id: Scalars['ID']['output'];
  /**
   * Custom metadata about the Profile, stored in a 'key-value' format.
   *
   * See the [Custom Metadata](https://quiltt.dev/api/custom-metadata) guide for more information and examples.
   *
   */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** A common name or nickname for the Profile. */
  name?: Maybe<Scalars['String']['output']>;
  /** A physical person's legal name. */
  names?: Maybe<ProfileName>;
  /**
   * The phone number associated with the Profile, in E164 Format.
   *
   * This field can be used to power passwordless authentication in the Connector.
   *
   */
  phone?: Maybe<Scalars['String']['output']>;
  /**
   * The Remote Data associated with the Profile.
   *
   * See the [Remote Data guide](https://quiltt.dev/api/remote-data) for more information.
   *
   */
  remoteData?: Maybe<ProfileRemoteData>;
  /** The UUID of the Profile. */
  uuid: Scalars['ID']['output'];
};

/** The legal address associated with the Profile. */
export type ProfileAddress = {
  __typename?: 'ProfileAddress';
  /** The city. */
  city?: Maybe<Scalars['String']['output']>;
  /** ISO 3166-1 alpha-3 country code. */
  countryCode?: Maybe<AddressCountryCode>;
  /** The first line of the address. */
  line1?: Maybe<Scalars['String']['output']>;
  /** The second line of the address. */
  line2?: Maybe<Scalars['String']['output']>;
  /** The postal code or zip code. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** The state or province. */
  state?: Maybe<Scalars['String']['output']>;
};

/** Attributes for setting an address. */
export type ProfileAddressInput = {
  /** The city. */
  city: Scalars['String']['input'];
  /** The country code. */
  countryCode: AddressCountryCode;
  /** The first line of the address. */
  line1: Scalars['String']['input'];
  /** The second line of the address. */
  line2?: InputMaybe<Scalars['String']['input']>;
  /** The postal code. */
  postalCode: Scalars['String']['input'];
  /** The state. */
  state: Scalars['String']['input'];
};

/** A physical person's legal name. */
export type ProfileName = {
  __typename?: 'ProfileName';
  /** The legal given name. */
  first?: Maybe<Scalars['String']['output']>;
  /** The full legal name, comprised from the given name and surname. */
  full?: Maybe<Scalars['String']['output']>;
  /** The legal surname. */
  last?: Maybe<Scalars['String']['output']>;
};

/** Attributes for setting a legal name. */
export type ProfileNameInput = {
  /** The legal given name. */
  first: Scalars['String']['input'];
  /** The legal surname. */
  last: Scalars['String']['input'];
};

/** Remote data associated with a Profile. */
export type ProfileRemoteData = {
  __typename?: 'ProfileRemoteData';
  /** The FinGoal remote data associated with the Profile. */
  fingoal?: Maybe<ProfileRemoteDataFingoal>;
};

/** Profile-level data from FinGoal. */
export type ProfileRemoteDataFingoal = {
  __typename?: 'ProfileRemoteDataFingoal';
  /** The Insights data from FinGoal. */
  insights?: Maybe<ProfileRemoteDataFingoalInsights>;
};

/** The Insights data from Fingoal. */
export type ProfileRemoteDataFingoalInsights = {
  __typename?: 'ProfileRemoteDataFingoalInsights';
  /** The record's Fingoal ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFingoalUser>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Autogenerated input type of ProfileUpdate */
export type ProfileUpdateInput = {
  /** Mailing address. */
  address?: InputMaybe<ProfileAddressInput>;
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Birthday. */
  dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  /** Email. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Customizable metadata. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Common or nickname. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Legal name. */
  names?: InputMaybe<ProfileNameInput>;
  /** Cellphone in E164 Format. */
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Autogenerated return type of ProfileUpdate. */
export type ProfileUpdatePayload = {
  __typename?: 'ProfileUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** Updated Profile. */
  record?: Maybe<Profile>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};

/** The top-level Query type. Queries are used to fetch data. */
export type Query = {
  __typename?: 'Query';
  /**
   * Look up an Account by its ID.
   *
   * See the [Accounts guide](https://www.quiltt.dev/api/core-resources/accounts#the-account-query) for more information and examples.
   *
   */
  account?: Maybe<Account>;
  /**
   * Get a list of Accounts. You can apply filters, search and sort to refine the list.
   *
   * See the [Accounts guide](https://www.quiltt.dev/api/core-resources/accounts#the-accounts-query) for more information and examples.
   *
   */
  accounts?: Maybe<Array<Account>>;
  /**
   * Look up a Connection by its ID.
   *
   * See the [Connections guide](https://www.quiltt.dev/api/core-resources/connections#the-connection-query) for more information and examples.
   *
   */
  connection?: Maybe<Connection>;
  /**
   * Get a list of Connections. You can apply filters to refine the list.
   *
   * See the [Connections guide](https://www.quiltt.dev/api/core-resources/connections#the-connections-query) for more information and examples.
   *
   */
  connections?: Maybe<Array<Connection>>;
  /** Look up a Holding by its ID. */
  holding?: Maybe<Holding>;
  /**
   * Get a paginated list of up to 100 Holdings.
   *
   */
  holdings: HoldingConnection;
  /**
   * Look up a Merchant by its ID.
   * @deprecated This feature is in alpha
   */
  merchant?: Maybe<Merchant>;
  /**
   * Get a list of Merchants.
   *
   * You can apply filters, search and sort to refine the list.
   *
   * @deprecated This feature is in alpha
   */
  merchants?: Maybe<Array<Merchant>>;
  /** Access information about the authenticated Profile. */
  profile: Profile;
  /** Look up a Statement by its ID. */
  statement?: Maybe<Statement>;
  /**
   * Get a paginated list of up to 100 Statements.
   *
   */
  statements: StatementConnection;
  /**
   * Look up a Transaction by its ID.
   *
   * See the [Transactions guide](https://www.quiltt.dev/api/core-resources/transactions#the-transaction-query) for more information and examples.
   *
   */
  transaction?: Maybe<Transaction>;
  /**
   * Get a paginated list of up to 100 Transactions. You can apply filters, search and sort to refine the list.
   *
   * See the [Transactions guide](https://www.quiltt.dev/api/core-resources/transactions#the-transactions-query)
   * and the [Pagination guide](https://www.quiltt.dev/api/graphql/pagination) for more information and examples.
   *
   */
  transactions: TransactionConnection;
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryAccountArgs = {
  id: Scalars['ID']['input'];
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryAccountsArgs = {
  filter?: InputMaybe<AccountFilter>;
  search?: InputMaybe<SearchQuery>;
  sort?: InputMaybe<AccountSort>;
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryConnectionArgs = {
  id: Scalars['ID']['input'];
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryConnectionsArgs = {
  filter?: InputMaybe<ConnectionFilter>;
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryHoldingArgs = {
  id: Scalars['ID']['input'];
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryHoldingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryMerchantArgs = {
  id: Scalars['ID']['input'];
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryMerchantsArgs = {
  filter?: InputMaybe<AccountMerchantFilter>;
  sort?: InputMaybe<AccountSort>;
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryStatementArgs = {
  id: Scalars['ID']['input'];
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryStatementsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<StatementFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<StatementSort>;
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryTransactionArgs = {
  id: Scalars['ID']['input'];
};


/** The top-level Query type. Queries are used to fetch data. */
export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<TransactionFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<SearchQuery>;
  sort?: InputMaybe<TransactionSort>;
};

/** Fingoal Enrichment data. */
export type RemoteDataFingoalEnrichedTransaction = {
  __typename?: 'RemoteDataFingoalEnrichedTransaction';
  /** The ID of the account associated with the transaction */
  accountid?: Maybe<Scalars['String']['output']>;
  /** The transaction's USD amount */
  amountnum?: Maybe<Scalars['Float']['output']>;
  /** The most applicable categorization for the transaction */
  category?: Maybe<Scalars['String']['output']>;
  /** The numeric ID of the transaction's category */
  categoryId?: Maybe<Scalars['Float']['output']>;
  /**
   * A cascading hierarchy of the transaction's categories, from high-level to detail-level categorization. This field is deprecated and not recommended for use, as it may not reflect more correct information available in other 'category' fields.
   * @deprecated Deprecated by Fingoal
   */
  categoryLabel?: Maybe<Array<Scalars['String']['output']>>;
  /** Your FinGoal client ID */
  clientId?: Maybe<Scalars['String']['output']>;
  /** A high-level categorization of the account type. Eg, 'bank' */
  container?: Maybe<Scalars['String']['output']>;
  /** The date on which the transaction took place */
  date?: Maybe<Scalars['DateTime']['output']>;
  /** The numeric ID of the transaction's detail category */
  detailCategoryId?: Maybe<Scalars['Float']['output']>;
  /** The transaction's globally unique FinSight API issued ID */
  guid?: Maybe<Scalars['String']['output']>;
  /** The numeric ID of the transaction's high level category */
  highLevelCategoryId?: Maybe<Scalars['Float']['output']>;
  /** Whether the transaction was made at a physical location, or online */
  isPhysical?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the transaction is set to recur on a fixed interval */
  isRecurring?: Maybe<Scalars['Boolean']['output']>;
  /** The street address of the merchant associated with the transaction */
  merchantAddress1?: Maybe<Scalars['String']['output']>;
  /** The name of the city where the merchant is located */
  merchantCity?: Maybe<Scalars['String']['output']>;
  /** The name of the country where the merchant is located */
  merchantCountry?: Maybe<Scalars['String']['output']>;
  /** The latitude of the merchant */
  merchantLatitude?: Maybe<Scalars['String']['output']>;
  /** The URL resource for the merchant's logo */
  merchantLogoUrl?: Maybe<Scalars['String']['output']>;
  /** The longitude of the merchant */
  merchantLongitude?: Maybe<Scalars['String']['output']>;
  /** The name of the merchant associated with the transaction */
  merchantName?: Maybe<Scalars['String']['output']>;
  /** The phone number of the merchant associated with the transaction */
  merchantPhoneNumber?: Maybe<Scalars['String']['output']>;
  /** The name of the state where the merchant is located */
  merchantState?: Maybe<Scalars['String']['output']>;
  /** The merchant's type */
  merchantType?: Maybe<Scalars['String']['output']>;
  /** The ZIP code where the merchant is located */
  merchantZip?: Maybe<Scalars['String']['output']>;
  /** The transaction description as received. This will not change */
  originalDescription?: Maybe<Scalars['String']['output']>;
  /** The date on which FinSight API first received the transaction */
  receiptDate?: Maybe<Scalars['DateTime']['output']>;
  /** A unique ID for the request the transaction came in with, for debugging purposes */
  requestId?: Maybe<Scalars['String']['output']>;
  /** An easy-to-understand, plain-language transaction description */
  simpleDescription?: Maybe<Scalars['String']['output']>;
  /** The source of the transaction */
  sourceId?: Maybe<Scalars['String']['output']>;
  /** A more detailed classification that provides further information on the type of transaction. */
  subType?: Maybe<Scalars['String']['output']>;
  /** The FinSight API issued tags for the transaction */
  transactionTags?: Maybe<Array<Scalars['String']['output']>>;
  /** The ID of the transaction as it was originally submitted */
  transactionid?: Maybe<Scalars['String']['output']>;
  /** An attribute describing the nature of the intent behind the transaction. */
  type?: Maybe<Scalars['String']['output']>;
  /** The ID of the user associated with the transaction, as originally submitted */
  uid?: Maybe<Scalars['String']['output']>;
};

/** Fingoal Insights data. */
export type RemoteDataFingoalUser = {
  __typename?: 'RemoteDataFingoalUser';
  /** Your client ID. */
  clientId?: Maybe<Scalars['String']['output']>;
  /** The user ID. */
  id?: Maybe<Scalars['String']['output']>;
  /** The FinSight API tags that were applied to the user. */
  tags?: Maybe<Array<Scalars['String']['output']>>;
  /** The total number of transactions the user has in FinSight API. */
  totaltransactions?: Maybe<Scalars['Float']['output']>;
  /** The number of transactions since the last time insights were run for the user. */
  transactionsSinceLastUpdate?: Maybe<Scalars['Float']['output']>;
  /** The user's ID. */
  uid?: Maybe<Scalars['String']['output']>;
  /** The user's unique ID in the format of `client_id:uid`. */
  uniqueId?: Maybe<Scalars['String']['output']>;
};

/** Finicity Owner data. */
export type RemoteDataFinicityAccountOwnerDetails = {
  __typename?: 'RemoteDataFinicityAccountOwnerDetails';
  /** List of addresses */
  addresses?: Maybe<Array<RemoteDataFinicityAddresses>>;
  /** List of account owner documentation */
  documentations?: Maybe<Array<RemoteDataFinicityDocumentations>>;
  /** List of emails */
  emails?: Maybe<Array<RemoteDataFinicityEmails>>;
  /** The first name of the account holder */
  firstName?: Maybe<Scalars['String']['output']>;
  /** List of account owner Identity Insights */
  identityInsights?: Maybe<RemoteDataFinicityIdentityInsights>;
  /** The last name of the account holder */
  lastName?: Maybe<Scalars['String']['output']>;
  /** The middle name of the account holder */
  middleName?: Maybe<Scalars['String']['output']>;
  /**
   * The classification of the account holder:
   * * "person / personal / home"
   * * "business"
   * * "other"
   */
  nameClassification?: Maybe<Scalars['String']['output']>;
  /** The confidence score 0 – 1.0 of the name classification. */
  nameClassificationconfidencescore?: Maybe<Scalars['Float']['output']>;
  /** The full name of the account owner. Multiple account owners are returned in one string per the source data from the institution. */
  ownerName?: Maybe<Scalars['String']['output']>;
  /** List of phones */
  phones?: Maybe<Array<RemoteDataFinicityPhones>>;
  /**
   * The type of relationship to the account:
   * * "AUTHORIZED_USER"
   *
   * * "BUSINESS"
   *
   * * "FOR_BENEFIT_OF_PRIMARY"
   *
   * * "FOR_BENEFIT_OF_PRIMARY_JOINT_RESTRICTED"
   *
   * * "FOR_BENEFIT_OF_SECONDARY"
   *
   * * "FOR_BENEFIT_OF_SECONDARY_JOINT_RESTRICTED"
   *
   * * "FOR_BENEFIT_OF_SOLE_OWNER_RESTRICTED"
   *
   * * "POWER_OF_ATTORNEY"
   *
   * * "PRIMARY_JOINT_TENANTS"
   *
   * * "PRIMARY"
   *
   * * "PRIMARY_BORROWER"
   *
   * * "PRIMARY_JOINT"
   *
   * * "SECONDARY"
   *
   * * "SECONDARY_JOINT_TENANTS"
   *
   * * "SECONDARY_BORROWER"
   *
   * * "SECONDARY_JOINT"
   *
   * * "SOLE_OWNER"
   *
   * * "TRUSTEE"
   *
   * * "UNIFORM_TRANSFER_TO_MINOR"
   */
  relationship?: Maybe<Scalars['String']['output']>;
  /** A generational or academic suffix */
  suffix?: Maybe<Scalars['String']['output']>;
};

/** Account owner address */
export type RemoteDataFinicityAddresses = {
  __typename?: 'RemoteDataFinicityAddresses';
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code is Iso3166-1 Alpha-2 code and Alpha 3 standard (max length 3). */
  country?: Maybe<Scalars['String']['output']>;
  /** Address line 1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Address line 2 */
  line2?: Maybe<Scalars['String']['output']>;
  /** Address line 3 */
  line3?: Maybe<Scalars['String']['output']>;
  /** A street address */
  ownerAddress?: Maybe<Scalars['String']['output']>;
  /** A ZIP code */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** State */
  state?: Maybe<Scalars['String']['output']>;
  /**
   * The type of address location:
   * * "Business"
   * * "Home"
   * * "Mailing"
   */
  type?: Maybe<Scalars['String']['output']>;
};

/** Categorization Record */
export type RemoteDataFinicityCategorization = {
  __typename?: 'RemoteDataFinicityCategorization';
  /** Combines the `description` and `memo` data together, removing duplicated information and numbers and special characters */
  bestRepresentation?: Maybe<Scalars['String']['output']>;
  /**
   * The different categories for transactions.
   * * "ATM Fee"
   *
   * * "Advertising"
   *
   * * "Air Travel"
   *
   * * "Alcohol & Bars"
   *
   * * "Allowance"
   *
   * * "Amusement"
   *
   * * "Arts"
   *
   * * "Auto & Transport"
   *
   * * "Auto Insurance"
   *
   * * "Auto Payment"
   *
   * * "Baby Supplies"
   *
   * * "Babysitter & Daycare"
   *
   * * "Bank Fee"
   *
   * * "Bills & Utilities"
   *
   * * "Bonus"
   *
   * * "Books"
   *
   * * "Books & Supplies"
   *
   * * "Business Services"
   *
   * * "Buy"
   *
   * * "Cash & ATM"
   *
   * * "Charity"
   *
   * * "Check"
   *
   * * "Child Support"
   *
   * * "Clothing"
   *
   * * "Coffee Shops"
   *
   * * "Credit Card Payment"
   *
   * * "Dentist"
   *
   * * "Deposit"
   *
   * * "Dividend & Cap Gains"
   *
   * * "Doctor"
   *
   * * "Education"
   *
   * * "Electronics & Software"
   *
   * * "Entertainment"
   *
   * * "Eyecare"
   *
   * * "Fast Food"
   *
   * * "Federal Tax"
   *
   * * "Fees & Charges"
   *
   * * "Finance Charge"
   *
   * * "Financial"
   *
   * * "Financial Advisor"
   *
   * * "Food & Dining"
   *
   * * "Furnishings"
   *
   * * "Gas & Fuel"
   *
   * * "Gift"
   *
   * * "Gifts & Donations"
   *
   * * "Groceries"
   *
   * * "Gym"
   *
   * * "Hair"
   *
   * * "Health & Fitness"
   *
   * * "Health Insurance"
   *
   * * "Hobbies"
   *
   * * "Home"
   *
   * * "Home Improvement"
   *
   * * "Home Insurance"
   *
   * * "Home Phone"
   *
   * * "Home Services"
   *
   * * "Home Supplies"
   *
   * * "Hotel"
   *
   * * "Income"
   *
   * * "Interest Income"
   *
   * * "Internet"
   *
   * * "Investments"
   *
   * * "Kids"
   *
   * * "Kids Activities"
   *
   * * "Late Fee"
   *
   * * "Laundry"
   *
   * * "Lawn & Garden"
   *
   * * "Legal"
   *
   * * "Life Insurance"
   *
   * * "Loan Fees and Charges"
   *
   * * "Loan Insurance"
   *
   * * "Loan Interest"
   *
   * * "Loan Payment"
   *
   * * "Loan Principal"
   *
   * * "Loans"
   *
   * * "Local Tax"
   *
   * * "Low Balance"
   *
   * * "Mobile Phone"
   *
   * * "Mortgage & Rent"
   *
   * * "Movies & DVDs"
   *
   * * "Music"
   *
   * * "Newspapers & Magazines"
   *
   * * "Office Supplies"
   *
   * * "Parking"
   *
   * * "Paycheck"
   *
   * * "Personal Care"
   *
   * * "Pet Food & Supplies"
   *
   * * "Pet Grooming"
   *
   * * "Pets"
   *
   * * "Pharmacy"
   *
   * * "Printing"
   *
   * * "Property Tax"
   *
   * * "Public Transportation"
   *
   * * "Reimbursement"
   *
   * * "Rental Car & Taxi"
   *
   * * "Restaurants"
   *
   * * "Sales Tax"
   *
   * * "Sell"
   *
   * * "Service & Parts"
   *
   * * "Service Fee"
   *
   * * "Shipping"
   *
   * * "Shopping"
   *
   * * "Spa & Massage"
   *
   * * "Sporting Goods"
   *
   * * "Sports"
   *
   * * "State Tax"
   *
   * * "Streaming Services"
   *
   * * "Student Loan"
   *
   * * "Taxes"
   *
   * * "Television"
   *
   * * "Toys"
   *
   * * "Trade Commissions"
   *
   * * "Transfer"
   *
   * * "Transfer for Cash Spending"
   *
   * * "Travel"
   *
   * * "Tuition"
   *
   * * "Uncategorized"
   *
   * * "Utilities"
   *
   * * "Vacation"
   *
   * * "Veterinary"
   *
   * * "Internet / Broadband Charges"
   */
  category?: Maybe<Scalars['String']['output']>;
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country code is Iso3166-1 Alpha-2 code and Alpha 3 standard (max length 3). */
  country?: Maybe<Scalars['String']['output']>;
  /** A normalized payee, derived from the transaction's description and memo fields */
  normalizedPayeeName?: Maybe<Scalars['String']['output']>;
  /** A ZIP code */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** State */
  state?: Maybe<Scalars['String']['output']>;
};

/** Finicity Connection data. */
export type RemoteDataFinicityConnectionDetails = {
  __typename?: 'RemoteDataFinicityConnectionDetails';
  /** Aggregation Status Code */
  aggregationStatusCode?: Maybe<Scalars['String']['output']>;
  /** Customer Id */
  customerId?: Maybe<Scalars['String']['output']>;
  /** Institution Login In */
  institutionLoginId?: Maybe<Scalars['String']['output']>;
};

/** Finicity Account data. */
export type RemoteDataFinicityCustomerAccount = {
  __typename?: 'RemoteDataFinicityCustomerAccount';
  /**
   * The account number from a financial institution in truncated format:
   *
   *   * Last four digits: "1234"
   *
   *   * Last four digits with suffix: "1234-9"
   *
   *   * Full value for string accounts: "john@gmail.com"
   * example: '1234-9'
   */
  accountNumberDisplay?: Maybe<Scalars['String']['output']>;
  /** A timestamp showing the last aggregation attempt, whether successful or not. This will not be present until you have run your first aggregation for the account. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  aggregationAttemptDate?: Maybe<Scalars['BigInt']['output']>;
  /** The status of the most recent aggregation attempt (see [Aggregation Status Codes](https://developer.mastercard.com/open-banking-us/documentation/products/manage/account-aggregation/#aggregation-status-codes)). Won't be present until you have run your first aggregation for the account. */
  aggregationStatusCode?: Maybe<Scalars['Int']['output']>;
  /** A timestamp showing the last successful aggregation of the account. This will not be present until you have run your first aggregation for the account. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  aggregationSuccessDate?: Maybe<Scalars['BigInt']['output']>;
  /** The cleared balance of the account as of `balanceDate` */
  balance?: Maybe<Scalars['Float']['output']>;
  /** A timestamp showing when the balance was captured. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  balanceDate?: Maybe<Scalars['BigInt']['output']>;
  /** A timestamp showing when the account was added to the system. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  createdDate?: Maybe<Scalars['BigInt']['output']>;
  /** A currency code */
  currency?: Maybe<Scalars['String']['output']>;
  /** A customer ID. See Add Customer API for how to create a customer ID. */
  customerId?: Maybe<Scalars['String']['output']>;
  /** Additional customer account details. Not all data points will return for each account type. You can see the account type that each data point will return for in descriptions. The data point are also subject to availability by the institution. */
  detail?: Maybe<RemoteDataFinicityDetail>;
  /**
   * Display position of the account at the financial institution, "1"
   *     being the top listed account
   */
  displayPosition?: Maybe<Scalars['Int']['output']>;
  /** An account ID */
  id?: Maybe<Scalars['String']['output']>;
  /** The ID of a financial institution */
  institutionId?: Maybe<Scalars['String']['output']>;
  /** An institution login ID (from the account record), represented as a number */
  institutionLoginId?: Maybe<Scalars['BigInt']['output']>;
  /** The date of the latest transaction on the account. This will not be present until you have run your first aggregation for the account. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  lastTransactionDate?: Maybe<Scalars['BigInt']['output']>;
  /** A timestamp showing when the account was last modified to the system. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  lastUpdatedDate?: Maybe<Scalars['BigInt']['output']>;
  /** The market segment of the account. Possible values: personal, business */
  marketSegment?: Maybe<Scalars['String']['output']>;
  /** The account name from the institution */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * The account number from the institution
   * @deprecated Deprecated by Finicity
   */
  number?: Maybe<Scalars['String']['output']>;
  /** The date of the oldest transaction in the transactions for the account. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  oldestTransactionDate?: Maybe<Scalars['BigInt']['output']>;
  /** The assigned account ID for the account one level higher in the student loan account hierarchy */
  parentAccount?: Maybe<Scalars['String']['output']>;
  /** Investment holdings */
  position?: Maybe<Array<RemoteDataFinicityPosition>>;
  /** The last 4 digits of the ACH account number */
  realAccountNumberLast4?: Maybe<Scalars['String']['output']>;
  /**
   * "pending" during account discovery, always "active" following
   *   successful account activation
   */
  status?: Maybe<Scalars['String']['output']>;
  /**
   * The list of supported account types.
   * * "checking": Standard checking
   * * "savings": Standard savings
   * * "cd": Certificates of deposit
   * * "moneyMarket": Money Market
   * * "creditCard": Standard credit cards
   * * "lineOfCredit": Home equity, line of credit
   * * "investment": Generic investment (no details)
   * * "investmentTaxDeferred": Generic tax-advantaged investment (no details)
   * * "employeeStockPurchasePlan": ESPP, Employee Stock Ownership Plans (ESOP), Stock Purchase Plans
   * * "ira": Individual Retirement Account (not Rollover or Roth)
   * * "401k": 401K Plan
   * * "roth": Roth IRA, Roth 401K
   * * "403b": 403B Plan
   * * "529plan": 529 Plan (True value is 529)
   * * "rollover": Rollover IRA
   * * "ugma": Uniform Gifts to Minors Act
   * * "utma": Uniform Transfers to Minors Act
   * * "keogh": Keogh Plan
   * * "457plan": 457 Plan (True value is 457)
   * * "401a": 401A Plan
   * * "brokerageAccount": Brokerage Account
   * * "educationSavings": Education Savings Account that is not a 529
   * * "healthSavingsAccount": HSA (Health Savings Accounts)
   * * "pension": Pension
   * * "profitSharingPlan": Profit Sharing Plan
   * * "roth401k": Roth 401K
   * * "sepIRA": Simplified Employee Pension IRA
   * * "simpleIRA": Simple IRA
   * * "thriftSavingsPlan": Thrift Savings Plan
   * * "variableAnnuity": Variable Annuity
   * * "cryptocurrency": Cryptocurrency Wallet, Cryptocurrency Account
   * * "mortgage": Standard Mortgages
   * * "loan": Auto loans, equity loans, other loans
   * * "studentLoan": Student Loan
   * * "studentLoanGroup": Student Loan Group
   * * "studentLoanAccount": Student Loan Account
   */
  type?: Maybe<Scalars['String']['output']>;
};

/** Finicity Holding data. */
export type RemoteDataFinicityCustomerAccountPosition = {
  __typename?: 'RemoteDataFinicityCustomerAccountPosition';
  /** An asset class is a grouping of comparable financial securities. These include equities (stocks), fixed income (bonds), and cash equivalent or money market instruments. (DOMESTICBOND, LARGESTOCK, INTLSTOCK, MONEYMRKT, OTHER) */
  assetClass?: Maybe<Scalars['String']['output']>;
  /** The percent change in value since the previous day */
  changePercent?: Maybe<Scalars['Float']['output']>;
  /** The total cost of acquiring the security */
  costBasis?: Maybe<Scalars['Float']['output']>;
  /** The per share cost of acquiring the security */
  costBasisPerShare?: Maybe<Scalars['Float']['output']>;
  /** Currency rate, ratio of currency to original currency */
  currencyRate?: Maybe<Scalars['Float']['output']>;
  /** The current price of the investment holding */
  currentPrice?: Maybe<Scalars['Float']['output']>;
  /** A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  currentPriceDate?: Maybe<Scalars['BigInt']['output']>;
  /** The value amount change since the previous day */
  dailyChange?: Maybe<Scalars['Float']['output']>;
  /** The description of the holding */
  description?: Maybe<Scalars['String']['output']>;
  /** Financial Institution (FI) defined asset class (COMMON STOCK, COMNEQTY, EQUITY/STOCK, CMA-ISA, CONVERTIBLE PREFERREDS, CORPORATE BONDS, OTHER MONEY FUNDS, ALLOCATION FUNDS, CMA-TAXABLE, FOREIGNEQUITYADRS, COMMONSTOCK, PREFERRED STOCKS, STABLE VALUE, FOREIGN EQUITY ADRS) */
  fiAssetClass?: Maybe<Scalars['String']['output']>;
  /** The type of the holding */
  holdType?: Maybe<Scalars['String']['output']>;
  /** The ID of the investment position */
  id?: Maybe<Scalars['BigInt']['output']>;
  /** The security type for the investment holding */
  invSecurityType?: Maybe<Scalars['String']['output']>;
  /** Market value of an investment position at the time of retrieval */
  marketValue?: Maybe<Scalars['Float']['output']>;
  /** Type of mutual fund, such as open ended */
  mfType?: Maybe<Scalars['String']['output']>;
  /** Expiration date of option */
  optionExpireDate?: Maybe<Scalars['Date']['output']>;
  /** The number of shares per option contract */
  optionSharesPerContract?: Maybe<Scalars['Float']['output']>;
  /** The strike price of the option contract */
  optionStrikePrice?: Maybe<Scalars['Float']['output']>;
  /** The type of option contract (PUT or CALL) */
  optionType?: Maybe<Scalars['String']['output']>;
  /** Fund type assigned by the FI (long or short) */
  posType?: Maybe<Scalars['String']['output']>;
  /** Symbol for the currency that the account is being converted into */
  securityCurrency?: Maybe<Scalars['String']['output']>;
  /** The security ID of the transaction */
  securityId?: Maybe<Scalars['String']['output']>;
  /**
   * The security type. This field is related to the `securityId` field. Possible values:
   * * "CUSIP"
   *
   * * "ISIN"
   *
   * * "SEDOL"
   *
   * * "SICC"
   *
   * * "VALOR"
   *
   * * "WKN"
   */
  securityIdType?: Maybe<Scalars['String']['output']>;
  /** The security name for the investment holding */
  securityName?: Maybe<Scalars['String']['output']>;
  /** Type of security for the investment position */
  securityType?: Maybe<Scalars['String']['output']>;
  /** The status of the holding */
  status?: Maybe<Scalars['String']['output']>;
  /** The subaccount's type, such as cash */
  subAccountType?: Maybe<Scalars['String']['output']>;
  /** The investment position's market ticker symbol */
  symbol?: Maybe<Scalars['String']['output']>;
  /** The current day's gain and loss of the position at the time of aggregation in dollars */
  todayGlDollar?: Maybe<Scalars['Float']['output']>;
  /** The current day's gain and loss of the position at the time of aggregation in percentage */
  todayGlPercent?: Maybe<Scalars['Float']['output']>;
  /** Total gain and loss of the position at the time of aggregation in dollars */
  totalGlDollar?: Maybe<Scalars['Float']['output']>;
  /** Total gain and loss of the position at the time of aggregation in percentage */
  totalGlPercent?: Maybe<Scalars['Float']['output']>;
  /** The transaction type of the holding, such as cash, margin, and more */
  transactionType?: Maybe<Scalars['String']['output']>;
  /** The number of units of the holding */
  units?: Maybe<Scalars['Float']['output']>;
};

/** Additional customer account details. Not all data points will return for each account type. You can see the account type that each data point will return for in descriptions. The data point are also subject to availability by the institution. */
export type RemoteDataFinicityDetail = {
  __typename?: 'RemoteDataFinicityDetail';
  /** (Investment) After-tax amount of total balance */
  afterTaxAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Enrolled in autopay (F/Y) */
  autoPayEnrolled?: Maybe<Scalars['Boolean']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) and (Mortgage/Loan) The available balance (typically the current balance with adjustments for any pending transactions) */
  availableBalanceAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Amount available for cash withdrawal */
  availableCashBalance?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Balloon payment amount */
  balloonAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Money available to buy securities */
  buyPower?: Maybe<Scalars['Float']['output']>;
  /** Cash account allowed indicator (true / false) */
  cashAccountAllowed?: Maybe<Scalars['Boolean']['output']>;
  /** (Credit Card/Line Of Credit) Currently available cash advance */
  cashAdvanceAvailableAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Balance of current cash advance */
  cashAdvanceBalance?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Interest rate for cash advances */
  cashAdvanceInterestRate?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Maximum cash advance amount */
  cashAdvanceMaxAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Cash balance of account */
  cashBalanceAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Collateral on loan */
  collateral?: Maybe<Scalars['String']['output']>;
  /** (Investment) Total year to date contributions */
  contribTotalYtd?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The date the loan enters into repayment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  convertToRepayment?: Maybe<Scalars['BigInt']['output']>;
  /** (Credit Card/Line Of Credit) The available credit (typically the credit limit minus the current balance) */
  creditAvailableAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) The account's credit limit */
  creditMaxAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) and (Investment) Current balance */
  currentBalance?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Current loan balance */
  currentLoanBalance?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Current school */
  currentSchool?: Maybe<Scalars['String']['output']>;
  /** (All Account Types) Most recent date of the following information. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  dateAsOf?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The number of days past a due date that a payment should have been made */
  daysDelinquent?: Maybe<Scalars['Int']['output']>;
  /** (Mortgage/Loan) Description of loan */
  description?: Maybe<Scalars['String']['output']>;
  /** (Investment) Employer matched contributions */
  empMatchAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Employer pretax contribution amount */
  empPretaxContribAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Employer pretax contribution amount year to date */
  empPretaxContribAmountYtd?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Ending balance */
  endingBalanceAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) The escrow balance */
  escrowBalance?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The expected date of the payoff date. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  expectedPayoffDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The total outstanding fees balance */
  feesBalance?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) First mortgage (F/Y) */
  firstMortgage?: Maybe<Scalars['Boolean']['output']>;
  /** (Mortgage/Loan) First payment due date. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  firstPaymentDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The financial institution guarantor of the loan (who will pay the loan amount to the owner if the borrower defaults) */
  guarantor?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) Initial interest rate of loan */
  initialInterestRate?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Original loan amount */
  initialMlAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Original date of loan. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  initialMlDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The total outstanding interest balance */
  interestBalance?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Interest paid since inception of loan (life to date) */
  interestPaidLtd?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Period of interest */
  interestPeriod?: Maybe<Scalars['String']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Interest earned in prior year */
  interestPriorYtdAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) and (Mortgage/Loan) The account's current interest rate */
  interestRate?: Maybe<Scalars['String']['output']>;
  /** (Mortgage/Loan) Type of interest rate */
  interestRateType?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) The indication of the presence of an interest subsidy (i.e. subsidized) */
  interestSubsidyType?: Maybe<Scalars['String']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Interest accrued year-to-date */
  interestYtdAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) and (Mortgage/Loan) The amount received in the last payment */
  lastPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) The date of the last payment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  lastPaymentDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Due date of last payment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  lastPaymentDueDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Amount towards escrow in last payment */
  lastPaymentEscrowAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Amount of interest in last payment */
  lastPaymentInterestAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Amount of last fee in last payment */
  lastPaymentLastFeeAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Amount of late charge in last payment */
  lastPaymentLateCharge?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Amount towards principal in last payment */
  lastPaymentPrincipalAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) The date of the last payment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  lastPaymentReceiveDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Late fee charged */
  lateFeeAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Owner of loan */
  lender?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) The federal unique loan identifying number */
  loanAwardId?: Maybe<Scalars['String']['output']>;
  /** (Mortgage/Loan) Frequency of payments (monthly, etc.) */
  loanPaymentFreq?: Maybe<Scalars['String']['output']>;
  /** (Mortgage/Loan) Type of loan payment */
  loanPaymentType?: Maybe<Scalars['String']['output']>;
  /** (Investment) Interest rate of loan */
  loanRate?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The repayment status phase (i.e. In School, Grace, Repayment, Deferment, Forbearance) */
  loanStatus?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) The end date of the current status. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  loanStatusEndDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The start date of the current status. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  loanStatusStartDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Type of loan term */
  loanTermType?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) Loan fees paid year-to-date */
  loanYtdFeesPaid?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) Loan interest paid year-to-date */
  loanYtdInterestPaid?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) Loan principal paid year-to-date */
  loanYtdPrincipalPaid?: Maybe<Scalars['Float']['output']>;
  /** Margin trading indicator (true / false) */
  marginAllowed?: Maybe<Scalars['Boolean']['output']>;
  /** (Investment) Net interest earned after deducting interest paid out */
  marginBalance?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Amount matched */
  matchAmount?: Maybe<Scalars['Float']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Maturity date of account type. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  maturityDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Investment) amount payable to an investor at maturity */
  maturityValueAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Holder of the mortgage or loan */
  mlHolderName?: Maybe<Scalars['String']['output']>;
  /** (Mortgage/Loan) Minimum payment due */
  nextPayment?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Due date for the next payment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  nextPaymentDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Amount of interest in next payment */
  nextPaymentInterestAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Amount towards principal in next payment */
  nextPaymentPrincipalAmount?: Maybe<Scalars['Float']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Date when account was opened. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  openDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The original interest rate to which the loan was disbursed, in APY */
  originalInterestRate?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Original date of loan maturity. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  originalMaturityDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Original school */
  originalSchool?: Maybe<Scalars['String']['output']>;
  /** (Investment) Other nonvested amount */
  otherNonvestAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Other vested amount */
  otherVestAmount?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The date the borrower graduated or dropped below half-time enrollment in school. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  outOfSchoolDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) Owner of the loan */
  owner?: Maybe<Scalars['String']['output']>;
  /** (Credit Card/Line Of Credit) Balance past due */
  pastDueAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Due date for the next payment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  paymentDueDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Credit Card/Line Of Credit) and (Mortgage/Loan) Minimum payment due */
  paymentMinAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Number of payments made */
  paymentsMade?: Maybe<Scalars['Int']['output']>;
  /** (Mortgage/Loan) Number of payments remaining before loan is paid off */
  paymentsRemaining?: Maybe<Scalars['Int']['output']>;
  /** (Mortgage/Loan) The amount required to payoff the loan */
  payoffAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Date of final payment. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  payoffAmountDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Amount deposited in period */
  periodDepositAmount?: Maybe<Scalars['Float']['output']>;
  /** End date of period. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  periodEndDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Interest accrued during the current period */
  periodInterestAmount?: Maybe<Scalars['Float']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) The APY for the current period interest rate */
  periodInterestRate?: Maybe<Scalars['Float']['output']>;
  /** (Checking/Savings/CD/MoneyMarket) Start date of period. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  periodStartDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Investment) Pre-tax amount of total balance */
  preTaxAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Prior balance in last statement */
  previousBalance?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) The principal balance */
  principalBalance?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Amount of balance for profit sharing */
  profitSharingAmount?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Projected interest on the loan */
  projectedInterest?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Recurring payment amount */
  recurringPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The number of months still outstanding on a loan */
  remainingTermOfMl?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Type of repayment plan for the student loan */
  repaymentPlan?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) The end date of the current repayment plan. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  repaymentPlanEndDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Student Loan) The start date of the current repayment plan. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  repaymentPlanStartDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Credit Card/Line Of Credit) Earned reward balance */
  rewardEarnedBalance?: Maybe<Scalars['Int']['output']>;
  /** (Investment) Amount of balance rolled over from original account (401k, etc.) */
  rolloverAmount?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Life to date of money rolled over */
  rolloverLtd?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Sum of short balance */
  shortBalance?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Balance of statement at close */
  statementCloseBalance?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Credit amount applied in statement period */
  statementCreditAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) End date of statement period. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  statementEndDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Credit Card/Line Of Credit) Finance amount of statement period */
  statementFinanceAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Purchase amount of statement period */
  statementPurchaseAmount?: Maybe<Scalars['Float']['output']>;
  /** (Credit Card/Line Of Credit) Start date of statement period. A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  statementStartDate?: Maybe<Scalars['BigInt']['output']>;
  /** (Mortgage/Loan) Length of loan in months */
  termOfMl?: Maybe<Scalars['String']['output']>;
  /** (Student Loan) The total amount paid */
  totalAmountPaid?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The total amount paid towards interest */
  totalInterestPaid?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The total amount paid towards the principal balance */
  totalPrincipalPaid?: Maybe<Scalars['Float']['output']>;
  /** (Investment) Vested amount in account */
  vestedBalance?: Maybe<Scalars['Float']['output']>;
  /** (Student Loan) The interest rate of multiple interest rates and balances at the group level, in APY */
  weightedInterestRate?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Insurance paid year-to-date */
  ytdInsurancePaid?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Interest paid year-to-date */
  ytdInterestPaid?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Principal paid year-to-date */
  ytdPrincipalPaid?: Maybe<Scalars['Float']['output']>;
  /** (Mortgage/Loan) Tax paid year-to-date */
  ytdTaxPaid?: Maybe<Scalars['Float']['output']>;
};

/** Account owner documentation */
export type RemoteDataFinicityDocumentations = {
  __typename?: 'RemoteDataFinicityDocumentations';
  /**
   * A federal or state issued identification number in alphanumeric characters.
   * * **United States**:
   *
   *   * Passport: 6-9 digits.
   *
   *   * US Visa: 8 digits.
   *
   *   * Driver's license: 1-19 digits
   * * **Canada**:
   *
   *   * Passport: 8 digits
   *
   *   * Driver: 6-9 digits
   */
  governmentId?: Maybe<Scalars['String']['output']>;
  /**
   * Country specific tax ID associated with the customer.
   * * **United Stated**: Social Security number (SSN) or Taxpayer Identification Number (TIN)
   *
   *   * Format: 123-45-7890
   *
   * * **Canada**: Social Insurance Number (SIM) or Numero d'assurance sociale (NAS)
   *
   *   * Format: 123-456-789
   */
  taxId?: Maybe<Scalars['String']['output']>;
  /** Country code is Iso3166-1 Alpha-2 code and Alpha 3 standard (max length 3). */
  taxIdCountry?: Maybe<Scalars['String']['output']>;
};

/** Account owner email */
export type RemoteDataFinicityEmails = {
  __typename?: 'RemoteDataFinicityEmails';
  /** An email address */
  email?: Maybe<Scalars['String']['output']>;
  /**
   * The account owner's email type.
   *
   * * "Personal"
   *
   * * "Business"
   */
  emailType?: Maybe<Scalars['String']['output']>;
  /** The email is primary. */
  isPrimary?: Maybe<Scalars['Boolean']['output']>;
};

/** List of account owner Identity Insights */
export type RemoteDataFinicityIdentityInsights = {
  __typename?: 'RemoteDataFinicityIdentityInsights';
  /**
   * The match status between the input name and the queried entity.
   * * not-found
   * * match
   * * no-match
   */
  addressToName?: Maybe<Scalars['String']['output']>;
  /**
   * The most granular level to which the address could be validated. Ex. If the address was only valid to the city level (but not to the house level), it would return “valid_to_city”.
   *   * missing_address - An input address was not provided.
   *
   *   * invalid - The input address is not valid.
   *
   *   * valid - The input address is valid.
   *
   *   * valid_to_country - The input address could only be validated to the
   * country level. This means the country of the input address is valid, but the other elements of the input address were unable to be confirmed as valid or invalid.
   *
   *   * valid_to_city - The input address was validated to the city level.
   * This means the country, state, city, and postal code of the input address are valid, but the street, house number, and subpremise of the input address were unable to be confirmed as valid or invalid.
   *
   *   * valid_to_street - The input address was validated to the street
   * level. This means the country, state, city, postal code, and street of the input address are valid, but the house number and subpremise of the input address were unable to be confirmed as valid or invalid.
   *
   *     * valid_to_house_number - The input address was validated to the
   * street and house number level. This means the country, state, city, postal code, street, and house number of the input address are valid, but the subpremise of the input address was unable to be confirmed as valid or invalid.
   *
   *     * valid_to_house_number_missing_apt - The input address was
   * validated to the street and house number level. This means the country, state, city, postal code, street, and house number of the input address are valid, but the subpremise of the input address was missing and thus unable to be confirmed as valid or invalid.
   */
  addressValidityLevel?: Maybe<Scalars['Float']['output']>;
  /** Returns a date that the email domain was created. */
  emailDomainCreationDate?: Maybe<Scalars['String']['output']>;
  /** Count of days since the email was first observed in Ekata's Identity Network. If the email has not been observed before, first_seen_days will be 0. */
  emailFirstSeenDays?: Maybe<Scalars['Float']['output']>;
  /**
   * The match status between the input name and the queried entity.
   * * not found
   * * match
   * * no-match
   */
  emailToName?: Maybe<Scalars['String']['output']>;
  /** Comprehensive network score built on behavioral insights such as velocity, popularity, volatility, and age of an attribute, with a higher score indicating a riskier account sign-up. A number between 0 and 1 rounded to three decimal places. */
  identityNetworkScore?: Maybe<Scalars['Float']['output']>;
  /** Comprehensive identity risk score with a higher score indicating a riskier account sign-up. */
  identityRiskScore?: Maybe<Scalars['Float']['output']>;
  /** The distance (in miles) between the IP address and the physical address. */
  ipAddressDistance?: Maybe<Scalars['Float']['output']>;
  /** The ISO-3166 alpha-2 country code associated with the geolocation of the IP address. */
  ipGeolocationCountryCode?: Maybe<Scalars['String']['output']>;
  /** More granular detail about the IP address location. */
  ipGeolocationSubdivision?: Maybe<Scalars['String']['output']>;
  /** Count of days since the IP address was last observed in Ekata's Identity Network. If the IP address has not been observed before, IpLastSeenDays will be 0. */
  ipLastSeenDays?: Maybe<Scalars['Float']['output']>;
  /** The distance (in miles) between the IP address and the closest physical address associated with the phone number. */
  ipPhoneDistance?: Maybe<Scalars['Float']['output']>;
  /** True if the IP address is considered risky, based on multiple IP data points and velocity calculations. */
  ipRisk?: Maybe<Scalars['Float']['output']>;
  /** Comprehensive risk score associated with an IP address, with a higher score indicating a riskier IP address. A number between 0 and 1 rounded to three decimal places. */
  ipRiskScore?: Maybe<Scalars['Float']['output']>;
  /** True if the email address is valid. */
  isEmailValid?: Maybe<Scalars['Boolean']['output']>;
  /** True if the phone number is valid. */
  isPhoneValid?: Maybe<Scalars['Boolean']['output']>;
  /** The company that provides voice and/or data services for the phone number. Carriers are returned at the MVNO level. */
  phoneCarrier?: Maybe<Scalars['String']['output']>;
  /** The ISO-3166 alpha-2 country code associated with the phone number. */
  phoneCountryCode?: Maybe<Scalars['String']['output']>;
  /** Count of days since the combination of phone and email was first observed in Ekata's Identity Network. If that combination has not been observed before, `phoneEmailFirstSeenDays` will be 0. */
  phoneEmailFirstSeenDays?: Maybe<Scalars['Float']['output']>;
  /** Count of days since the phone was last observed in Ekata's Identity Network. If the phone has not been observed before, `phoneLastSeenDays` will be 0. */
  phoneLastSeenDays?: Maybe<Scalars['Float']['output']>;
  /**
   * The line type of the phone number.
   * * landline - traditional wired phone line.
   * * fixed-voip - VoIP-based fixed line phones.
   * * mobile - wireless phone line.
   * * voicemail - voicemail-only service.
   * * toll-free - callee pays for call.
   * * premium - caller pays a premium for the call-e.g., 976 area code.
   * * non-fixed-voip - Skype, for example * other - anything that does not match the previous categories.
   */
  phoneLineType?: Maybe<Scalars['String']['output']>;
  /**
   * The match status between the input phone and the queried entity.
   * * match - Phone location matches input address line 1, address line 2, city, state, and postal code.
   *
   * * postal-match - Phone location postal code matches input address postal code.
   *
   * * zip4-match - Phone location postal code zip+4 matches input address postal code zip+4.
   *
   * * city-state-match - Phone location city and state matches input address city and state.
   * * metro-match - Phone location is in the same metro area as input address.
   *
   * * country-match - Phone location country matches input address country.
   *
   * * no-match - Phone location does not match input address.
   */
  phoneToAddress?: Maybe<Scalars['String']['output']>;
  /**
   * The match status between the input name and the queried entity.
   *
   * * not-found
   *
   * * match
   *
   * * no-match
   */
  phoneToName?: Maybe<Scalars['String']['output']>;
  warnings?: Maybe<Array<Scalars['String']['output']>>;
};

/** Consumer phone */
export type RemoteDataFinicityPhones = {
  __typename?: 'RemoteDataFinicityPhones';
  /** Country calling code of the phone number as defined by ITU-T E.123 and E.164 international standards (max length 3)". */
  country?: Maybe<Scalars['String']['output']>;
  /** A phone number (max length 15). */
  phone?: Maybe<Scalars['String']['output']>;
  /**
   * The account owner's phone type:
   *
   * * "HOME"
   *
   * * "BUSINESS"
   *
   * * "CELL"
   *
   * * "FAX"
   */
  type?: Maybe<Scalars['String']['output']>;
};

/** Details for investment account holdings */
export type RemoteDataFinicityPosition = {
  __typename?: 'RemoteDataFinicityPosition';
  /** An asset class is a grouping of comparable financial securities. These include equities (stocks), fixed income (bonds), and cash equivalent or money market instruments. (DOMESTICBOND, LARGESTOCK, INTLSTOCK, MONEYMRKT, OTHER) */
  assetClass?: Maybe<Scalars['String']['output']>;
  /** The percent change in value since the previous day */
  changePercent?: Maybe<Scalars['Float']['output']>;
  /** The total cost of acquiring the security */
  costBasis?: Maybe<Scalars['Float']['output']>;
  /** The per share cost of acquiring the security */
  costBasisPerShare?: Maybe<Scalars['Float']['output']>;
  /** Currency rate, ratio of currency to original currency */
  currencyRate?: Maybe<Scalars['Float']['output']>;
  /** The current price of the investment holding */
  currentPrice?: Maybe<Scalars['Float']['output']>;
  /** A date in Unix epoch time (in seconds). See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  currentPriceDate?: Maybe<Scalars['BigInt']['output']>;
  /** The value amount change since the previous day */
  dailyChange?: Maybe<Scalars['Float']['output']>;
  /** The description of the holding */
  description?: Maybe<Scalars['String']['output']>;
  /** Financial Institution (FI) defined asset class (COMMON STOCK, COMNEQTY, EQUITY/STOCK, CMA-ISA, CONVERTIBLE PREFERREDS, CORPORATE BONDS, OTHER MONEY FUNDS, ALLOCATION FUNDS, CMA-TAXABLE, FOREIGNEQUITYADRS, COMMONSTOCK, PREFERRED STOCKS, STABLE VALUE, FOREIGN EQUITY ADRS) */
  fiAssetClass?: Maybe<Scalars['String']['output']>;
  /** The type of the holding */
  holdType?: Maybe<Scalars['String']['output']>;
  /** The ID of the investment position */
  id?: Maybe<Scalars['BigInt']['output']>;
  /** The security type for the investment holding */
  invSecurityType?: Maybe<Scalars['String']['output']>;
  /** Market value of an investment position at the time of retrieval */
  marketValue?: Maybe<Scalars['Float']['output']>;
  /** Type of mutual fund, such as open ended */
  mfType?: Maybe<Scalars['String']['output']>;
  /** Expiration date of option */
  optionExpireDate?: Maybe<Scalars['Date']['output']>;
  /** The number of shares per option contract */
  optionSharesPerContract?: Maybe<Scalars['Float']['output']>;
  /** The strike price of the option contract */
  optionStrikePrice?: Maybe<Scalars['Float']['output']>;
  /** The type of option contract (PUT or CALL) */
  optionType?: Maybe<Scalars['String']['output']>;
  /** Fund type assigned by the FI (long or short) */
  posType?: Maybe<Scalars['String']['output']>;
  /** Symbol for the currency that the account is being converted into */
  securityCurrency?: Maybe<Scalars['String']['output']>;
  /** The security ID of the transaction */
  securityId?: Maybe<Scalars['String']['output']>;
  /**
   * The security type. This field is related to the `securityId` field. Possible values:
   * * "CUSIP"
   *
   * * "ISIN"
   *
   * * "SEDOL"
   *
   * * "SICC"
   *
   * * "VALOR"
   *
   * * "WKN"
   */
  securityIdType?: Maybe<Scalars['String']['output']>;
  /** The security name for the investment holding */
  securityName?: Maybe<Scalars['String']['output']>;
  /** Type of security for the investment position */
  securityType?: Maybe<Scalars['String']['output']>;
  /** The status of the holding */
  status?: Maybe<Scalars['String']['output']>;
  /** The subaccount's type, such as cash */
  subAccountType?: Maybe<Scalars['String']['output']>;
  /** The investment position's market ticker symbol */
  symbol?: Maybe<Scalars['String']['output']>;
  /** The current day's gain and loss of the position at the time of aggregation in dollars */
  todayGlDollar?: Maybe<Scalars['Float']['output']>;
  /** The current day's gain and loss of the position at the time of aggregation in percentage */
  todayGlPercent?: Maybe<Scalars['Float']['output']>;
  /** Total gain and loss of the position at the time of aggregation in dollars */
  totalGlDollar?: Maybe<Scalars['Float']['output']>;
  /** Total gain and loss of the position at the time of aggregation in percentage */
  totalGlPercent?: Maybe<Scalars['Float']['output']>;
  /** The transaction type of the holding, such as cash, margin, and more */
  transactionType?: Maybe<Scalars['String']['output']>;
  /** The number of units of the holding */
  units?: Maybe<Scalars['Float']['output']>;
};

/** Finicity Transaction data. */
export type RemoteDataFinicityTransaction = {
  __typename?: 'RemoteDataFinicityTransaction';
  /** An account ID represented as a number */
  accountId?: Maybe<Scalars['BigInt']['output']>;
  /** The total amount of the transaction. Transactions for deposits are positive values, withdrawals and debits are negative values. */
  amount?: Maybe<Scalars['Float']['output']>;
  /** Categorization Record */
  categorization?: Maybe<RemoteDataFinicityCategorization>;
  /** The check number of the transaction */
  checkNum?: Maybe<Scalars['String']['output']>;
  /** Transaction commission */
  commissionAmount?: Maybe<Scalars['Int']['output']>;
  /** A date in Unix epoch time (in seconds). Represents the timestamp of the transaction when it was added to our platform. See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  createdDate?: Maybe<Scalars['BigInt']['output']>;
  /** If the foreign amount value is present then this is the currency code of that foreign amount */
  currencySymbol?: Maybe<Scalars['String']['output']>;
  /** A customer ID represented as a number. See Add Customer API for how to create a customer ID. */
  customerId?: Maybe<Scalars['BigInt']['output']>;
  /** The description value is from the financial institution (FI), often known as the payee. The value "No description provided by institution" is returned when the FI doesn't provide one */
  description?: Maybe<Scalars['String']['output']>;
  /** A date in Unix epoch time (in seconds). Represents the timestamp of the transaction when it became effective on an account by an institution. See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  effectiveDate?: Maybe<Scalars['BigInt']['output']>;
  /** The portion of the transaction allocated to escrow */
  escrowAmount?: Maybe<Scalars['Float']['output']>;
  /** The portion of the overall transaction amount applied to fees */
  feeAmount?: Maybe<Scalars['Float']['output']>;
  /** A date in Unix epoch time (in seconds). Represents the first timestamp of the transaction recorded in the `effectiveDate` field. See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  firstEffectiveDate?: Maybe<Scalars['BigInt']['output']>;
  /** A transaction ID */
  id?: Maybe<Scalars['BigInt']['output']>;
  /** Capital gains applied in short, long, or miscellaneous terms for tax purposes */
  incomeType?: Maybe<Scalars['String']['output']>;
  /** The portion of the transaction allocated to interest */
  interestAmount?: Maybe<Scalars['Float']['output']>;
  /**
   * Keywords in the `description` and `memo` fields were used to translate investment transactions into these types.
   *
   * Possible values:
   * * "cancel"
   *
   * * "purchaseToClose"
   *
   * * "purchaseToCover"
   *
   * * "contribution"
   *
   * * "optionExercise"
   *
   * * "optionExpiration"
   *
   * * "fee"
   *
   * * "soldToClose"
   *
   * * "soldToOpen"
   *
   * * "split"
   *
   * * "transfer"
   *
   * * "returnOfCapital"
   *
   * * "income"
   *
   * * "purchased"
   *
   * * "sold"
   *
   * * "dividendReinvest"
   *
   * * "tax"
   *
   * * "dividend"
   *
   * * "reinvestOfIncome"
   *
   * * "interest"
   *
   * * "deposit"
   *
   * * "otherInfo"
   */
  investmentTransactionType?: Maybe<Scalars['String']['output']>;
  /** The institution must provide either a description, a memo, or both. We recommended concatenating the two fields into a single value. */
  memo?: Maybe<Scalars['String']['output']>;
  /** A date in Unix epoch time (in seconds). Represents the timestamp of the transaction expiration date when it became expires on an account by an institution. See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  optionExpireDate?: Maybe<Scalars['BigInt']['output']>;
  /** The strike price of the option contract */
  optionStrikePrice?: Maybe<Scalars['Float']['output']>;
  /** A date in Unix epoch time (in seconds). Represents the timestamp of the transaction when it was posted or cleared by the institution. This value isn't required for student loan transaction data. See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  postedDate?: Maybe<Scalars['BigInt']['output']>;
  /** The portion of the transaction allocated to principal */
  principalAmount?: Maybe<Scalars['Float']['output']>;
  /** The ending balance after the transaction was posted */
  runningBalanceAmount?: Maybe<Scalars['Float']['output']>;
  /** The security ID of the transaction */
  securityId?: Maybe<Scalars['String']['output']>;
  /**
   * The security type. This field is related to the `securityId` field. Possible values:
   * * "CUSIP"
   *
   * * "ISIN"
   *
   * * "SEDOL"
   *
   * * "SICC"
   *
   * * "VALOR"
   *
   * * "WKN"
   */
  securityIdType?: Maybe<Scalars['String']['output']>;
  /** Shares per contract of the underlying stock option */
  sharesPerContract?: Maybe<Scalars['Float']['output']>;
  /** Denominator of the stock split for the transaction */
  splitDenominator?: Maybe<Scalars['Float']['output']>;
  /** Numerator of the stock split for the transaction */
  splitNumerator?: Maybe<Scalars['Float']['output']>;
  /** One of "active", "pending", or "shadow" (see [Transaction Status](https://developer.mastercard.com/open-banking-us/documentation/products/manage/transaction-data/#transaction-status)) */
  status?: Maybe<Scalars['String']['output']>;
  /** The sub account where the funds came from */
  subAccountFund?: Maybe<Scalars['String']['output']>;
  /** The type of sub account the funds came from */
  subaccountSecurityType?: Maybe<Scalars['String']['output']>;
  /** Temporarily hold funds if you overpay or underpay your monthly payment */
  suspenseAmount?: Maybe<Scalars['Float']['output']>;
  /** Taxes applicable to the investment trade */
  taxesAmount?: Maybe<Scalars['Int']['output']>;
  /** Ticker symbol for the investment related to the transaction */
  ticker?: Maybe<Scalars['String']['output']>;
  /** A date in Unix epoch time (in seconds). Represents the timestamp of the transaction when it occurred. See: [Handling Epoch Dates and Times](https://developer.mastercard.com/open-banking-us/documentation/codes-and-formats/). */
  transactionDate?: Maybe<Scalars['BigInt']['output']>;
  /**
   * If provided by the institution, the following values may be returned in the field of a record:
   * * "atm"
   *
   * * "cash"
   *
   * * "check"
   *
   * * "credit"
   *
   * * "debit"
   *
   * * "deposit"
   *
   * * "directDebit"
   *
   * * "directDeposit"
   *
   * * "dividend"
   *
   * * "fee"
   *
   * * "interest"
   *
   * * "other"
   *
   * * "payment"
   *
   * * "pointOfSale"
   *
   * * "repeatPayment"
   *
   * * "serviceCharge"
   *
   * * "transfer"
   */
  type?: Maybe<Scalars['String']['output']>;
  /** Share price for the investment unit: stocks, mutual funds, ETFs */
  unitPrice?: Maybe<Scalars['Float']['output']>;
  /** The number of units (individual shares) in the transaction */
  unitQuantity?: Maybe<Scalars['Int']['output']>;
};

/** Mock Account data. */
export type RemoteDataMockAccount = {
  __typename?: 'RemoteDataMockAccount';
  /** Balance */
  balance?: Maybe<Scalars['String']['output']>;
  /**
   * Balance Type
   * @deprecated Removed
   */
  balanceSheetClass?: Maybe<Scalars['String']['output']>;
  /** Currency Code */
  currency?: Maybe<Scalars['String']['output']>;
  /** ID */
  id?: Maybe<Scalars['String']['output']>;
  /** Last Four */
  mask?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Type */
  type?: Maybe<Scalars['String']['output']>;
};

/** Address */
export type RemoteDataMockAddress = {
  __typename?: 'RemoteDataMockAddress';
  /** City */
  city?: Maybe<Scalars['String']['output']>;
  /** Country */
  country?: Maybe<Scalars['String']['output']>;
  /** Line 1 */
  line1?: Maybe<Scalars['String']['output']>;
  /** Postal Code */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** State */
  region?: Maybe<Scalars['String']['output']>;
};

/** Mock Connection data. */
export type RemoteDataMockConnection = {
  __typename?: 'RemoteDataMockConnection';
  /** ID */
  id?: Maybe<Scalars['String']['output']>;
  /** Institution Name */
  institution?: Maybe<Scalars['String']['output']>;
};

/** Mock Owner data. */
export type RemoteDataMockOwner = {
  __typename?: 'RemoteDataMockOwner';
  /** Address */
  address?: Maybe<RemoteDataMockAddress>;
  /** Email */
  email?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Phone */
  phone?: Maybe<Scalars['String']['output']>;
};

/** Mock Transaction data. */
export type RemoteDataMockTransaction = {
  __typename?: 'RemoteDataMockTransaction';
  /** Account ID */
  accountId?: Maybe<Scalars['String']['output']>;
  /** Amount */
  amount?: Maybe<Scalars['String']['output']>;
  /** Category */
  category?: Maybe<Scalars['String']['output']>;
  /** Date */
  date?: Maybe<Scalars['String']['output']>;
  /** Description */
  description?: Maybe<Scalars['String']['output']>;
  /** ID */
  id?: Maybe<Scalars['String']['output']>;
  /** ISO Currency Code */
  isoCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** Status */
  status?: Maybe<Scalars['String']['output']>;
};

/** Mx Account data. */
export type RemoteDataMxAccount = {
  __typename?: 'RemoteDataMxAccount';
  /** The account number associated with the account. This will typically be a masked or partial account number. */
  accountNumber?: Maybe<Scalars['String']['output']>;
  accountOwnership?: Maybe<Scalars['String']['output']>;
  annuityPolicyToDate?: Maybe<Scalars['String']['output']>;
  annuityProvider?: Maybe<Scalars['String']['output']>;
  annuityTermYear?: Maybe<Scalars['Float']['output']>;
  /** The annual percentage rate associated with the account. */
  apr?: Maybe<Scalars['Float']['output']>;
  /** The annual percentage yield associated with the account. */
  apy?: Maybe<Scalars['Float']['output']>;
  /** The balance that is available for use in asset accounts like checking and savings. PENDING transactions are typically taken into account with the available balance, but this may not always be the case. available_balance will usually be a positive value for all account types, determined in the same way as the balance field. */
  availableBalance?: Maybe<Scalars['Float']['output']>;
  /** The amount of credit available for use in liability accounts like credit cards and lines of credit. PENDING transactions are typically taken into account with available credit, but this may not always be the case. available_credit will usually be a positive value for all account types, determined in the same way as the balance field. */
  availableCredit?: Maybe<Scalars['Float']['output']>;
  /** The current balance of the account. PENDING transactions are typically not taken into account with the current balance, but this may not always be the case. This is the value used for the account balance displayed in MX UIs. The balance will usually be a positive value for all account types. Asset-type accounts (CHECKING, SAVINGS, INVESTMENT) may have a negative balance if they are in overdraft. Debt-type accounts (CREDIT_CARD, LOAN, LINE_OF_CREDIT, MORTGAGE) may have a negative balance if they are overpaid. */
  balance?: Maybe<Scalars['Float']['output']>;
  /** The cash balance of the account. */
  cashBalance?: Maybe<Scalars['Float']['output']>;
  /** The sum of money paid to the policyholder or annuity holder in the event the policy is voluntarily terminated before it matures, or the insured event occurs. */
  cashSurrenderValue?: Maybe<Scalars['Float']['output']>;
  /** The date and time at which the account was created on the MX Platform. */
  createdAt?: Maybe<Scalars['String']['output']>;
  /** The credit limit associated with the account. */
  creditLimit?: Maybe<Scalars['Float']['output']>;
  /** The three-character ISO 4217 currency code. */
  currencyCode?: Maybe<Scalars['String']['output']>;
  /** The day of the month the payment is due. For example, the 14th is passed as 14. */
  dayPaymentIsDue?: Maybe<Scalars['Int']['output']>;
  /** The amount paid to the beneficiary of the account upon death of the account owner. */
  deathBenefit?: Maybe<Scalars['Int']['output']>;
  /** The unique identifier for the account. Defined by MX. */
  guid?: Maybe<Scalars['String']['output']>;
  /** The sum of all long holdings within this account, not including any that are shorted and not including cash. */
  holdingsValue?: Maybe<Scalars['Float']['output']>;
  /** The unique partner-defined identifier for the account */
  id?: Maybe<Scalars['String']['output']>;
  /** The date and time at which the account was last successfully aggregated and received data. */
  importedAt?: Maybe<Scalars['String']['output']>;
  /** A unique identifier for the institution associated with this account. Defined by MX. */
  institutionCode?: Maybe<Scalars['String']['output']>;
  /** The name of the insured individual. */
  insuredName?: Maybe<Scalars['String']['output']>;
  /** The interest rate associated with the account. */
  interestRate?: Maybe<Scalars['Float']['output']>;
  /** This indicates whether an account has been closed. */
  isClosed?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the account is hidden. Defaults to `false`. */
  isHidden?: Maybe<Scalars['Boolean']['output']>;
  isManual?: Maybe<Scalars['Boolean']['output']>;
  /** The date and time of the most recent payment on the account. */
  lastPayment?: Maybe<Scalars['Float']['output']>;
  /** The amount of the most recent payment on the account. */
  lastPaymentAt?: Maybe<Scalars['String']['output']>;
  /** The amount of the loan associated with the account. */
  loanAmount?: Maybe<Scalars['Float']['output']>;
  marginBalance?: Maybe<Scalars['Float']['output']>;
  /** The date on which the account matures. */
  maturesOn?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the member associated with the account. Defined by MX. */
  memberGuid?: Maybe<Scalars['String']['output']>;
  /** The unique, partner-defined, identifier for the member associated with this account. */
  memberId?: Maybe<Scalars['String']['output']>;
  /** This indicates whether the associated member is managed by the user or the MX partner. Members created with the managed member feature will have this field set to false. */
  memberIsManagedByUser?: Maybe<Scalars['Boolean']['output']>;
  /** Additional information a partner can store on the account. */
  metadata?: Maybe<Scalars['String']['output']>;
  /** The minimum balance associated with the account. */
  minimumBalance?: Maybe<Scalars['Float']['output']>;
  /** The minimum payment required for an account. This can apply to any debt account. */
  minimumPayment?: Maybe<Scalars['Float']['output']>;
  /** The human-readable name for the account. */
  name?: Maybe<Scalars['String']['output']>;
  /** An alternate name for the account. */
  nickname?: Maybe<Scalars['String']['output']>;
  /** The original balance associated with the account. This will always be positive. */
  originalBalance?: Maybe<Scalars['Float']['output']>;
  /** The amount paid out to the insured individual or beneficiary under the conditions of the insurance policy. */
  payOutAmount?: Maybe<Scalars['Float']['output']>;
  /** The date and time at which the next payment is due on the account. */
  paymentDueAt?: Maybe<Scalars['String']['output']>;
  /** The payoff balance for a debt account. This will normally be a positive number. */
  payoffBalance?: Maybe<Scalars['Float']['output']>;
  /** The insurance policy’s premium amount. */
  premiumAmount?: Maybe<Scalars['Float']['output']>;
  propertyType?: Maybe<Scalars['String']['output']>;
  /** The routing number for the account. */
  routingNumber?: Maybe<Scalars['String']['output']>;
  /** The date on which a debt account was started. */
  startedOn?: Maybe<Scalars['String']['output']>;
  /** The account’s subtype, e.g., PLAN_401_K, MONEY_MARKET, or HOME_EQUITY. */
  subtype?: Maybe<Scalars['String']['output']>;
  todayUglAmount?: Maybe<Scalars['Float']['output']>;
  todayUglPercentage?: Maybe<Scalars['Float']['output']>;
  /** The total value of the account. */
  totalAccountValue?: Maybe<Scalars['Float']['output']>;
  /** The general or parent type of the account. */
  type?: Maybe<Scalars['String']['output']>;
  /** The date and time at which the account was most recently updated. */
  updatedAt?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the user associated with the account. Defined by MX. */
  userGuid?: Maybe<Scalars['String']['output']>;
  /** The unique, partner-defined, identifier for the user associated with this account. */
  userId?: Maybe<Scalars['String']['output']>;
};

/** Mx Account Owners data. */
export type RemoteDataMxAccountOwner = {
  __typename?: 'RemoteDataMxAccountOwner';
  /** The unique identifier for the account associated with the account owner. Defined by MX. */
  accountGuid?: Maybe<Scalars['String']['output']>;
  /** The account owner's street address. */
  address?: Maybe<Scalars['String']['output']>;
  /** The account owner's city. */
  city?: Maybe<Scalars['String']['output']>;
  /** The account owner's country. */
  country?: Maybe<Scalars['String']['output']>;
  /** The account owner's email address. */
  email?: Maybe<Scalars['String']['output']>;
  /** The account owner's first name. This may also include a middle name. This field will be null unless name splitting has been enabled. Contact MX to have this feature enabled. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the account owner. Defined by MX. */
  guid?: Maybe<Scalars['String']['output']>;
  /** The account owner's last name. This field will be null unless name splitting has been enabled. Contact MX to have this feature enabled. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the member associated with the account owner. Defined by MX. */
  memberGuid?: Maybe<Scalars['String']['output']>;
  /** The account owner's name. */
  ownerName?: Maybe<Scalars['String']['output']>;
  /** The account owner's phone number. */
  phone?: Maybe<Scalars['String']['output']>;
  /** The account owner's postal code. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** The account owner's state. */
  state?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the user associated with the account owner. Defined by MX. */
  userGuid?: Maybe<Scalars['String']['output']>;
};

/** Mx Enrichment data. */
export type RemoteDataMxEnhanceTransaction = {
  __typename?: 'RemoteDataMxEnhanceTransaction';
  /** The monetary amount of the transaction. */
  amount?: Maybe<Scalars['Float']['output']>;
  /** The method used to determine the category assigned to the transaction */
  categorizedBy?: Maybe<Scalars['Int']['output']>;
  /** The category of the transaction. */
  category?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the category assigned to the transaction. */
  categoryGuid?: Maybe<Scalars['String']['output']>;
  /** The method used to describe the transaction */
  describedBy?: Maybe<Scalars['Int']['output']>;
  /** A human-readable version of the original_description field described below, e.g., “Sam’s Club,” “Johnny’s Tavern.” This is provided by the MX Platform. */
  description?: Maybe<Scalars['String']['output']>;
  /** The transaction type assigned by the partner. */
  extendedTransactionType?: Maybe<Scalars['String']['output']>;
  /** The unique partner-defined identifier for the transaction. This can only be set for partner-managed transactions. It should be ignored for user-managed transactions, even in occasional cases where it may return with a value. */
  id?: Maybe<Scalars['String']['output']>;
  /** This indicates whether the transaction represents a bill pay. */
  isBillPay?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a direct deposit. */
  isDirectDeposit?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents an expense. */
  isExpense?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a fee. */
  isFee?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents income. */
  isIncome?: Maybe<Scalars['Boolean']['output']>;
  /** If the transaction is international as defined by the data provider, this field will be true. If the data provider determines it is not international then it will be false. It will be null if the data provider does not have this information. */
  isInternational?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents an overdraft fee. */
  isOverdraftFee?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a payroll advance. */
  isPayrollAdvance?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a payment for a subscription service such as Netflix or Audible. */
  isSubscription?: Maybe<Scalars['Boolean']['output']>;
  /** This field contains additional descriptive information about the transaction. */
  memo?: Maybe<Scalars['String']['output']>;
  /** The ISO 18245 category code for the transaction. */
  merchantCategoryCode?: Maybe<Scalars['Int']['output']>;
  /** The unique identifier for the merchant associated with this transaction. Defined by MX. */
  merchantGuid?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the merchant_location associated with this transaction. Defined by MX. */
  merchantLocationGuid?: Maybe<Scalars['String']['output']>;
  /** The original description of the transaction as provided by our data feed. See description above for more information. */
  originalDescription?: Maybe<Scalars['String']['output']>;
  /** The type of transaction. This will be either CREDIT or DEBIT. */
  type?: Maybe<Scalars['String']['output']>;
};

/** Mx Connection data. */
export type RemoteDataMxMember = {
  __typename?: 'RemoteDataMxMember';
  /**
   * The date and time the most recent aggregation-type job was started, given in ISO 8601 format with a time component. A job will automatically be started when a member is created or its credentials are updated, unless the `skip_aggregation` parameter is used. Jobs can also be started via manual aggregations, background aggregations, API endpoints, or when opening an MX widget. A job can be a normal aggregation, or a premium job such as identification, verification, fetching statements, or fetching an extended transaction history.
   *
   */
  aggregatedAt?: Maybe<Scalars['String']['output']>;
  /** This indicates whether background aggregation is disabled for the member. */
  backgroundAggregationIsDisabled?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates the state of a member’s aggregation. See member connection statuses for more information. */
  connectionStatus?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the member. Defined by MX. */
  guid?: Maybe<Scalars['String']['output']>;
  /** The partner-defined unique identifier for the member. */
  id?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the institution associated with the member. Defined by MX. */
  institutionCode?: Maybe<Scalars['String']['output']>;
  /** This indicates whether the member was being aggregated at the time of the request. */
  isBeingAggregated?: Maybe<Scalars['Boolean']['output']>;
  /**
   * This indicates whether the member is managed by the user or the MX partner. Members created with the managed member feature will have this field set to false.
   *
   */
  isManagedByUser?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the member uses OAuth to authenticate. Defaults to `false`. */
  isOauth?: Maybe<Scalars['Boolean']['output']>;
  /** Additional information you can store on this member. */
  metadata?: Maybe<Scalars['String']['output']>;
  /** The name of the member. */
  name?: Maybe<Scalars['String']['output']>;
  oauthWindowUri?: Maybe<Scalars['String']['output']>;
  /** The date and time the member was last successfully aggregated. */
  successfullyAggregatedAt?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the user associated with the member. Defined by MX. */
  userGuid?: Maybe<Scalars['String']['output']>;
  /** The unique partner-defined identifier for the user associated with the member. */
  userId?: Maybe<Scalars['String']['output']>;
};

/** Mx Transaction data. */
export type RemoteDataMxTransaction = {
  __typename?: 'RemoteDataMxTransaction';
  /** The unique identifier for the account associated with the transaction. Defined by MX. */
  accountGuid?: Maybe<Scalars['String']['output']>;
  /** The unique partner-defined identifier for the account associated with the transaction. This can only be set for partner-managed accounts. It should be ignored for user-managed transactions, even in occasional cases where it may return with a value. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The monetary amount of the transaction. */
  amount?: Maybe<Scalars['Float']['output']>;
  /** The category of the transaction. */
  category?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the category assigned to the transaction. */
  categoryGuid?: Maybe<Scalars['String']['output']>;
  /** The check number for the transaction. */
  checkNumberString?: Maybe<Scalars['String']['output']>;
  /** The date and time the transaction was created. */
  createdAt?: Maybe<Scalars['String']['output']>;
  /** The three-character ISO 4217 currency code, e.g. USD. */
  currencyCode?: Maybe<Scalars['String']['output']>;
  /** The date on which the transaction took place. This is the field used when searching for transactions by date. This field is generally the same as transacted_at, but uses posted_at as a fallback. */
  date?: Maybe<Scalars['String']['output']>;
  /** A human-readable version of the original_description field described below, e.g., “Sam’s Club,” “Johnny’s Tavern.” This is provided by the MX Platform. */
  description?: Maybe<Scalars['String']['output']>;
  /** The transaction type assigned by the partner. */
  extendedTransactionType?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the transaction. Defined by MX. */
  guid?: Maybe<Scalars['String']['output']>;
  /** The unique partner-defined identifier for the transaction. This can only be set for partner-managed transactions. It should be ignored for user-managed transactions, even in occasional cases where it may return with a value. */
  id?: Maybe<Scalars['String']['output']>;
  /** This indicates whether the transaction represents a bill pay. */
  isBillPay?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a direct deposit. */
  isDirectDeposit?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents an expense. */
  isExpense?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a fee. */
  isFee?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents income. */
  isIncome?: Maybe<Scalars['Boolean']['output']>;
  /** If the transaction is international as defined by the data provider, this field will be true. If the data provider determines it is not international then it will be false. It will be null if the data provider does not have this information. */
  isInternational?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents an overdraft fee. */
  isOverdraftFee?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a payroll advance. */
  isPayrollAdvance?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether a transaction is a recurring credit or debit. */
  isRecurring?: Maybe<Scalars['Boolean']['output']>;
  /** This indicates whether the transaction represents a payment for a subscription service such as Netflix or Audible. */
  isSubscription?: Maybe<Scalars['Boolean']['output']>;
  /** The latitude of the location where the transaction occurred. The number is a signed decimal (e.g. Rio de Janeiro’s latitude is -22.9027800 and Tokyo’s latitude is 35.689488). */
  latitude?: Maybe<Scalars['Float']['output']>;
  /** A human-readable description of the transaction, provided in a local language. */
  localizedDescription?: Maybe<Scalars['String']['output']>;
  /** Additional descriptive information about the transaction, provided in a local language. */
  localizedMemo?: Maybe<Scalars['String']['output']>;
  /** The longitude of the location where the transaction occurred. The number is a signed decimal (e.g. Rio de Janeiro’s longitude is -43.2075000 and Tokyo’s longitude is 139.691706). */
  longitude?: Maybe<Scalars['Float']['output']>;
  /** The unique identifier for the member associated with the transaction Defined by MX. */
  memberGuid?: Maybe<Scalars['String']['output']>;
  /** This indicates whether the associated member is managed by the user or the MX partner. Members created with the managed member feature will have this field set to false. */
  memberIsManagedByUser?: Maybe<Scalars['Boolean']['output']>;
  /** This field contains additional descriptive information about the transaction. */
  memo?: Maybe<Scalars['String']['output']>;
  /** The ISO 18245 category code for the transaction. */
  merchantCategoryCode?: Maybe<Scalars['Int']['output']>;
  /** The unique identifier for the merchant associated with this transaction. Defined by MX. */
  merchantGuid?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the merchant_location associated with this transaction. Defined by MX. */
  merchantLocationGuid?: Maybe<Scalars['String']['output']>;
  /** Custom data */
  metadata?: Maybe<Scalars['String']['output']>;
  /** The original description of the transaction as provided by our data feed. See description above for more information. */
  originalDescription?: Maybe<Scalars['String']['output']>;
  /** The date and time the transaction was posted to the account. */
  postedAt?: Maybe<Scalars['String']['output']>;
  /** The status of the transaction. This will be either POSTED or PENDING. */
  status?: Maybe<Scalars['String']['output']>;
  /** The parent category assigned to this transaction’s category. */
  topLevelCategory?: Maybe<Scalars['String']['output']>;
  /** The date and time the transaction took place. */
  transactedAt?: Maybe<Scalars['String']['output']>;
  /** The type of transaction. This will be either CREDIT or DEBIT. */
  type?: Maybe<Scalars['String']['output']>;
  /** The date and time the transaction was last updated. */
  updatedAt?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the user associated with this transaction. Defined by MX. */
  userGuid?: Maybe<Scalars['String']['output']>;
  /** The unique partner-defined identifier for the user associated with the transaction. */
  userId?: Maybe<Scalars['String']['output']>;
};

/** Information about the APR on the account. */
export type RemoteDataPlaidApr = {
  __typename?: 'RemoteDataPlaidAPR';
  /**
   * Annual Percentage Rate applied.
   *
   */
  aprPercentage?: Maybe<Scalars['Float']['output']>;
  /** The type of balance to which the APR applies. */
  aprType?: Maybe<Scalars['String']['output']>;
  /** Amount of money that is subjected to the APR if a balance was carried beyond payment due date. How it is calculated can vary by card issuer. It is often calculated as an average daily balance. */
  balanceSubjectToApr?: Maybe<Scalars['Float']['output']>;
  /** Amount of money charged due to interest from last statement. */
  interestChargeAmount?: Maybe<Scalars['Float']['output']>;
};

/** Plaid Account data. */
export type RemoteDataPlaidAccount = {
  __typename?: 'RemoteDataPlaidAccount';
  /**
   * Plaid’s unique identifier for the account. This value will not change unless Plaid can't reconcile the account with the data returned by the financial institution. This may occur, for example, when the name of the account changes. If this happens a new `account_id` will be assigned to the account.
   *
   * The `account_id` can also change if the `access_token` is deleted and the same credentials that were used to generate that `access_token` are used to generate a new `access_token` on a later date. In that case, the new `account_id` will be different from the old `account_id`.
   *
   * If an account with a specific `account_id` disappears instead of changing, the account is likely closed. Closed accounts are not returned by the Plaid API.
   *
   * Like all Plaid identifiers, the `account_id` is case sensitive.
   */
  accountId?: Maybe<Scalars['String']['output']>;
  /** A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by `/accounts/balance/get`. */
  balances?: Maybe<RemoteDataPlaidAccountBalance>;
  /** The last 2-4 alphanumeric characters of an account's official account number. Note that the mask may be non-unique between an Item's accounts, and it may also not match the mask that the bank displays to the user. */
  mask?: Maybe<Scalars['String']['output']>;
  /** The name of the account, either assigned by the user or by the financial institution itself */
  name?: Maybe<Scalars['String']['output']>;
  /** The official name of the account as given by the financial institution */
  officialName?: Maybe<Scalars['String']['output']>;
  /** A unique and persistent identifier for accounts that can be used to trace multiple instances of the same account across different Items for depository accounts. This is currently only supported for Chase Items. Because Chase accounts have a different account number each time they are linked, this field may be used instead of the account number to uniquely identify a Chase account across multiple Items for payments use cases, helping to reduce duplicate Items or attempted fraud. In Sandbox, this field may be populated for any account; in Production and Development, it will only be populated for Chase accounts. */
  persistentAccountId?: Maybe<Scalars['String']['output']>;
  /** See the [Account type schema](https://plaid.com/docs/api/accounts/#account-type-schema) for a full listing of account types and corresponding subtypes. */
  subtype?: Maybe<Scalars['String']['output']>;
  /**
   * `investment:` Investment account. In API versions 2018-05-22 and earlier, this type is called `brokerage` instead.
   *
   * `credit:` Credit card
   *
   * `depository:` Depository account
   *
   * `loan:` Loan account
   *
   * `other:` Non-specified account type
   *
   * See the [Account type schema](https://plaid.com/docs/api/accounts#account-type-schema) for a full listing of account types and corresponding subtypes.
   */
  type?: Maybe<Scalars['String']['output']>;
  /** Insights from performing database verification for the account. */
  verificationInsights?: Maybe<RemoteDataPlaidVerificationInsights>;
  /**
   * The current verification status of an Auth Item initiated through Automated or Manual micro-deposits.  Returned for Auth Items only.
   *
   * `pending_automatic_verification`: The Item is pending automatic verification
   *
   * `pending_manual_verification`: The Item is pending manual micro-deposit verification. Items remain in this state until the user successfully verifies the micro-deposit.
   *
   * `automatically_verified`: The Item has successfully been automatically verified	
   *
   * `manually_verified`: The Item has successfully been manually verified
   *
   * `verification_expired`: Plaid was unable to automatically verify the deposit within 7 calendar days and will no longer attempt to validate the Item. Users may retry by submitting their information again through Link.
   *
   * `verification_failed`: The Item failed manual micro-deposit verification because the user exhausted all 3 verification attempts. Users may retry by submitting their information again through Link.
   *
   * `database_matched`: The Item has successfully been verified using Plaid's data sources. Note: Database Match is currently a beta feature, please contact your account manager for more information.
   *
   * `database_insights_pass`: The Item's ACH numbers have been verified using Plaid's data sources and have strong signal for being valid. Note: Database Insights is currently a beta feature, please contact your account manager for more information.
   *
   * `database_insights_pass_with_caution`: The Item's ACH numbers have been verified using Plaid's data sources and have some signal for being valid. Note: Database Insights is currently a beta feature, please contact your account manager for more information.
   *
   * `database_insights_fail`:  The Item's ACH numbers have been verified using Plaid's data sources and have signal for being invalid and/or have no signal for being valid. Note: Database Insights is currently a beta feature, please contact your account manager for more information.	
   * 	
   */
  verificationStatus?: Maybe<Scalars['String']['output']>;
};

/** A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by `/accounts/balance/get`. */
export type RemoteDataPlaidAccountBalance = {
  __typename?: 'RemoteDataPlaidAccountBalance';
  /**
   * The amount of funds available to be withdrawn from the account, as determined by the financial institution.
   *
   * For `credit`-type accounts, the `available` balance typically equals the `limit` less the `current` balance, less any pending outflows plus any pending inflows.
   *
   * For `depository`-type accounts, the `available` balance typically equals the `current` balance less any pending outflows plus any pending inflows. For `depository`-type accounts, the `available` balance does not include the overdraft limit.
   *
   * For `investment`-type accounts (or `brokerage`-type accounts for API versions 2018-05-22 and earlier), the `available` balance is the total cash available to withdraw as presented by the institution.
   *
   * Note that not all institutions calculate the `available`  balance. In the event that `available` balance is unavailable, Plaid will return an `available` balance value of `null`.
   *
   * Available balance may be cached and is not guaranteed to be up-to-date in realtime unless the value was returned by `/accounts/balance/get`.
   *
   * If `current` is `null` this field is guaranteed not to be `null`.
   */
  available?: Maybe<Scalars['Float']['output']>;
  /**
   * The total amount of funds in or owed by the account.
   *
   * For `credit`-type accounts, a positive balance indicates the amount owed; a negative amount indicates the lender owing the account holder.
   *
   * For `loan`-type accounts, the current balance is the principal remaining on the loan, except in the case of student loan accounts at Sallie Mae (`ins_116944`). For Sallie Mae student loans, the account's balance includes both principal and any outstanding interest.
   *
   * For `investment`-type accounts (or `brokerage`-type accounts for API versions 2018-05-22 and earlier), the current balance is the total value of assets as presented by the institution.
   *
   * Note that balance information may be cached unless the value was returned by `/accounts/balance/get`; if the Item is enabled for Transactions, the balance will be at least as recent as the most recent Transaction update. If you require realtime balance information, use the `available` balance as provided by `/accounts/balance/get`.
   *
   * When returned by `/accounts/balance/get`, this field may be `null`. When this happens, `available` is guaranteed not to be `null`.
   */
  current?: Maybe<Scalars['Float']['output']>;
  /** The ISO-4217 currency code of the balance. Always null if `unofficial_currency_code` is non-null. */
  isoCurrencyCode?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DDTHH:mm:ssZ`) indicating the oldest acceptable balance when making a request to `/accounts/balance/get`.
   *
   * This field is only used and expected when the institution is `ins_128026` (Capital One) and the Item contains one or more accounts with a non-depository account type, in which case a value must be provided or an `INVALID_REQUEST` error with the code of `INVALID_FIELD` will be returned. For Capital One depository accounts as well as all other account types on all other institutions, this field is ignored. See [account type schema](https://en.wikipedia.org/wiki/ISO_8601) for a full list of account types.
   *
   * If the balance that is pulled is older than the given timestamp for Items with this field required, an `INVALID_REQUEST` error with the code of `LAST_UPDATED_DATETIME_OUT_OF_RANGE` will be returned with the most recent timestamp for the requested account contained in the response.
   */
  lastUpdatedDatetime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * For `credit`-type accounts, this represents the credit limit.
   *
   * For `depository`-type accounts, this represents the pre-arranged overdraft limit, which is common for current (checking) accounts in Europe.
   *
   * In North America, this field is typically only available for `credit`-type accounts.
   */
  limit?: Maybe<Scalars['Float']['output']>;
  /**
   * The unofficial currency code associated with the balance. Always null if `iso_currency_code` is non-null. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
   *
   * See the [currency code schema](https://plaid.com/docs/api/accounts#currency-code-schema) for a full listing of supported `unofficial_currency_code`s.
   */
  unofficialCurrencyCode?: Maybe<Scalars['String']['output']>;
};

/**
 * By default, Link will provide limited account filtering: it will only display Institutions that are compatible with all products supplied in the `products` parameter of `/link/token/create`, and, if `auth` is specified in the `products` array, will also filter out accounts other than `checking` and `savings` accounts on the Account Select pane. You can further limit the accounts shown in Link by using `account_filters` to specify the account subtypes to be shown in Link. Only the specified subtypes will be shown. This filtering applies to both the Account Select view (if enabled) and the Institution Select view. Institutions that do not support the selected subtypes will be omitted from Link. To indicate that all subtypes should be shown, use the value `"all"`. If the `account_filters` filter is used, any account type for which a filter is not specified will be entirely omitted from Link. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).
 *
 * The filter may or may not impact the list of accounts shown by the institution in the OAuth account selection flow, depending on the specific institution. If the user selects excluded account subtypes in the OAuth flow, these accounts will not be added to the Item. If the user selects only excluded account subtypes, the link attempt will fail and the user will be prompted to try again.
 *
 */
export type RemoteDataPlaidAccountFiltersInput = {
  /** A filter to apply to `credit`-type accounts */
  credit?: InputMaybe<RemoteDataPlaidCreditFilterInput>;
  /** A filter to apply to `depository`-type accounts */
  depository?: InputMaybe<RemoteDataPlaidDepositoryFilterInput>;
  /** A filter to apply to `investment`-type accounts (or `brokerage`-type accounts for API versions 2018-05-22 and earlier). */
  investment?: InputMaybe<RemoteDataPlaidInvestmentFilterInput>;
  /** A filter to apply to `loan`-type accounts */
  loan?: InputMaybe<RemoteDataPlaidLoanFilterInput>;
  /** A filter to apply to `other`-type accounts */
  other?: InputMaybe<RemoteDataPlaidOtherFilterInput>;
};

/** Plaid Account Owners data. */
export type RemoteDataPlaidAccountIdentity = {
  __typename?: 'RemoteDataPlaidAccountIdentity';
  /**
   * Plaid’s unique identifier for the account. This value will not change unless Plaid can't reconcile the account with the data returned by the financial institution. This may occur, for example, when the name of the account changes. If this happens a new `account_id` will be assigned to the account.
   *
   * The `account_id` can also change if the `access_token` is deleted and the same credentials that were used to generate that `access_token` are used to generate a new `access_token` on a later date. In that case, the new `account_id` will be different from the old `account_id`.
   *
   * If an account with a specific `account_id` disappears instead of changing, the account is likely closed. Closed accounts are not returned by the Plaid API.
   *
   * Like all Plaid identifiers, the `account_id` is case sensitive.
   */
  accountId?: Maybe<Scalars['String']['output']>;
  /** A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by `/accounts/balance/get`. */
  balances?: Maybe<RemoteDataPlaidAccountBalance>;
  /** Array of documents that identity data is dervied from. This array will be empty if none of the account identity is from a document. */
  documents?: Maybe<Array<RemoteDataPlaidIdentityDocument>>;
  /** The last 2-4 alphanumeric characters of an account's official account number. Note that the mask may be non-unique between an Item's accounts, and it may also not match the mask that the bank displays to the user. */
  mask?: Maybe<Scalars['String']['output']>;
  /** The name of the account, either assigned by the user or by the financial institution itself */
  name?: Maybe<Scalars['String']['output']>;
  /** The official name of the account as given by the financial institution */
  officialName?: Maybe<Scalars['String']['output']>;
  /** Data returned by the financial institution about the account owner or owners. Only returned by Identity or Assets endpoints. For business accounts, the name reported may be either the name of the individual or the name of the business, depending on the institution; detecting whether the linked account is a business account is not currently supported. Multiple owners on a single account will be represented in the same `owner` object, not in multiple owner objects within the array. In API versions 2018-05-22 and earlier, the `owners` object is not returned, and instead identity information is returned in the top level `identity` object. For more details, see [Plaid API versioning](https://plaid.com/docs/api/versioning/#version-2019-05-29) */
  owners?: Maybe<Array<RemoteDataPlaidOwner>>;
  /** A unique and persistent identifier for accounts that can be used to trace multiple instances of the same account across different Items for depository accounts. This is currently only supported for Chase Items. Because Chase accounts have a different account number each time they are linked, this field may be used instead of the account number to uniquely identify a Chase account across multiple Items for payments use cases, helping to reduce duplicate Items or attempted fraud. In Sandbox, this field may be populated for any account; in Production and Development, it will only be populated for Chase accounts. */
  persistentAccountId?: Maybe<Scalars['String']['output']>;
  /** See the [Account type schema](https://plaid.com/docs/api/accounts/#account-type-schema) for a full listing of account types and corresponding subtypes. */
  subtype?: Maybe<Scalars['String']['output']>;
  /**
   * `investment:` Investment account. In API versions 2018-05-22 and earlier, this type is called `brokerage` instead.
   *
   * `credit:` Credit card
   *
   * `depository:` Depository account
   *
   * `loan:` Loan account
   *
   * `other:` Non-specified account type
   *
   * See the [Account type schema](https://plaid.com/docs/api/accounts#account-type-schema) for a full listing of account types and corresponding subtypes.
   */
  type?: Maybe<Scalars['String']['output']>;
  /** Insights from performing database verification for the account. */
  verificationInsights?: Maybe<RemoteDataPlaidVerificationInsights>;
  /**
   * The current verification status of an Auth Item initiated through Automated or Manual micro-deposits.  Returned for Auth Items only.
   *
   * `pending_automatic_verification`: The Item is pending automatic verification
   *
   * `pending_manual_verification`: The Item is pending manual micro-deposit verification. Items remain in this state until the user successfully verifies the micro-deposit.
   *
   * `automatically_verified`: The Item has successfully been automatically verified	
   *
   * `manually_verified`: The Item has successfully been manually verified
   *
   * `verification_expired`: Plaid was unable to automatically verify the deposit within 7 calendar days and will no longer attempt to validate the Item. Users may retry by submitting their information again through Link.
   *
   * `verification_failed`: The Item failed manual micro-deposit verification because the user exhausted all 3 verification attempts. Users may retry by submitting their information again through Link.
   *
   * `database_matched`: The Item has successfully been verified using Plaid's data sources. Note: Database Match is currently a beta feature, please contact your account manager for more information.
   *
   * `database_insights_pass`: The Item's ACH numbers have been verified using Plaid's data sources and have strong signal for being valid. Note: Database Insights is currently a beta feature, please contact your account manager for more information.
   *
   * `database_insights_pass_with_caution`: The Item's ACH numbers have been verified using Plaid's data sources and have some signal for being valid. Note: Database Insights is currently a beta feature, please contact your account manager for more information.
   *
   * `database_insights_fail`:  The Item's ACH numbers have been verified using Plaid's data sources and have signal for being invalid and/or have no signal for being valid. Note: Database Insights is currently a beta feature, please contact your account manager for more information.	
   * 	
   */
  verificationStatus?: Maybe<Scalars['String']['output']>;
};

/** A physical mailing address. */
export type RemoteDataPlaidAddress = {
  __typename?: 'RemoteDataPlaidAddress';
  /** Data about the components comprising an address. */
  data?: Maybe<RemoteDataPlaidAddressData>;
  /** When `true`, identifies the address as the primary address on an account. */
  primary?: Maybe<Scalars['Boolean']['output']>;
};

/** Data about the components comprising an address. */
export type RemoteDataPlaidAddressData = {
  __typename?: 'RemoteDataPlaidAddressData';
  /** The full city name */
  city?: Maybe<Scalars['String']['output']>;
  /** The ISO 3166-1 alpha-2 country code */
  country?: Maybe<Scalars['String']['output']>;
  /** The postal code. In API versions 2018-05-22 and earlier, this field is called `zip`. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /**
   * The region or state. In API versions 2018-05-22 and earlier, this field is called `state`.
   * Example: `"NC"`
   */
  region?: Maybe<Scalars['String']['output']>;
  /**
   * The full street address
   * Example: `"564 Main Street, APT 15"`
   */
  street?: Maybe<Scalars['String']['output']>;
};

/** Specifies options for initializing Link for use with the Auth product. This field can be used to enable or disable extended Auth flows for the resulting Link session. Omitting any field will result in a default that can be configured by your account manager. The default behavior described in the documentation is the default behavior that will apply if you have not requested your account manager to apply a different default. */
export type RemoteDataPlaidAuthInput = {
  /** Specifies whether Auth Type Select is enabled for the Link session, allowing the end user to choose between linking via a credentials-based flow (i.e. Instant Auth, Instant Match, Automated Micro-deposits) or a manual flow that does not require login (all other Auth flows) prior to selecting their financial institution. Default behavior is `false`. */
  authTypeSelectEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Specifies whether the Link session is enabled for the Automated Micro-deposits flow. Default behavior is `false`. */
  automatedMicrodepositsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Specifies whether the Link session is enabled for the Database Insights flow. Database Insights is currently in closed beta; for access, contact your Account Manager. Default behavior is `false`. */
  databaseInsightsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Specifies whether the Link session is enabled for the Database Match flow. Default behavior is `false`. */
  databaseMatchEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** This field has been deprecated in favor of `auth_type_select_enabled`. */
  flowType?: InputMaybe<Scalars['String']['input']>;
  /** Specifies whether the Link session is enabled for the Instant Match flow. Instant Match is enabled by default. Instant Match can be disabled by setting this field to `false`. */
  instantMatchEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Specifies whether the Link session is enabled for the Instant Micro-deposits flow.  Default behavior for Plaid teams created after November 2023 is `false`; default behavior for Plaid teams created before that date is `true`. */
  instantMicrodepositsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Specifies what type of [Reroute to Credentials](https://plaid.com/docs/auth/coverage/same-day/#reroute-to-credentials) pane should be used in the Link session for the Same Day Micro-deposits flow. Default behavior is `OPTIONAL`. */
  rerouteToCredentials?: InputMaybe<Scalars['String']['input']>;
  /** Specifies whether the Link session is enabled for the Same Day Micro-deposits flow.  Default behavior is `false`. */
  sameDayMicrodepositsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Specifies whether the Link session is enabled for SMS micro-deposits verification. Default behavior is `true`. */
  smsMicrodepositsVerificationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
};

/** The counterparty, such as the merchant or financial institution, is extracted by Plaid from the raw description. */
export type RemoteDataPlaidCounterparty = {
  __typename?: 'RemoteDataPlaidCounterparty';
  /**
   * A description of how confident we are that the provided counterparty is involved in the transaction.
   *
   * `VERY_HIGH`: We recognize this counterparty and we are more than 98% confident that it is involved in this transaction.
   * `HIGH`: We recognize this counterparty and we are more than 90% confident that it is involved in this transaction.
   * `MEDIUM`: We are moderately confident that this counterparty was involved in this transaction, but some details may differ from our records.
   * `LOW`: We didn’t find a matching counterparty in our records, so we are returning a cleansed name parsed out of the request description.
   * `UNKNOWN`: We don’t know the confidence level for this counterparty.
   */
  confidenceLevel?: Maybe<Scalars['String']['output']>;
  /** A unique, stable, Plaid-generated ID that maps to the counterparty. */
  entityId?: Maybe<Scalars['String']['output']>;
  /** The URL of a logo associated with the counterparty, if available. The logo will always be 100×100 pixel PNG file. */
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** The name of the counterparty, such as the merchant or the financial institution, as extracted by Plaid from the raw description. */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * The counterparty type.
   *
   * `merchant`: a provider of goods or services for purchase
   * `financial_institution`: a financial entity (bank, credit union, BNPL, fintech)
   * `payment_app`: a transfer or P2P app (e.g. Zelle)
   * `marketplace`: a marketplace (e.g DoorDash, Google Play Store)
   * `payment_terminal`: a point-of-sale payment terminal (e.g Square, Toast)
   * `income_source`: the payer in an income transaction (e.g., an employer, client, or government agency)
   */
  type?: Maybe<Scalars['String']['output']>;
  /** The website associated with the counterparty. */
  website?: Maybe<Scalars['String']['output']>;
};

/** An object representing a credit card account. */
export type RemoteDataPlaidCreditCardLiability = {
  __typename?: 'RemoteDataPlaidCreditCardLiability';
  /** The ID of the account that this liability belongs to. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The various interest rates that apply to the account. APR information is not provided by all card issuers; if APR data is not available, this array will be empty. */
  aprs?: Maybe<Array<RemoteDataPlaidApr>>;
  /** true if a payment is currently overdue. Availability for this field is limited. */
  isOverdue?: Maybe<Scalars['Boolean']['output']>;
  /** The amount of the last payment. */
  lastPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** The date of the last payment. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). Availability for this field is limited. */
  lastPaymentDate?: Maybe<Scalars['Date']['output']>;
  /** The total amount owed as of the last statement issued */
  lastStatementBalance?: Maybe<Scalars['Float']['output']>;
  /** The date of the last statement. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  lastStatementIssueDate?: Maybe<Scalars['Date']['output']>;
  /** The minimum payment due for the next billing cycle. */
  minimumPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** The due date for the next payment. The due date is `null` if a payment is not expected. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  nextPaymentDueDate?: Maybe<Scalars['Date']['output']>;
};

/** A filter to apply to `credit`-type accounts */
export type RemoteDataPlaidCreditFilterInput = {
  /** An array of account subtypes to display in Link. If not specified, all account subtypes will be shown. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).  */
  accountSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A filter to apply to `depository`-type accounts */
export type RemoteDataPlaidDepositoryFilterInput = {
  /** An array of account subtypes to display in Link. If not specified, all account subtypes will be shown. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).  */
  accountSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** An object representing an email address */
export type RemoteDataPlaidEmail = {
  __typename?: 'RemoteDataPlaidEmail';
  /** The email address. */
  data?: Maybe<Scalars['String']['output']>;
  /** When `true`, identifies the email address as the primary email on an account. */
  primary?: Maybe<Scalars['Boolean']['output']>;
  /** The type of email account as described by the financial institution. */
  type?: Maybe<Scalars['String']['output']>;
};

/** Errors are identified by `error_code` and categorized by `error_type`. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-`null` error object will only be part of an API response when calling `/item/get` to view Item status. Otherwise, error fields will be `null` if no error has occurred; if an error has occurred, an error code will be returned instead. */
export type RemoteDataPlaidError = {
  __typename?: 'RemoteDataPlaidError';
  /**
   * In the Assets product, a request can pertain to more than one Item. If an error is returned for such a request, `causes` will return an array of errors containing a breakdown of these errors on the individual Item level, if any can be identified.
   *
   * `causes` will only be provided for the `error_type` `ASSET_REPORT_ERROR`. `causes` will also not be populated inside an error nested within a `warning` object.
   */
  causes?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * A user-friendly representation of the error code. `null` if the error is not related to user action.
   *
   * This may change over time and is not safe for programmatic use.
   */
  displayMessage?: Maybe<Scalars['String']['output']>;
  /** The URL of a Plaid documentation page with more information about the error */
  documentationUrl?: Maybe<Scalars['String']['output']>;
  /** The particular error code. Safe for programmatic use. */
  errorCode?: Maybe<Scalars['String']['output']>;
  /** A developer-friendly representation of the error code. This may change over time and is not safe for programmatic use. */
  errorMessage?: Maybe<Scalars['String']['output']>;
  /** A broad categorization of the error. Safe for programmatic use. */
  errorType?: Maybe<Scalars['String']['output']>;
  /** A unique ID identifying the request, to be used for troubleshooting purposes. This field will be omitted in errors provided by webhooks. */
  requestId?: Maybe<Scalars['String']['output']>;
  /** The HTTP status code associated with the error. This will only be returned in the response body when the error information is provided via a webhook. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Suggested steps for resolving the error */
  suggestedAction?: Maybe<Scalars['String']['output']>;
};

/** Plaid Holding data. */
export type RemoteDataPlaidHolding = {
  __typename?: 'RemoteDataPlaidHolding';
  /** The Plaid `account_id` associated with the holding. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The total cost basis of the holding (e.g., the total amount spent to acquire all assets currently in the holding). */
  costBasis?: Maybe<Scalars['Float']['output']>;
  /** The last price given by the institution for this security. */
  institutionPrice?: Maybe<Scalars['Float']['output']>;
  /** The date at which `institution_price` was current. */
  institutionPriceAsOf?: Maybe<Scalars['Date']['output']>;
  /**
   * Date and time at which `institution_price` was current, in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ).
   *
   * This field is returned for select financial institutions and comes as provided by the institution. It may contain default time values (such as 00:00:00).
   *
   */
  institutionPriceDatetime?: Maybe<Scalars['DateTime']['output']>;
  /** The value of the holding, as reported by the institution. */
  institutionValue?: Maybe<Scalars['Float']['output']>;
  /** The ISO-4217 currency code of the holding. Always `null` if `unofficial_currency_code` is non-`null`. */
  isoCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** The total quantity of the asset held, as reported by the financial institution. If the security is an option, `quantity` will reflect the total number of options (typically the number of contracts multiplied by 100), not the number of contracts. */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The Plaid `security_id` associated with the holding. Security data is not specific to a user's account; any user who held the same security at the same financial institution at the same time would have identical security data. The `security_id` for the same security will typically be the same across different institutions, but this is not guaranteed. The `security_id` does not typically change, but may change if inherent details of the security change due to a corporate action, for example, in the event of a ticker symbol change or CUSIP change. */
  securityId?: Maybe<Scalars['String']['output']>;
  /**
   * The unofficial currency code associated with the holding. Always `null` if `iso_currency_code` is non-`null`. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
   *
   * See the [currency code schema](https://plaid.com/docs/api/accounts#currency-code-schema) for a full listing of supported `iso_currency_code`s.
   *
   */
  unofficialCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** The total quantity of vested assets held, as reported by the financial institution. Vested assets are only associated with [equities](https://plaid.com/docs/api/products/investments/#investments-holdings-get-response-securities-type). */
  vestedQuantity?: Maybe<Scalars['Float']['output']>;
  /** The value of the vested holdings as reported by the institution. */
  vestedValue?: Maybe<Scalars['Float']['output']>;
};

/** Document object with metadata of the document uploaded */
export type RemoteDataPlaidIdentityDocument = {
  __typename?: 'RemoteDataPlaidIdentityDocument';
  documentId?: Maybe<Scalars['String']['output']>;
  /** In closed beta. Object representing metadata pertaining to the document. */
  metadata?: Maybe<RemoteDataPlaidIdentityDocumentMetadata>;
};

/** In closed beta. Object representing metadata pertaining to the document. */
export type RemoteDataPlaidIdentityDocumentMetadata = {
  __typename?: 'RemoteDataPlaidIdentityDocumentMetadata';
  /** Boolean field indicating if the uploaded document's account number matches the account number we have on file */
  isAccountNumberMatch?: Maybe<Scalars['Boolean']['output']>;
  lastUpdated?: Maybe<Scalars['DateTime']['output']>;
  uploadedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** A map containing data used to highlight institutions in Link. */
export type RemoteDataPlaidInstitutionDataInput = {
  /** The routing number of the bank to highlight in Link. Note: in rare cases, a single routing number can be associated with multiple institutions, e.g. due to a brokerage using another institution to manage ACH on its sweep accounts. If this happens, the bank will not be highlighted in Link even if the routing number is provided. */
  routingNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A filter to apply to `investment`-type accounts (or `brokerage`-type accounts for API versions 2018-05-22 and earlier). */
export type RemoteDataPlaidInvestmentFilterInput = {
  /** An array of account subtypes to display in Link. If not specified, all account subtypes will be shown. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).  */
  accountSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Plaid Investment Transaction data. */
export type RemoteDataPlaidInvestmentTransaction = {
  __typename?: 'RemoteDataPlaidInvestmentTransaction';
  /** The `account_id` of the account against which this transaction posted. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The complete value of the transaction. Positive values when cash is debited, e.g. purchases of stock; negative values when cash is credited, e.g. sales of stock. Treatment remains the same for cash-only movements unassociated with securities. */
  amount?: Maybe<Scalars['Float']['output']>;
  /**
   * A legacy field formerly used internally by Plaid to identify certain canceled transactions.
   * @deprecated Deprecated by Plaid
   */
  cancelTransactionId?: Maybe<Scalars['String']['output']>;
  /** The [ISO 8601](https://wikipedia.org/wiki/ISO_8601) posting date for the transaction. */
  date?: Maybe<Scalars['Date']['output']>;
  /** The combined value of all fees applied to this transaction */
  fees?: Maybe<Scalars['Float']['output']>;
  /** The ID of the Investment transaction, unique across all Plaid transactions. Like all Plaid identifiers, the `investment_transaction_id` is case sensitive. */
  investmentTransactionId?: Maybe<Scalars['String']['output']>;
  /** The ISO-4217 currency code of the transaction. Always `null` if `unofficial_currency_code` is non-`null`. */
  isoCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** The institution’s description of the transaction. */
  name?: Maybe<Scalars['String']['output']>;
  /** The price of the security at which this transaction occurred. */
  price?: Maybe<Scalars['Float']['output']>;
  /** The number of units of the security involved in this transaction. Positive for buy transactions; negative for sell transactions. */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The `security_id` to which this transaction is related. */
  securityId?: Maybe<Scalars['String']['output']>;
  /** For descriptions of possible transaction types and subtypes, see the [Investment transaction types schema](https://plaid.com/docs/api/accounts/#investment-transaction-types-schema). */
  subtype?: Maybe<Scalars['String']['output']>;
  /**
   * Value is one of the following:
   * `buy`: Buying an investment
   * `sell`: Selling an investment
   * `cancel`: A cancellation of a pending transaction
   * `cash`: Activity that modifies a cash position
   * `fee`: A fee on the account
   * `transfer`: Activity which modifies a position, but not through buy/sell activity e.g. options exercise, portfolio transfer
   *
   * For descriptions of possible transaction types and subtypes, see the [Investment transaction types schema](https://plaid.com/docs/api/accounts/#investment-transaction-types-schema).
   */
  type?: Maybe<Scalars['String']['output']>;
  /**
   * The unofficial currency code associated with the holding. Always `null` if `iso_currency_code` is non-`null`. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
   *
   * See the [currency code schema](https://plaid.com/docs/api/accounts#currency-code-schema) for a full listing of supported `iso_currency_code`s.
   */
  unofficialCurrencyCode?: Maybe<Scalars['String']['output']>;
};

/** Plaid Connection data. */
export type RemoteDataPlaidItem = {
  __typename?: 'RemoteDataPlaidItem';
  /** A list of products available for the Item that have not yet been accessed. The contents of this array will be mutually exclusive with `billed_products`. */
  availableProducts?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * A list of products that have been billed for the Item. The contents of this array will be mutually exclusive with `available_products`. Note - `billed_products` is populated in all environments but only requests in Production are billed. Also note that products that are billed on a pay-per-call basis rather than a pay-per-Item basis, such as `balance`, will not appear here.
   *
   */
  billedProducts?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * The RFC 3339 timestamp after which the consent provided by the end user will expire. Upon consent expiration, the item will enter the `ITEM_LOGIN_REQUIRED` error state. To circumvent the `ITEM_LOGIN_REQUIRED` error and maintain continuous consent, the end user can reauthenticate via Link’s update mode in advance of the consent expiration time.
   *
   * Note - This is only relevant for certain OAuth-based institutions. For all other institutions, this field will be null.
   *
   */
  consentExpirationTime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * A list of products that have gone through consent collection for the Item. Only present for those enabled in the [Data Transparency](https://plaid.com/docs/link/data-transparency-messaging-migration-guide) beta. If you are not enrolled in Data Transparency, this field is not used.
   *
   */
  consentedProducts?: Maybe<Array<Scalars['String']['output']>>;
  /** Errors are identified by `error_code` and categorized by `error_type`. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-`null` error object will only be part of an API response when calling `/item/get` to view Item status. Otherwise, error fields will be `null` if no error has occurred; if an error has occurred, an error code will be returned instead. */
  error?: Maybe<RemoteDataPlaidError>;
  /** The Plaid Institution ID associated with the Item. Field is `null` for Items created via Same Day Micro-deposits. */
  institutionId?: Maybe<Scalars['String']['output']>;
  /** The Plaid Item ID. The `item_id` is always unique; linking the same account at the same institution twice will result in two Items with different `item_id` values. Like all Plaid identifiers, the `item_id` is case-sensitive. */
  itemId?: Maybe<Scalars['String']['output']>;
  /**
   * A list of products added to the Item. In almost all cases, this will be the same as the `billed_products` field. For some products, it is possible for the product to be added to an Item but not yet billed (e.g. Assets, before `/asset_report/create` has been called, or Auth or Identity when added as Optional Products but before their endpoints have been called), in which case the product may appear in `products` but not in `billed_products`.
   *
   */
  products?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * Indicates whether an Item requires user interaction to be updated, which can be the case for Items with some forms of two-factor authentication.
   *
   * `background` - Item can be updated in the background
   *
   * `user_present_required` - Item requires user interaction to be updated
   */
  updateType?: Maybe<Scalars['String']['output']>;
  /** The URL registered to receive webhooks for the Item. */
  webhook?: Maybe<Scalars['String']['output']>;
};

/** Plaid Liabilities data. */
export type RemoteDataPlaidLiabilitiesObject = {
  __typename?: 'RemoteDataPlaidLiabilitiesObject';
  /** The credit accounts returned. */
  credit?: Maybe<Array<RemoteDataPlaidCreditCardLiability>>;
  /** The mortgage accounts returned. */
  mortgage?: Maybe<Array<RemoteDataPlaidMortgageLiability>>;
  /** The student loan accounts returned. */
  student?: Maybe<Array<RemoteDataPlaidStudentLoan>>;
};

/** A filter to apply to `loan`-type accounts */
export type RemoteDataPlaidLoanFilterInput = {
  /** An array of account subtypes to display in Link. If not specified, all account subtypes will be shown. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).  */
  accountSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Object containing metadata about the interest rate for the mortgage. */
export type RemoteDataPlaidMortgageInterestRate = {
  __typename?: 'RemoteDataPlaidMortgageInterestRate';
  /** Percentage value (interest rate of current mortgage, not APR) of interest payable on a loan. */
  percentage?: Maybe<Scalars['Float']['output']>;
  /** The type of interest charged (fixed or variable). */
  type?: Maybe<Scalars['String']['output']>;
};

/** Contains details about a mortgage account. */
export type RemoteDataPlaidMortgageLiability = {
  __typename?: 'RemoteDataPlaidMortgageLiability';
  /** The ID of the account that this liability belongs to. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The account number of the loan. */
  accountNumber?: Maybe<Scalars['String']['output']>;
  /** The current outstanding amount charged for late payment. */
  currentLateFee?: Maybe<Scalars['Float']['output']>;
  /** Total amount held in escrow to pay taxes and insurance on behalf of the borrower. */
  escrowBalance?: Maybe<Scalars['Float']['output']>;
  /** Indicates whether the borrower has private mortgage insurance in effect. */
  hasPmi?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the borrower will pay a penalty for early payoff of mortgage. */
  hasPrepaymentPenalty?: Maybe<Scalars['Boolean']['output']>;
  /** Object containing metadata about the interest rate for the mortgage. */
  interestRate?: Maybe<RemoteDataPlaidMortgageInterestRate>;
  /** The amount of the last payment. */
  lastPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** The date of the last payment. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  lastPaymentDate?: Maybe<Scalars['Date']['output']>;
  /** Full duration of mortgage as at origination (e.g. `10 year`). */
  loanTerm?: Maybe<Scalars['String']['output']>;
  /** Description of the type of loan, for example `conventional`, `fixed`, or `variable`. This field is provided directly from the loan servicer and does not have an enumerated set of possible values. */
  loanTypeDescription?: Maybe<Scalars['String']['output']>;
  /** Original date on which mortgage is due in full. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  maturityDate?: Maybe<Scalars['Date']['output']>;
  /** The amount of the next payment. */
  nextMonthlyPayment?: Maybe<Scalars['Float']['output']>;
  /** The due date for the next payment. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  nextPaymentDueDate?: Maybe<Scalars['Date']['output']>;
  /** The date on which the loan was initially lent. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  originationDate?: Maybe<Scalars['Date']['output']>;
  /** The original principal balance of the mortgage. */
  originationPrincipalAmount?: Maybe<Scalars['Float']['output']>;
  /** Amount of loan (principal + interest) past due for payment. */
  pastDueAmount?: Maybe<Scalars['Float']['output']>;
  /** Object containing fields describing property address. */
  propertyAddress?: Maybe<RemoteDataPlaidMortgagePropertyAddress>;
  /** The year to date (YTD) interest paid. */
  ytdInterestPaid?: Maybe<Scalars['Float']['output']>;
  /** The YTD principal paid. */
  ytdPrincipalPaid?: Maybe<Scalars['Float']['output']>;
};

/** Object containing fields describing property address. */
export type RemoteDataPlaidMortgagePropertyAddress = {
  __typename?: 'RemoteDataPlaidMortgagePropertyAddress';
  /** The city name. */
  city?: Maybe<Scalars['String']['output']>;
  /** The ISO 3166-1 alpha-2 country code. */
  country?: Maybe<Scalars['String']['output']>;
  /** The five or nine digit postal code. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** The region or state (example "NC"). */
  region?: Maybe<Scalars['String']['output']>;
  /** The full street address (example "564 Main Street, Apt 15"). */
  street?: Maybe<Scalars['String']['output']>;
};

/**
 * Details about the option security.
 *
 * For the Sandbox environment, this data is currently only available if the item is using a custom configuration object, and the `ticker` field of the custom security follows the [OCC Option Symbol](https://en.wikipedia.org/wiki/Option_symbol#The_OCC_Option_Symbol) standard with no spaces.
 */
export type RemoteDataPlaidOptionContract = {
  __typename?: 'RemoteDataPlaidOptionContract';
  /**
   * The type of this option contract. It is one of:
   *
   * `put`: for Put option contracts
   *
   * `call`: for Call option contracts
   */
  contractType?: Maybe<Scalars['String']['output']>;
  /** The expiration date for this option contract, in [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format. */
  expirationDate?: Maybe<Scalars['Date']['output']>;
  /** The strike price for this option contract, per share of security. */
  strikePrice?: Maybe<Scalars['Float']['output']>;
  /** The ticker of the underlying security for this option contract. */
  underlyingSecurityTicker?: Maybe<Scalars['String']['output']>;
};

/** A filter to apply to `other`-type accounts */
export type RemoteDataPlaidOtherFilterInput = {
  /** An array of account subtypes to display in Link. If not specified, all account subtypes will be shown. For a full list of valid types and subtypes, see the [Account schema](https://plaid.com/docs/api/accounts#account-type-schema).  */
  accountSubtypes?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Data returned from the financial institution about the owner or owners of an account. Only the `names` array must be non-empty. */
export type RemoteDataPlaidOwner = {
  __typename?: 'RemoteDataPlaidOwner';
  /** Data about the various addresses associated with the account by the financial institution. May be an empty array if no relevant information is returned from the financial institution. */
  addresses?: Maybe<Array<RemoteDataPlaidAddress>>;
  /** document_id is the id of the document that this identity belongs to */
  documentId?: Maybe<Scalars['String']['output']>;
  /** A list of email addresses associated with the account by the financial institution. May be an empty array if no relevant information is returned from the financial institution. */
  emails?: Maybe<Array<RemoteDataPlaidEmail>>;
  /**
   * A list of names associated with the account by the financial institution. In the case of a joint account, Plaid will make a best effort to report the names of all account holders.
   *
   * If an Item contains multiple accounts with different owner names, some institutions will report all names associated with the Item in each account's `names` array.
   */
  names?: Maybe<Array<Scalars['String']['output']>>;
  /** A list of phone numbers associated with the account by the financial institution. May be an empty array if no relevant information is returned from the financial institution. */
  phoneNumbers?: Maybe<Array<RemoteDataPlaidPhoneNumber>>;
};

/** Information about the student's eligibility in the Public Service Loan Forgiveness program. This is only returned if the institution is FedLoan (`ins_116527`).  */
export type RemoteDataPlaidPslfStatus = {
  __typename?: 'RemoteDataPlaidPSLFStatus';
  /** The estimated date borrower will have completed 120 qualifying monthly payments. Returned in [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  estimatedEligibilityDate?: Maybe<Scalars['Date']['output']>;
  /** The number of qualifying payments that have been made. */
  paymentsMade?: Maybe<Scalars['Int']['output']>;
  /** The number of qualifying payments remaining. */
  paymentsRemaining?: Maybe<Scalars['Int']['output']>;
};

/**
 * Transaction information specific to inter-bank transfers. If the transaction was not an inter-bank transfer, all fields will be `null`.
 *
 * If the `transactions` object was returned by a Transactions endpoint such as `/transactions/sync` or `/transactions/get`, the `payment_meta` key will always appear, but no data elements are guaranteed. If the `transactions` object was returned by an Assets endpoint such as `/asset_report/get/` or `/asset_report/pdf/get`, this field will only appear in an Asset Report with Insights.
 */
export type RemoteDataPlaidPaymentMeta = {
  __typename?: 'RemoteDataPlaidPaymentMeta';
  /** The party initiating a wire transfer. Will be `null` if the transaction is not a wire transfer. */
  byOrderOf?: Maybe<Scalars['String']['output']>;
  /** For transfers, the party that is receiving the transaction. */
  payee?: Maybe<Scalars['String']['output']>;
  /** For transfers, the party that is paying the transaction. */
  payer?: Maybe<Scalars['String']['output']>;
  /** The type of transfer, e.g. 'ACH' */
  paymentMethod?: Maybe<Scalars['String']['output']>;
  /** The name of the payment processor */
  paymentProcessor?: Maybe<Scalars['String']['output']>;
  /** The ACH PPD ID for the payer. */
  ppdId?: Maybe<Scalars['String']['output']>;
  /** The payer-supplied description of the transfer. */
  reason?: Maybe<Scalars['String']['output']>;
  /** The transaction reference number supplied by the financial institution. */
  referenceNumber?: Maybe<Scalars['String']['output']>;
};

/**
 * Information describing the intent of the transaction. Most relevant for personal finance use cases, but not limited to such use cases.
 *
 * See the [`taxonomy CSV file`](https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv) for a full list of personal finance categories. If you are migrating to personal finance categories from the legacy categories, also refer to the [`migration guide`](https://plaid.com/docs/transactions/pfc-migration/).
 */
export type RemoteDataPlaidPersonalFinanceCategory = {
  __typename?: 'RemoteDataPlaidPersonalFinanceCategory';
  /**
   * A description of how confident we are that the provided categories accurately describe the transaction intent.
   *
   * `VERY_HIGH`: We are more than 98% confident that this category reflects the intent of the transaction.
   * `HIGH`: We are more than 90% confident that this category reflects the intent of the transaction.
   * `MEDIUM`: We are moderately confident that this category reflects the intent of the transaction.
   * `LOW`: This category may reflect the intent, but there may be other categories that are more accurate.
   * `UNKNOWN`: We don’t know the confidence level for this category.
   */
  confidenceLevel?: Maybe<Scalars['String']['output']>;
  /** A granular category conveying the transaction's intent. This field can also be used as a unique identifier for the category. */
  detailed?: Maybe<Scalars['String']['output']>;
  /** A high level category that communicates the broad category of the transaction. */
  primary?: Maybe<Scalars['String']['output']>;
};

/** A phone number */
export type RemoteDataPlaidPhoneNumber = {
  __typename?: 'RemoteDataPlaidPhoneNumber';
  /** The phone number. */
  data?: Maybe<Scalars['String']['output']>;
  /** When `true`, identifies the phone number as the primary number on an account. */
  primary?: Maybe<Scalars['Boolean']['output']>;
  /** The type of phone number. */
  type?: Maybe<Scalars['String']['output']>;
};

/** Plaid Security data. */
export type RemoteDataPlaidSecurity = {
  __typename?: 'RemoteDataPlaidSecurity';
  /**
   * Price of the security at the close of the previous trading session. Null for non-public securities.
   *
   * If the security is a foreign currency this field will be updated daily and will be priced in USD.
   *
   * If the security is a cryptocurrency, this field will be updated multiple times a day. As crypto prices can fluctuate quickly and data may become stale sooner than other asset classes, refer to `update_datetime` with the time when the price was last updated.
   *
   */
  closePrice?: Maybe<Scalars['Float']['output']>;
  /** Date for which `close_price` is accurate. Always `null` if `close_price` is `null`. */
  closePriceAsOf?: Maybe<Scalars['Date']['output']>;
  /** 9-character CUSIP, an identifier assigned to North American securities. A verified CUSIP Global Services license is required to receive this data. This field will be null by default for new customers, and null for existing customers starting March 12, 2024. If you would like access to this field, please start the verification process [here](https://docs.google.com/forms/d/e/1FAIpQLSd9asHEYEfmf8fxJTHZTAfAzW4dugsnSu-HS2J51f1mxwd6Sw/viewform). */
  cusip?: Maybe<Scalars['String']['output']>;
  /** If `institution_security_id` is present, this field indicates the Plaid `institution_id` of the institution to whom the identifier belongs. */
  institutionId?: Maybe<Scalars['String']['output']>;
  /** An identifier given to the security by the institution */
  institutionSecurityId?: Maybe<Scalars['String']['output']>;
  /** Indicates that a security is a highly liquid asset and can be treated like cash. */
  isCashEquivalent?: Maybe<Scalars['Boolean']['output']>;
  /** 12-character ISIN, a globally unique securities identifier. A verified CUSIP Global Services license is required to receive this data. This field will be null by default for new customers, and null for existing customers starting March 12, 2024. If you would like access to this field, please start the verification process [here](https://docs.google.com/forms/d/e/1FAIpQLSd9asHEYEfmf8fxJTHZTAfAzW4dugsnSu-HS2J51f1mxwd6Sw/viewform). */
  isin?: Maybe<Scalars['String']['output']>;
  /** The ISO-4217 currency code of the price given. Always `null` if `unofficial_currency_code` is non-`null`. */
  isoCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** The ISO-10383 Market Identifier Code of the exchange or market in which the security is being traded. */
  marketIdentifierCode?: Maybe<Scalars['String']['output']>;
  /** A descriptive name for the security, suitable for display. */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * Details about the option security.
   *
   * For the Sandbox environment, this data is currently only available if the item is using a custom configuration object, and the `ticker` field of the custom security follows the [OCC Option Symbol](https://en.wikipedia.org/wiki/Option_symbol#The_OCC_Option_Symbol) standard with no spaces.
   */
  optionContract?: Maybe<RemoteDataPlaidOptionContract>;
  /** In certain cases, Plaid will provide the ID of another security whose performance resembles this security, typically when the original security has low volume, or when a private security can be modeled with a publicly traded security. */
  proxySecurityId?: Maybe<Scalars['String']['output']>;
  /** A unique, Plaid-specific identifier for the security, used to associate securities with holdings. Like all Plaid identifiers, the `security_id` is case sensitive. The `security_id` may change if inherent details of the security change due to a corporate action, for example, in the event of a ticker symbol change or CUSIP change. */
  securityId?: Maybe<Scalars['String']['output']>;
  /** 7-character SEDOL, an identifier assigned to securities in the UK. */
  sedol?: Maybe<Scalars['String']['output']>;
  /** The security’s trading symbol for publicly traded securities, and otherwise a short identifier if available. */
  tickerSymbol?: Maybe<Scalars['String']['output']>;
  /**
   * The security type of the holding.
   *
   * In rare instances, a null value is returned when institutional data is insufficient to determine the security type.
   *
   * Valid security types are:
   *
   * `cash`: Cash, currency, and money market funds
   *
   * `cryptocurrency`: Digital or virtual currencies
   *
   * `derivative`: Options, warrants, and other derivative instruments
   *
   * `equity`: Domestic and foreign equities
   *
   * `etf`: Multi-asset exchange-traded investment funds
   *
   * `fixed income`: Bonds and certificates of deposit (CDs)
   *
   * `loan`: Loans and loan receivables
   *
   * `mutual fund`: Open- and closed-end vehicles pooling funds of multiple investors
   *
   * `other`: Unknown or other investment types
   */
  type?: Maybe<Scalars['String']['output']>;
  /**
   * The unofficial currency code associated with the security. Always `null` if `iso_currency_code` is non-`null`. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
   *
   * See the [currency code schema](https://plaid.com/docs/api/accounts#currency-code-schema) for a full listing of supported `iso_currency_code`s.
   */
  unofficialCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** Date and time at which `close_price` is accurate, in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Always `null` if `close_price` is `null`. */
  updateDatetime?: Maybe<Scalars['DateTime']['output']>;
};

/** The address of the student loan servicer. This is generally the remittance address to which payments should be sent. */
export type RemoteDataPlaidServicerAddressData = {
  __typename?: 'RemoteDataPlaidServicerAddressData';
  /** The full city name */
  city?: Maybe<Scalars['String']['output']>;
  /** The ISO 3166-1 alpha-2 country code */
  country?: Maybe<Scalars['String']['output']>;
  /** The postal code */
  postalCode?: Maybe<Scalars['String']['output']>;
  /**
   * The region or state
   * Example: `"NC"`
   */
  region?: Maybe<Scalars['String']['output']>;
  /**
   * The full street address
   * Example: `"564 Main Street, APT 15"`
   */
  street?: Maybe<Scalars['String']['output']>;
};

/** Contains details about a student loan account */
export type RemoteDataPlaidStudentLoan = {
  __typename?: 'RemoteDataPlaidStudentLoan';
  /** The ID of the account that this liability belongs to. Each account can only contain one liability. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The account number of the loan. For some institutions, this may be a masked version of the number (e.g., the last 4 digits instead of the entire number). */
  accountNumber?: Maybe<Scalars['String']['output']>;
  /** The dates on which loaned funds were disbursed or will be disbursed. These are often in the past. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  disbursementDates?: Maybe<Array<Scalars['Date']['output']>>;
  /** The date when the student loan is expected to be paid off. Availability for this field is limited. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  expectedPayoffDate?: Maybe<Scalars['Date']['output']>;
  /** The guarantor of the student loan. */
  guarantor?: Maybe<Scalars['String']['output']>;
  /** The interest rate on the loan as a percentage. */
  interestRatePercentage?: Maybe<Scalars['Float']['output']>;
  /** `true` if a payment is currently overdue. Availability for this field is limited. */
  isOverdue?: Maybe<Scalars['Boolean']['output']>;
  /** The amount of the last payment. */
  lastPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** The date of the last payment. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  lastPaymentDate?: Maybe<Scalars['Date']['output']>;
  /** The date of the last statement. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  lastStatementIssueDate?: Maybe<Scalars['Date']['output']>;
  /** The type of loan, e.g., "Consolidation Loans". */
  loanName?: Maybe<Scalars['String']['output']>;
  /** An object representing the status of the student loan */
  loanStatus?: Maybe<RemoteDataPlaidStudentLoanStatus>;
  /**
   * The minimum payment due for the next billing cycle. There are some exceptions:
   * Some institutions require a minimum payment across all loans associated with an account number. Our API presents that same minimum payment amount on each loan. The institutions that do this are: Great Lakes ( `ins_116861`), Firstmark (`ins_116295`), Commonbond Firstmark Services (`ins_116950`), EdFinancial Services (`ins_116304`), Granite State (`ins_116308`), and Oklahoma Student Loan Authority (`ins_116945`).
   * Firstmark (`ins_116295` ), EdFinancial Services (`ins_116304`),  and Navient (`ins_116248`) will display as $0 if there is an autopay program in effect.
   */
  minimumPaymentAmount?: Maybe<Scalars['Float']['output']>;
  /** The due date for the next payment. The due date is `null` if a payment is not expected. A payment is not expected if `loan_status.type` is `deferment`, `in_school`, `consolidated`, `paid in full`, or `transferred`. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD). */
  nextPaymentDueDate?: Maybe<Scalars['Date']['output']>;
  /**
   * The date on which the loan was initially lent. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD).
   *
   */
  originationDate?: Maybe<Scalars['Date']['output']>;
  /** The original principal balance of the loan. */
  originationPrincipalAmount?: Maybe<Scalars['Float']['output']>;
  /** The total dollar amount of the accrued interest balance. For Sallie Mae ( `ins_116944`), this amount is included in the current balance of the loan, so this field will return as `null`. */
  outstandingInterestAmount?: Maybe<Scalars['Float']['output']>;
  /** The relevant account number that should be used to reference this loan for payments. In the majority of cases, `payment_reference_number` will match `account_number,` but in some institutions, such as Great Lakes (`ins_116861`), it will be different. */
  paymentReferenceNumber?: Maybe<Scalars['String']['output']>;
  /** Information about the student's eligibility in the Public Service Loan Forgiveness program. This is only returned if the institution is FedLoan (`ins_116527`).  */
  pslfStatus?: Maybe<RemoteDataPlaidPslfStatus>;
  /** An object representing the repayment plan for the student loan */
  repaymentPlan?: Maybe<RemoteDataPlaidStudentRepaymentPlan>;
  /** The sequence number of the student loan. Heartland ECSI (`ins_116948`) does not make this field available. */
  sequenceNumber?: Maybe<Scalars['String']['output']>;
  /** The address of the student loan servicer. This is generally the remittance address to which payments should be sent. */
  servicerAddress?: Maybe<RemoteDataPlaidServicerAddressData>;
  /** The year to date (YTD) interest paid. Availability for this field is limited. */
  ytdInterestPaid?: Maybe<Scalars['Float']['output']>;
  /** The year to date (YTD) principal paid. Availability for this field is limited. */
  ytdPrincipalPaid?: Maybe<Scalars['Float']['output']>;
};

/** An object representing the status of the student loan */
export type RemoteDataPlaidStudentLoanStatus = {
  __typename?: 'RemoteDataPlaidStudentLoanStatus';
  /**
   * The date until which the loan will be in its current status. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format (YYYY-MM-DD).
   *
   */
  endDate?: Maybe<Scalars['Date']['output']>;
  /** The status type of the student loan */
  type?: Maybe<Scalars['String']['output']>;
};

/** An object representing the repayment plan for the student loan */
export type RemoteDataPlaidStudentRepaymentPlan = {
  __typename?: 'RemoteDataPlaidStudentRepaymentPlan';
  /** The description of the repayment plan as provided by the servicer. */
  description?: Maybe<Scalars['String']['output']>;
  /** The type of the repayment plan. */
  type?: Maybe<Scalars['String']['output']>;
};

/** Plaid Transaction data. */
export type RemoteDataPlaidTransaction = {
  __typename?: 'RemoteDataPlaidTransaction';
  /** The ID of the account in which this transaction occurred. */
  accountId?: Maybe<Scalars['String']['output']>;
  /** The name of the account owner. This field is not typically populated and only relevant when dealing with sub-accounts. */
  accountOwner?: Maybe<Scalars['String']['output']>;
  /** The settled value of the transaction, denominated in the transactions's currency, as stated in `iso_currency_code` or `unofficial_currency_code`. Positive values when money moves out of the account; negative values when money moves in. For example, debit card purchases are positive; credit card payments, direct deposits, and refunds are negative. */
  amount?: Maybe<Scalars['Float']['output']>;
  /** The date that the transaction was authorized. For posted transactions, the `date` field will indicate the posted date, but `authorized_date` will indicate the day the transaction was authorized by the financial institution. If presenting transactions to the user in a UI, the `authorized_date`, when available, is generally preferable to use over the `date` field for posted transactions, as it will generally represent the date the user actually made the transaction. Dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format ( `YYYY-MM-DD` ). */
  authorizedDate?: Maybe<Scalars['Date']['output']>;
  /**
   * Date and time when a transaction was authorized in [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format ( `YYYY-MM-DDTHH:mm:ssZ` ). For posted transactions, the `datetime` field will indicate the posted date, but `authorized_datetime` will indicate the day the transaction was authorized by the financial institution. If presenting transactions to the user in a UI, the `authorized_datetime`, when available, is generally preferable to use over the `datetime` field for posted transactions, as it will generally represent the date the user actually made the transaction.
   *
   * This field is returned for select financial institutions and comes as provided by the institution. It may contain default time values (such as 00:00:00). This field is only populated in API version 2019-05-29 and later.
   */
  authorizedDatetime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * A hierarchical array of the categories to which this transaction belongs. For a full list of categories, see [`/categories/get`](https://plaid.com/docs/api/products/transactions/#categoriesget).
   *
   * All Transactions implementations are recommended to use the new `personal_finance_category` instead of `category`, as it provides greater accuracy and more meaningful categorization.
   *
   * If the `transactions` object was returned by an Assets endpoint such as `/asset_report/get/` or `/asset_report/pdf/get`, this field will only appear in an Asset Report with Insights.
   * @deprecated Deprecated by Plaid
   */
  category?: Maybe<Array<Scalars['String']['output']>>;
  /**
   * The ID of the category to which this transaction belongs. For a full list of categories, see [`/categories/get`](https://plaid.com/docs/api/products/transactions/#categoriesget).
   *
   * All Transactions implementations are recommended to use the new `personal_finance_category` instead of `category`, as it provides greater accuracy and more meaningful categorization.
   *
   * If the `transactions` object was returned by an Assets endpoint such as `/asset_report/get/` or `/asset_report/pdf/get`, this field will only appear in an Asset Report with Insights.
   * @deprecated Deprecated by Plaid
   */
  categoryId?: Maybe<Scalars['String']['output']>;
  /** The check number of the transaction. This field is only populated for check transactions. */
  checkNumber?: Maybe<Scalars['String']['output']>;
  /** The counterparties present in the transaction. Counterparties, such as the merchant or the financial institution, are extracted by Plaid from the raw description. */
  counterparties?: Maybe<Array<RemoteDataPlaidCounterparty>>;
  /** For pending transactions, the date that the transaction occurred; for posted transactions, the date that the transaction posted. Both dates are returned in an [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format ( `YYYY-MM-DD` ). To receive information about the date that a posted transaction was initiated, see the `authorized_date` field. */
  date?: Maybe<Scalars['Date']['output']>;
  /**
   * Date and time when a transaction was posted in [ISO 8601](https://wikipedia.org/wiki/ISO_8601) format ( `YYYY-MM-DDTHH:mm:ssZ` ). For the date that the transaction was initiated, rather than posted, see the `authorized_datetime` field.
   *
   * This field is returned for select financial institutions and comes as provided by the institution. It may contain default time values (such as 00:00:00). This field is only populated in API version 2019-05-29 and later.
   */
  datetime?: Maybe<Scalars['DateTime']['output']>;
  /** The ISO-4217 currency code of the transaction. Always `null` if `unofficial_currency_code` is non-null. */
  isoCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** A representation of where a transaction took place */
  location?: Maybe<RemoteDataPlaidTransactionLocation>;
  /** The URL of a logo associated with this transaction, if available. The logo will always be 100×100 pixel PNG file. */
  logoUrl?: Maybe<Scalars['String']['output']>;
  /** A unique, stable, Plaid-generated ID that maps to the merchant. In the case of a merchant with multiple retail locations, this field will map to the broader merchant, not a specific location or store. */
  merchantEntityId?: Maybe<Scalars['String']['output']>;
  /** The merchant name, as enriched by Plaid from the `name` field. This is typically a more human-readable version of the merchant counterparty in the transaction. For some bank transactions (such as checks or account transfers) where there is no meaningful merchant name, this value will be `null`. */
  merchantName?: Maybe<Scalars['String']['output']>;
  /**
   * The merchant name or transaction description.
   *
   * If the `transactions` object was returned by a Transactions endpoint such as `/transactions/sync` or `/transactions/get`, this field will always appear. If the `transactions` object was returned by an Assets endpoint such as `/asset_report/get/` or `/asset_report/pdf/get`, this field will only appear in an Asset Report with Insights.
   */
  name?: Maybe<Scalars['String']['output']>;
  /** The string returned by the financial institution to describe the transaction. For transactions returned by `/transactions/sync` or `/transactions/get`, this field will be omitted unless the client has set `options.include_original_description` to `true`. */
  originalDescription?: Maybe<Scalars['String']['output']>;
  /**
   * The channel used to make a payment.
   * `online:` transactions that took place online.
   *
   * `in store:` transactions that were made at a physical location.
   *
   * `other:` transactions that relate to banks, e.g. fees or deposits.
   *
   * This field replaces the `transaction_type` field.
   *
   */
  paymentChannel?: Maybe<Scalars['String']['output']>;
  /**
   * Transaction information specific to inter-bank transfers. If the transaction was not an inter-bank transfer, all fields will be `null`.
   *
   * If the `transactions` object was returned by a Transactions endpoint such as `/transactions/sync` or `/transactions/get`, the `payment_meta` key will always appear, but no data elements are guaranteed. If the `transactions` object was returned by an Assets endpoint such as `/asset_report/get/` or `/asset_report/pdf/get`, this field will only appear in an Asset Report with Insights.
   */
  paymentMeta?: Maybe<RemoteDataPlaidPaymentMeta>;
  /** When `true`, identifies the transaction as pending or unsettled. Pending transaction details (name, type, amount, category ID) may change before they are settled. */
  pending?: Maybe<Scalars['Boolean']['output']>;
  /** The ID of a posted transaction's associated pending transaction, where applicable. */
  pendingTransactionId?: Maybe<Scalars['String']['output']>;
  /**
   * Information describing the intent of the transaction. Most relevant for personal finance use cases, but not limited to such use cases.
   *
   * See the [`taxonomy CSV file`](https://plaid.com/documents/transactions-personal-finance-category-taxonomy.csv) for a full list of personal finance categories. If you are migrating to personal finance categories from the legacy categories, also refer to the [`migration guide`](https://plaid.com/docs/transactions/pfc-migration/).
   */
  personalFinanceCategory?: Maybe<RemoteDataPlaidPersonalFinanceCategory>;
  /** The URL of an icon associated with the primary personal finance category. The icon will always be 100×100 pixel PNG file. */
  personalFinanceCategoryIconUrl?: Maybe<Scalars['String']['output']>;
  /**
   * An identifier classifying the transaction type.
   *
   * This field is only populated for European institutions. For institutions in the US and Canada, this field is set to `null`.
   *
   * `adjustment:` Bank adjustment
   *
   * `atm:` Cash deposit or withdrawal via an automated teller machine
   *
   * `bank charge:` Charge or fee levied by the institution
   *
   * `bill payment`: Payment of a bill
   *
   * `cash:` Cash deposit or withdrawal
   *
   * `cashback:` Cash withdrawal while making a debit card purchase
   *
   * `cheque:` Document ordering the payment of money to another person or organization
   *
   * `direct debit:` Automatic withdrawal of funds initiated by a third party at a regular interval
   *
   * `interest:` Interest earned or incurred
   *
   * `purchase:` Purchase made with a debit or credit card
   *
   * `standing order:` Payment instructed by the account holder to a third party at a regular interval
   *
   * `transfer:` Transfer of money between accounts
   */
  transactionCode?: Maybe<Scalars['String']['output']>;
  /** The unique ID of the transaction. Like all Plaid identifiers, the `transaction_id` is case sensitive. */
  transactionId?: Maybe<Scalars['String']['output']>;
  /**
   * Please use the `payment_channel` field, `transaction_type` will be deprecated in the future.
   *
   * `digital:` transactions that took place online.
   *
   * `place:` transactions that were made at a physical location.
   *
   * `special:` transactions that relate to banks, e.g. fees or deposits.
   *
   * `unresolved:` transactions that do not fit into the other three types.
   *
   * @deprecated Deprecated by Plaid
   */
  transactionType?: Maybe<Scalars['String']['output']>;
  /**
   * The unofficial currency code associated with the transaction. Always `null` if `iso_currency_code` is non-`null`. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
   *
   * See the [currency code schema](https://plaid.com/docs/api/accounts#currency-code-schema) for a full listing of supported `iso_currency_code`s.
   */
  unofficialCurrencyCode?: Maybe<Scalars['String']['output']>;
  /** The website associated with this transaction, if available. */
  website?: Maybe<Scalars['String']['output']>;
};

/** A representation of where a transaction took place */
export type RemoteDataPlaidTransactionLocation = {
  __typename?: 'RemoteDataPlaidTransactionLocation';
  /** The street address where the transaction occurred. */
  address?: Maybe<Scalars['String']['output']>;
  /** The city where the transaction occurred. */
  city?: Maybe<Scalars['String']['output']>;
  /** The ISO 3166-1 alpha-2 country code where the transaction occurred. */
  country?: Maybe<Scalars['String']['output']>;
  /** The latitude where the transaction occurred. */
  lat?: Maybe<Scalars['Float']['output']>;
  /** The longitude where the transaction occurred. */
  lon?: Maybe<Scalars['Float']['output']>;
  /** The postal code where the transaction occurred. In API versions 2018-05-22 and earlier, this field is called `zip`. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** The region or state where the transaction occurred. In API versions 2018-05-22 and earlier, this field is called `state`. */
  region?: Maybe<Scalars['String']['output']>;
  /** The merchant defined store number where the transaction occurred. */
  storeNumber?: Maybe<Scalars['String']['output']>;
};

/** Configuration parameters for the Transactions product */
export type RemoteDataPlaidTransactionsInput = {
  /**
   * The maximum number of days of transaction history to request for the Transactions product. For developer accounts created after December 3, 2023, if no value is specified, this will default to 90 days. For developer accounts created on December 3, 2023 or earlier, if no value is specified, this will default to 730 days until June 24, 2024, at which point it will default to 90 days.
   *
   * We strongly recommend that customers utilizing [Recurring Transactions](https://plaid.com/docs/api/products/transactions/#transactionsrecurringget) request at least 180 days of history for optimal results.
   */
  daysRequested?: InputMaybe<Scalars['Int']['input']>;
};

/** Specifies options for initializing Link for [update mode](https://plaid.com/docs/link/update-mode). */
export type RemoteDataPlaidUpdateInput = {
  /** If `true`, enables [update mode with Account Select](https://plaid.com/docs/link/update-mode/#using-update-mode-to-request-new-accounts) for institutions that do not use OAuth, or that use OAuth but do not have their own account selection flow. For institutions that have an OAuth account selection flow (i.e. most OAuth-enabled institutions), update mode with Account Select will always be enabled, regardless of the value of this field. */
  accountSelectionEnabled?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Insights from performing database verification for the account. */
export type RemoteDataPlaidVerificationInsights = {
  __typename?: 'RemoteDataPlaidVerificationInsights';
  /**
   * Indicator of account number format validity for institution.
   *
   * `valid`: indicates that the account number has a correct format for the institution.
   *
   * `invalid`: indicates that the account number has an incorrect format for the institution.
   *
   * `unknown`: indicates that there was not enough information to determine whether the format is correct for the institution.
   */
  accountNumberFormat?: Maybe<Scalars['String']['output']>;
  /** Status information about the account and routing number in the Plaid network. */
  networkStatus?: Maybe<RemoteDataPlaidVerificationInsightsNetworkStatus>;
  /** Information about known ACH returns for the account and routing number. */
  previousReturns?: Maybe<RemoteDataPlaidVerificationInsightsNetworkStatus>;
};

/** Status information about the account and routing number in the Plaid network. */
export type RemoteDataPlaidVerificationInsightsNetworkStatus = {
  __typename?: 'RemoteDataPlaidVerificationInsightsNetworkStatus';
  /** Indicates whether we found at least one matching account for the ACH account and routing number. */
  hasNumbersMatch?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates if at least one matching account for the ACH account and routing number is already verified. */
  isNumbersMatchVerified?: Maybe<Scalars['Boolean']['output']>;
};

/** Options for searching through a list. */
export type SearchQuery = {
  /** Query for searching. */
  term?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a Security */
export type Security = {
  __typename?: 'Security';
  /** CUSIP ID */
  cusip?: Maybe<Scalars['String']['output']>;
  /** ISIN ID */
  isin?: Maybe<Scalars['String']['output']>;
  /** Name */
  name?: Maybe<Scalars['String']['output']>;
  /** Ticker Symbol */
  tickerSymbol?: Maybe<Scalars['String']['output']>;
};

/** Represents a Statement. */
export type Statement = {
  __typename?: 'Statement';
  /** The Account associated with the Statement. */
  account: Account;
  /** The end date of the Statement period. */
  endOn?: Maybe<Scalars['Date']['output']>;
  /** The ID of the Statement. */
  id: Scalars['ID']['output'];
  /** The start date of the Statement period. */
  startOn?: Maybe<Scalars['Date']['output']>;
  /** The URL of the Statement PDF, with a 1-hour expiration. */
  url: Scalars['URL']['output'];
};

/** The connection type for Statement. */
export type StatementConnection = {
  __typename?: 'StatementConnection';
  /** The total number of records. */
  count: Scalars['Int']['output'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<StatementEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Statement>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type StatementEdge = {
  __typename?: 'StatementEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node?: Maybe<Statement>;
};

/** Options for filtering Statements. */
export type StatementFilter = {
  /**
   * Filter for Statements by one or more supplied Account IDs.
   *
   * Examples:
   * - `{ accountIds: ["acct_12Hz9Dz7vEAuljYvhmPcvM9"] }` for Statements for a specific account
   *
   */
  accountIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /**
   * Filter for Statements by overlap with the supplied data range.
   *
   * Examples:
   * - `{ for: { start: "2024-06-01", end: "2024-08-31" } }` for Statements that cover June through August 2024.
   *
   */
  for?: InputMaybe<DateRange>;
  /**
   * Filter for Statements issued on the supplied month.
   *
   * Examples:
   * - `{ issued_for: { year: "2024", month: "8" } }` for Statements that where issued during August 2024.
   *
   */
  issuedFor?: InputMaybe<DateMonth>;
  /**
   * Filter for Statements covered by the supplied date.
   *
   * Examples:
   * - `{ on: "2024-08-15" }` for Statements that cover August 15, 2024.
   *
   */
  on?: InputMaybe<Scalars['Date']['input']>;
};

/** Options for sorting statements. */
export enum StatementSort {
  /** Oldest First, Unknown Periods Last */
  DateAsc = 'DATE_ASC',
  /** Newest First, Unknown Periods First */
  DateDesc = 'DATE_DESC'
}

/** The top-level Subscription type. Subscriptions are used to watch for events emitted from the server. */
export type Subscription = {
  __typename?: 'Subscription';
  /** An Account was verified for money movement. */
  accountVerified: AccountVerifiedPayload;
  /** A Connection was created. */
  connectionCreated: ConnectionCreatedPayload;
  /** A Connection was synced. */
  connectionSynced: ConnectionSyncedPayload;
  /**
   * A Connection was updated.
   * @deprecated Use `connectionSynced`
   */
  connectionUpdated: ConnectionUpdatedPayload;
  /** A Subscription for Debuging, Runs at every minute */
  ping: PingPayload;
};


/** The top-level Subscription type. Subscriptions are used to watch for events emitted from the server. */
export type SubscriptionAccountVerifiedArgs = {
  accountId?: InputMaybe<Scalars['ID']['input']>;
};


/** The top-level Subscription type. Subscriptions are used to watch for events emitted from the server. */
export type SubscriptionConnectionSyncedArgs = {
  connectionId?: InputMaybe<Scalars['ID']['input']>;
};


/** The top-level Subscription type. Subscriptions are used to watch for events emitted from the server. */
export type SubscriptionConnectionUpdatedArgs = {
  connectionId?: InputMaybe<Scalars['ID']['input']>;
};

/** A Transaction represents financial activity associated with an Account. */
export type Transaction = {
  __typename?: 'Transaction';
  /** The Account of the Transaction. */
  account: Account;
  /** The amount. */
  amount: Scalars['Float']['output'];
  /** The ISO-4217 currency code of the Transaction */
  currencyCode: CurrencyCode;
  /** The date. */
  date: Scalars['Date']['output'];
  /** The description or line item name. */
  description: Scalars['String']['output'];
  /** Specifies whether the Transaction is a debit or a credit. */
  entryType: TransactionEntryType;
  /** For Investments: The total amount of all fees applied to this transaction. */
  fees?: Maybe<Scalars['Float']['output']>;
  /** The ID of the Transaction. */
  id: Scalars['ID']['output'];
  /** Represents the classification of an Transaction. */
  kind: AccountKind;
  /** A single Transaction Logo. */
  logo?: Maybe<Image>;
  /**
   * The Merchant associated with the Transaction.
   * @deprecated This feature is in alpha
   */
  merchant?: Maybe<Merchant>;
  /**
   * Custom metadata about the Transaction, stored in a 'key-value' format.
   *
   * See the [Custom Metadata](https://quiltt.dev/api/custom-metadata) guide for more information and examples.
   *
   */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** For Investments: The price of the security at the time of this transaction. */
  price?: Maybe<Scalars['Float']['output']>;
  /** The original provider of the Transaction. */
  provider?: Maybe<ConnectionProvider>;
  /** For Investments: The quantity of security units involved in this transaction: positive for purchases and negative for sales. */
  quantity?: Maybe<Scalars['Float']['output']>;
  /**
   * The Remote Data associated with the Transaction.
   *
   * See the [Remote Data guide](https://quiltt.dev/api/remote-data) for more information.
   *
   */
  remoteData?: Maybe<TransactionRemoteData>;
  /** The Security associated with the Investment Transaction. */
  security?: Maybe<Security>;
  /** The status of the Transaction. */
  status: TransactionStatus;
};


/** A Transaction represents financial activity associated with an Account. */
export type TransactionLogoArgs = {
  source?: InputMaybe<ImageSource>;
};

/** The connection type for Transaction. */
export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  /** The total number of records. */
  count: Scalars['Int']['output'];
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<TransactionEdge>>>;
  /** A list of nodes. */
  nodes?: Maybe<Array<Maybe<Transaction>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node?: Maybe<Transaction>;
};

/** Whether the transaction represents a credit or a debit. */
export enum TransactionEntryType {
  /** An entry recording money being advanced into the account. */
  Credit = 'CREDIT',
  /** An entry recording money being withdrawn from the account. */
  Debit = 'DEBIT'
}

/** Options for filtering Transactions. */
export type TransactionFilter = {
  /**
   * Filter Transactions by one or more supplied Account IDs.
   *
   * Examples:
   * - `{ accountIds: ["acct_12Hz9Dz7vEAuljYvhmPcvM9"] }` for Transactions from a specific account
   *
   */
  accountIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** The amount of the Transaction */
  amount?: InputMaybe<Scalars['Float']['input']>;
  /** Absolute value of the amount of the Transaction */
  amount_abs?: InputMaybe<Scalars['Float']['input']>;
  /** Greater than the absolute value of the amount of the Transaction */
  amount_abs_gt?: InputMaybe<Scalars['Float']['input']>;
  /** Greater than or equal to the absolute value of the amount of the Transaction */
  amount_abs_gte?: InputMaybe<Scalars['Float']['input']>;
  /** Less than the absolute value of the amount of the Transaction */
  amount_abs_lt?: InputMaybe<Scalars['Float']['input']>;
  /** Less than or equal to the absolute value of the amount of the Transaction */
  amount_abs_lte?: InputMaybe<Scalars['Float']['input']>;
  /** Greater than the amount of the Transaction */
  amount_gt?: InputMaybe<Scalars['Float']['input']>;
  /** Greater than or equal to the amount of the Transaction */
  amount_gte?: InputMaybe<Scalars['Float']['input']>;
  /** Less than the amount of the Transaction */
  amount_lt?: InputMaybe<Scalars['Float']['input']>;
  /** Less than or equal to the amount of the Transaction */
  amount_lte?: InputMaybe<Scalars['Float']['input']>;
  /** The date of the Transaction. */
  date?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than the date of the Transaction. */
  date_gt?: InputMaybe<Scalars['Date']['input']>;
  /** Greater than or equal to the date of the Transaction. */
  date_gte?: InputMaybe<Scalars['Date']['input']>;
  /** Less than the date of the Transaction. */
  date_lt?: InputMaybe<Scalars['Date']['input']>;
  /** Less than or equal to the date of the Transaction. */
  date_lte?: InputMaybe<Scalars['Date']['input']>;
  /**
   * Filter Transactions by debit/credit status.
   *
   * Examples:
   * - `{ entryType: DEBIT }` to only return account outflows
   * - `{ entryType: CREDIT }` to only return account inflows
   *
   */
  entryType?: InputMaybe<TransactionEntryType>;
  /**
   * Filter Transactions by one of more classifications.
   *
   * Examples:
   * - `{ kind: DEPOSITORY }` to only return depository transactions (i.e. checking/savings).
   * - `{ kind: [LOAN, CREDIT] }` to only return loan and credit transactions.
   *
   */
  kind?: InputMaybe<Array<AccountKind>>;
  /**
   * Filter out Transactions by one or more classification.
   *
   * Examples:
   * - `{ kind_not: DEPOSITORY }` to exclude depository transactions (i.e. checking/savings).
   * - `{ kind_not: [LOAN, CREDIT] }` to exclude loan and credit transactions.
   *
   */
  kind_not?: InputMaybe<Array<AccountKind>>;
  /**
   * Filter by the contents of Transaction `metadata`.
   *
   * Examples:
   * - `{ metadata: { hidden: true } }` to only return Transactions marked as "hidden" in your metadata
   * - `{ metadata: { my_category: "Tasty Treats" } }` to only return Transactions that match your categorization system
   * - `{ metadata: null }` to only return Transactions without metadata
   *
   */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /**
   * Filter Transactions by Transaction status.
   *
   * Examples:
   * - `{ status: POSTED }` to only return posted transactions.
   * - `{ status: PENDING }` to only return pending transactions.
   *
   */
  status?: InputMaybe<Array<TransactionStatus>>;
};

/** Remote data associated with a Transaction. */
export type TransactionRemoteData = {
  __typename?: 'TransactionRemoteData';
  /** The FinGoal remote data associated with the Transaction. */
  fingoal?: Maybe<TransactionRemoteDataFingoal>;
  /** The Finicity remote data associated with the Transaction. */
  finicity?: Maybe<TransactionRemoteDataFinicity>;
  /** The Mock remote data associated with the Transaction. */
  mock?: Maybe<TransactionRemoteDataMock>;
  /** The MX remote data associated with the Transaction. */
  mx?: Maybe<TransactionRemoteDataMx>;
  /** The Plaid remote data associated with the Transaction. */
  plaid?: Maybe<TransactionRemoteDataPlaid>;
};

/** Transaction-level data from FinGoal. */
export type TransactionRemoteDataFingoal = {
  __typename?: 'TransactionRemoteDataFingoal';
  /** The Enrichment data from FinGoal. */
  enrichment?: Maybe<TransactionRemoteDataFingoalEnrichment>;
};

/** The Enrichment data from Fingoal. */
export type TransactionRemoteDataFingoalEnrichment = {
  __typename?: 'TransactionRemoteDataFingoalEnrichment';
  /** The record's Fingoal ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFingoalEnrichedTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Transaction-level data from Finicity. */
export type TransactionRemoteDataFinicity = {
  __typename?: 'TransactionRemoteDataFinicity';
  /** The Transaction data from Finicity. */
  transaction?: Maybe<TransactionRemoteDataFinicityTransaction>;
};

/** The Transaction data from Finicity. */
export type TransactionRemoteDataFinicityTransaction = {
  __typename?: 'TransactionRemoteDataFinicityTransaction';
  /** The record's Finicity ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataFinicityTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Transaction-level data from Mock. */
export type TransactionRemoteDataMock = {
  __typename?: 'TransactionRemoteDataMock';
  /** The Transaction data from Mock. */
  transaction?: Maybe<TransactionRemoteDataMockTransaction>;
};

/** The Transaction data from Mock. */
export type TransactionRemoteDataMockTransaction = {
  __typename?: 'TransactionRemoteDataMockTransaction';
  /** The record's Mock ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMockTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Transaction-level data from MX. */
export type TransactionRemoteDataMx = {
  __typename?: 'TransactionRemoteDataMx';
  /** The Enrichment data from MX. */
  enrichment?: Maybe<TransactionRemoteDataMxEnrichment>;
  /** The base Transaction data from MX. */
  transaction?: Maybe<TransactionRemoteDataMxTransaction>;
};

/** The Enrichment data from Mx. */
export type TransactionRemoteDataMxEnrichment = {
  __typename?: 'TransactionRemoteDataMxEnrichment';
  /** The record's Mx ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMxEnhanceTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Transaction data from Mx. */
export type TransactionRemoteDataMxTransaction = {
  __typename?: 'TransactionRemoteDataMxTransaction';
  /** The record's Mx ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataMxTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Transaction-level data from Plaid. */
export type TransactionRemoteDataPlaid = {
  __typename?: 'TransactionRemoteDataPlaid';
  /** The Investment Transaction data from Plaid. */
  investmentTransaction?: Maybe<TransactionRemoteDataPlaidInvestmentTransaction>;
  /** The Security data from Plaid. */
  security?: Maybe<TransactionRemoteDataPlaidSecurity>;
  /** The base Transaction data from Plaid. */
  transaction?: Maybe<TransactionRemoteDataPlaidTransaction>;
};

/** The Investment Transaction data from Plaid. */
export type TransactionRemoteDataPlaidInvestmentTransaction = {
  __typename?: 'TransactionRemoteDataPlaidInvestmentTransaction';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidInvestmentTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Security data from Plaid. */
export type TransactionRemoteDataPlaidSecurity = {
  __typename?: 'TransactionRemoteDataPlaidSecurity';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidSecurity>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** The Transaction data from Plaid. */
export type TransactionRemoteDataPlaidTransaction = {
  __typename?: 'TransactionRemoteDataPlaidTransaction';
  /** The record's Plaid ID. */
  id: Scalars['String']['output'];
  /** The response body. */
  response?: Maybe<RemoteDataPlaidTransaction>;
  /** The date and time when the data was fetched. */
  timestamp: Scalars['DateTime']['output'];
};

/** Options for sorting transactions. */
export enum TransactionSort {
  /** Oldest First, Pending Last */
  DateAsc = 'DATE_ASC',
  /** Newest First, Pending First */
  DateDesc = 'DATE_DESC'
}

/** Represents the status for a Transaction. */
export enum TransactionStatus {
  /** Awaiting decision or settlement, and may be replaced, updated, or removed. */
  Pending = 'PENDING',
  /** Announced or published as conclusive. */
  Posted = 'POSTED',
  /** Estimated or forecast on the basis of current trends or data. */
  Projected = 'PROJECTED'
}

/** Autogenerated input type of TransactionUpdate */
export type TransactionUpdateInput = {
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The ID of the transaction to be updated. */
  id: Scalars['ID']['input'];
  /** Customizable metadata. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
};

/** Autogenerated return type of TransactionUpdate. */
export type TransactionUpdatePayload = {
  __typename?: 'TransactionUpdatePayload';
  /** A unique identifier for the client performing the mutation. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of errors from an unsuccessful mutation. */
  errors?: Maybe<Array<Error>>;
  /** The updated transaction. */
  record?: Maybe<Transaction>;
  /** Specifies whether the mutation was successful. */
  success: Scalars['Boolean']['output'];
};
