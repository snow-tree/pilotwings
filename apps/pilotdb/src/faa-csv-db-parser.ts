import { plainToClass } from "class-transformer"
import { readFile } from "fs/promises"
import { PilotRecord } from "./pilot.model"

export function parseBasicPilotCsv(path: string): Promise<Record<string, PilotRecord>> {
  return readFile(path)
    .then(a => {
      return a.toString()
        .split('\n')
        .slice(1) // DO NOT NEED THE HEADER ROW
        .reduce((acc, row) => {
          const [
            id,
            firstAndMiddleName,
            lastName,
            street1,
            street2,
            city,
            state,
            zipcode,
            country,
            region,
            medicalClass,
            // medicalDate,
            // medicalExpiryDate,
            // basicMedCourseDate
          ] = row.split(',')

          const obj = firstAndMiddleName && lastName ? {
            id,
            firstAndMiddleName,
            lastName,
            street1,
            street2,
            city,
            state,
            zipcode,
            country,
            region,
            medicalClass,
            // medicalDate,
            // medicalExpiryDate,
            // basicMedCourseDate
          } : undefined

          const cleanedObj = plainToClass(PilotRecord, obj)

          return Object.assign(acc, obj ? { [id]: cleanedObj } : {})

        }, {})
    })
}
