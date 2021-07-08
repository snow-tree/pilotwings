import { Transform, TransformFnParams } from 'class-transformer'
// import { parse } from 'date-fns'
import { maybe } from 'typescript-monads'

function toCleanStringOrNull(a: TransformFnParams) {
  return maybe<string>(a.value).map(b => b.trim()).filter(a => a !== '').valueOrNull()
}

export class PilotCertRecord {

}

export class PilotRecord {
  [key: string]: string | number | Date | null
  
  id!: number

  @Transform(toCleanStringOrNull)
  firstAndMiddleName!: string
  
  @Transform(toCleanStringOrNull)
  lastName!: string
  
  @Transform(toCleanStringOrNull)
  street1: string | null = null
  
  @Transform(toCleanStringOrNull)
  street2: string | null = null

  @Transform(toCleanStringOrNull)
  city: string | null = null

  @Transform(toCleanStringOrNull)
  state: string | null = null

  @Transform(toCleanStringOrNull)
  zipcode: string | null = null
  
  @Transform(toCleanStringOrNull)
  country: string | null = null

  @Transform(toCleanStringOrNull)
  region: string | null = null

  @Transform(ob => +ob.value)
  medicalClass!: number

  // @Transform(a => parse(a.value, 'mmyyyy', new Date()))
  // medicalDate: Date | null = null

  // @Transform(a => parse(a.value, 'mmyyyy', new Date()))
  // medicalExpiryDate: Date | null = null

  // @Transform(a => parse(a.value, 'yyyymmdd', new Date()))
  // basicMedCourseDate: Date | null = null

}