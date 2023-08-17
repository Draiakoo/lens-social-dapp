import { useQuery } from "@tanstack/react-query";
import { useAddress } from "@thirdweb-dev/react";
import { readAccessToken } from "./helpers";
import { useDefaultProfileQuery } from "../../../graphql/generated";

export default function useLensUser() {
    //Make a react query for the local storage key
    const address = useAddress();
    const localStorageQuery = useQuery(
        ["lens-user", address],

        //Writing the actual function to check the local storage
        () => readAccessToken()
    )
    
    //If there is a connected wallet address, ask for the default Lens profile
    const profileQuery = useDefaultProfileQuery({
        request: {
            ethereumAddress: address
        }
    },
    {
        enabled: address !== undefined
    });

    return {
        isSignedInQuery: localStorageQuery,
        profileQuery: profileQuery
    }

}