import styles from "../../styles/Profile.module.css"
import { useProfileQuery, usePublicationsQuery } from '../../../graphql/generated'
import { useRouter } from "next/router"
import { MediaRenderer, Web3Button } from "@thirdweb-dev/react";
import FeedPost from "../../components/FeedPost"
import { POLYGON_CONTRACT_ABI, POLYGON_CONTRACT_ADDRESS } from "../../constants/polygonContracts";
import { MUMBAI_CONTRACT_ABI, MUMBAI_CONTRACT_ADDRESS } from "../../constants/mumbaiContracts";
import { useFollow } from "../../lib/useFollow";


const ProfilePage = () => {

    const router = useRouter();
    const { id } = router.query

    const {mutateAsync: followUser} = useFollow();

    const { isLoading: loadingProfile, data: profileData, error: profileError} = useProfileQuery(
    {
        request: {
            handle: id
        }
    },
    {
        enabled: !!id
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

    console.log(id)

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

            <Web3Button 
                contractAddress={MUMBAI_CONTRACT_ADDRESS}
                contractAbi={MUMBAI_CONTRACT_ABI}
                action={async () => await followUser(profileData?.profile?.id)}
            >
                Follow User
            </Web3Button>

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

export default ProfilePage