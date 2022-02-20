import { CustomEmailSenderTriggerEvent } from 'aws-lambda'

export async function main(
  event: CustomEmailSenderTriggerEvent
): Promise<void> {
  console.log(event)
}
