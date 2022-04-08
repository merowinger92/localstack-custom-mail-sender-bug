import {
  buildClient,
  CommitmentPolicy,
  KmsKeyringNode,
} from '@aws-crypto/client-node'
import { toByteArray } from 'base64-js'
import { CustomEmailSenderTriggerEvent } from 'aws-lambda'



const client = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT)
const generatorKeyId = process.env.KEY_ALIAS
const keyIds = [String(process.env.KEY_ID)]
const keyring = new KmsKeyringNode({ generatorKeyId, keyIds })

export async function main(
  event: CustomEmailSenderTriggerEvent
): Promise<void> {
  console.log(event)
  // Decrypt the secret code using encryption SDK.
  let plainTextCode;
  if(event.request.code){
  const { plaintext } = await client.decrypt(keyring, toByteArray(event.request.code));
  plainTextCode = plaintext
  }
}
