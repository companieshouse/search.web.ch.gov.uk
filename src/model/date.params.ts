export interface DissolvedDates {
    dissolvedFromDay: string | null,
    dissolvedFromMonth: string | null,
    dissolvedFromYear: string | null,
    dissolvedToDay: string | null
    dissolvedToMonth: string | null,
    dissolvedToYear: string | null
}

export interface FullDissolvedDates {
   dissolvedFromDate: string,
   dissolvedToDate: string
}

export interface IncorporationDates {
    incorporationFromDay: string | null,
    incorporationFromMonth: string | null,
    incorporationFromYear: string | null,
    incorporationToDay: string | null
    incorporationToMonth: string | null,
    incorporationToYear: string | null
}

export interface FullIncorporationDates {
   incorporationFromDate: string,
   incorporationToDate: string
}

export interface FullDates {
    fullDissolvedDates: FullDissolvedDates,
    fullIncorporationDates: FullIncorporationDates
}
