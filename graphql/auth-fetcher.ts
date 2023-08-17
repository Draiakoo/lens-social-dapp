import { isTokenExpired, readAccessToken } from "../src/lib/auth/helpers";
import refreshAccessToken from "../src/lib/auth/refreshAccessToken";

export const fetcher = <TData, TVariables>(
  query: string, 
  variables?: TVariables, 
  options?: RequestInit['headers']
  ): (() => Promise<TData>) => {

    async function getAccessToken() {
      //Check the local storage for the access token
      const token = readAccessToken();

      //If there is not token, then return null (not signed in)
      if(!token) return null;

      let accessToken = token.accessToken;

      //If there is token, check it's expiration
      if(isTokenExpired(token.exp)){
        //If it's expired, update it using the refresg token
        const newToken = await refreshAccessToken();
        if(!newToken) return null;
        accessToken = newToken;
      }
      
      //Return the token
      return accessToken;
    }

  return async (): Promise<TData> => {

    const token = typeof window !== "undefined" ? await getAccessToken() : null;

    const polygonEndpoint = "https://api.lens.dev/"
    const mumbaiEndpoint = "https://api-mumbai.lens.dev/"

    const res = await fetch(mumbaiEndpoint, {
      method: 'POST',
      headers: {
        "Content-Type":"application/json",
        ...options,
        "x-access-token": token ? token : "",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        query,
        variables
      }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0] || {};
      throw new Error(message || "Error...");
    }

    return json.data;
  }
}