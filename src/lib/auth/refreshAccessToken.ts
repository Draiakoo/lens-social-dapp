import { RefreshMutation, RefreshMutationVariables, RefreshDocument } from "../../../graphql/generated"
import { readAccessToken, setAccessToken } from "./helpers"

export default async function refreshAccessToken() {
    
    //Read the refresh token from local storage
    const currentRefreshToken = readAccessToken()?.refreshToken;

    const polygonEndpoint = "https://api.lens.dev/"
    const mumbaiEndpoint = "https://api-mumbai.lens.dev/"
    
    if(!currentRefreshToken) return null;

    async function fetchData<TData, TVariables>(
        query: string, 
        variables?: TVariables, 
        options?: RequestInit['headers']
    ): Promise<TData>{
            const res = await fetch(mumbaiEndpoint, {
              method: 'POST',
              headers: {
                "Content-Type":"application/json",
                ...options,
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
    
    
    //Set the new access token in local storage
    const result = await fetchData<
        RefreshMutation,
        RefreshMutationVariables>(RefreshDocument, {
            request: {
                refreshToken: currentRefreshToken
            }
        })

    const { refresh: {accessToken, refreshToken: newRefreshToken}} = result;

    setAccessToken(accessToken, newRefreshToken);

    return accessToken as string;
}