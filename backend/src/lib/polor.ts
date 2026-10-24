import type { Env } from "./env";
import  { checkoutCreateBody } from './../@types/checkout.types';
import { BadGatewayError, BadRequestError, InternalServerError } from "./error-response";

export async function polarCreateCheckout(env:Env, body:checkoutCreateBody) {
  const token = env.POLOR_ACCESS_TOKEN;
  if(!token) throw new BadRequestError("polar access token is not configured");
  const res = await fetch(`${env.POLOR_API_BASE}/v1/checkouts/`, {
    method:"POST",
    headers:{
      Authorization:`Bearer ${token}`,
      "Content-type":"application/json",
    },
    body:JSON.stringify(body),
  })

  if(!res.ok && res.status > 500) {
    const errorText = await res.text();
    throw new BadGatewayError(`Polar checkout failed:${res.status} ${errorText}`);
  } else if(!res.ok && res.status === 500) {
    throw new InternalServerError()
  }

  const data = (await res.json()) as { id :string , url:string};
  return {id:data.id, url:data.url};
}