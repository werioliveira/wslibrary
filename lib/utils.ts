import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import bcryptjs from "bcryptjs"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function saltAndHashPassword(password: string){
    const saltRounds = 10
    const salt = bcryptjs.genSaltSync(saltRounds)
    const hash = bcryptjs.hashSync(password, salt)
    return hash
}