import { Metadata } from "next"
import AdCreator from "./AdCreator"

export const metadata: Metadata = {
  title: "Make Ad - Pictoring",
  description: "Create engaging advertisements with AI",
}

export default function MakeAdPage() {
  return <AdCreator />
} 