import { Metadata } from 'next'
import { MembersContent } from './components/members-content'

export const metadata: Metadata = {
  title: 'Members | Ecclesia GNC',
  description: 'Manage church members and their information',
}

export default function MembersPage() {
  return <MembersContent />
}
