import { PublicationMainFocus, PublicationSortCriteria, useExplorePublicationsQuery } from "../../graphql/generated"
import FeedPost from "../components/FeedPost"
import SignInButton from "../components/SignInButton"
import styles from "../styles/Home.module.css"

export default function Home() {

  const {isLoading, error, data } = useExplorePublicationsQuery({
    request: {
      sortCriteria: PublicationSortCriteria.Latest,
      // Filter by Image, Article, Video, ...
      // metadata: {
      //   mainContentFocus: PublicationMainFocus.Image
      // }
    }
  },
  {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })

  if(error){
    return(
      <div className={styles.container}>
        Error...
      </div>
    )
  }

  if(isLoading){
    return(
      <div className={styles.container}>
        Loading...
      </div>
    )
  }

  return(
    <div className={styles.container}>
      <div className={styles.postsContainer}>
        {
          data?.explorePublications.items.map((publication) => {
            return(
              <FeedPost publication={publication} key={publication.id}/>
            )
          })
        }
      </div>
    </div>
  )
}
