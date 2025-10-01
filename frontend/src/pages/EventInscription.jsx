import { useParams } from 'react-router-dom'
import InscriptionForm from '../components/InscriptionForm'

function EventInscription() {
  const { eventId } = useParams()
  
  return <InscriptionForm eventId={eventId} />
}

export default EventInscription