import styles from "../../styles/Profile.module.css"
import { useFollowingQuery, useProfileQuery, usePublicationsQuery, useFollowersQuery } from '../../../graphql/generated'
import { MediaRenderer, Web3Button, useAddress } from "@thirdweb-dev/react";
import FeedPost from "../../components/FeedPost"
import { POLYGON_CONTRACT_ABI, POLYGON_CONTRACT_ADDRESS } from "../../constants/polygonContracts";
import { MUMBAI_CONTRACT_ABI, MUMBAI_CONTRACT_ADDRESS } from "../../constants/mumbaiContracts";
import useLensUser from "../../lib/auth/useLensUser";
import { useState } from "react"


const MyProfilePage = () => {
    const {isSignedInQuery, profileQuery} = useLensUser();
    const address = useAddress();
    const [viewFollowing, setViewFollowing] = useState<Boolean>(false);
    const [viewFollowers, setViewFollowers] = useState<Boolean>(false);

    const { isLoading: loadingProfile, data: profileData, error: profileError} = useProfileQuery(
    {
        request: {
            handle: profileQuery.data?.defaultProfile?.handle
        }
    },
    {
        enabled: !!profileQuery.data?.defaultProfile?.handle
    })

    const followersQuery = useFollowersQuery({
        request: {
            profileId: profileData?.profile?.id
        }
    },
    {
        enabled: !!profileData?.profile?.id
    })

    const followingQuery = useFollowingQuery({
        request: {
            address: address
        }
    },
    {
        enabled: !!address
    })

    const { isLoading: isLoadingPublications, data: publicationsData, error: publicationsError } = usePublicationsQuery(
    {
        request: {
            profileId: profileData?.profile?.id
        }
    },
    {
        enabled: !!profileData?.profile?.id
    })

    

    if(publicationsError || profileError){
        return <div>Could not find this profile</div>
    }

    if(loadingProfile){
        return <div>Loading profile...</div>
    }

  return (
    <div className={styles.profileContainer}>
        <div className={styles.profileContentContainer}>
            {profileData?.profile?.coverPicture?.original?.url && (
                <MediaRenderer 
                    src={profileData?.profile?.coverPicture?.original?.url || ""}
                    alt={profileData?.profile?.name || profileData?.profile?.handle}
                    className={styles.coverImageContainer}
                />
            )}

            {profileData?.profile?.picture?.original?.url && (
                <MediaRenderer 
                    src={profileData.profile.picture.original.url}
                    alt={profileData.profile.name || profileData.profile.handle || ""}
                    className={styles.profilePictureContainer}
                />
            )}

            <h1 className={styles.profileName}>{profileData?.profile?.name || "Unknown user"}</h1>

            <p className={styles.profileHandle}>@{profileData?.profile?.handle || "Unknown user"}</p>

            <p className={styles.profileDescription}>{profileData?.profile?.bio}</p>

            <p className={styles.followCount}>{profileData?.profile?.stats.totalFollowers}{" followers"}</p>

            <button onClick={() => setViewFollowers(!viewFollowers)}>
                View followers users
            </button>

            <button onClick={() => setViewFollowing(!viewFollowing)}>
                View following users
            </button>
            
            {
                viewFollowers 
                    ? followersQuery.data?.followers.items.map((profile, index) => {
                        return(
                            <div style={{display: "flex"}} key={index}>
                                <img src={profile.wallet?.defaultProfile?.picture?.original.url} style={{height: 36, width: 36, borderRadius: "50%"}}></img>
                                <p>{profile.wallet?.defaultProfile?.handle}</p>
                            </div>
                        )
                    })
                    : <></>
            }

            {
                viewFollowing 
                    ? followingQuery.data?.following.items.map((profile, index) => {
                        return(
                            <div style={{display: "flex"}} key={index}>
                                <img src={profile.profile?.picture?.original.url} style={{height: 36, width: 36, borderRadius: "50%"}}></img>
                                <p>{profile.profile?.handle}</p>
                            </div>
                        )
                    })
                    : <></>
            }

            <div className={styles.publicationsContainer}>
                {
                    publicationsData?.publications.items.map((publication) => {
                        if(isLoadingPublications) return(<div>Loading publications ...</div>)
                        else return(<FeedPost publication={publication} key={publication.id}/>)
                    })
                }
            </div>
        </div>
    </div>
  )
}

export default MyProfilePage