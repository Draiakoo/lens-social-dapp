import { MediaRenderer } from "@thirdweb-dev/react";
import Link from "next/link";
import React from "react";
import { ExplorePublicationsQuery } from '../../graphql/generated'
import styles from "../styles/FeedPost.module.css";
import { useMirror } from "../lib/useMirror";

type Props = {
  publication: ExplorePublicationsQuery["explorePublications"]["items"][0];
};

export default function FeedPost({ publication }: Props) {

  const {mutateAsync: mirrorUser} = useMirror();

  const profileId = publication.profile.id
  const publicationId = publication.id

  console.log(publication)

  return (
    <div className={styles.feedPostContainer}>
      <div className={styles.feedPostHeader}>
        <MediaRenderer
          // @ts-ignore
          src={publication?.profile?.picture?.original?.url || ""}
          alt={publication.profile.name || publication.profile.handle}
          className={styles.feedPostProfilePicture}
          style={{
            width: 48,
            height: 48
          }}
        />

        <Link
          href={`/profile/${publication.profile.handle}`}
          className={styles.feedPostProfileName}
        >
          {publication.profile.name || publication.profile.handle}
        </Link>
      </div>

      <div className={styles.feedPostContent}>
        <h3 className={styles.feedPostContentTitle}>
          {publication.metadata.name}
        </h3>

        <p className={styles.feedPostContentDescription}>
          {publication.metadata.content}
        </p>

        {(publication.metadata.image ||
          publication.metadata.media?.length > 0) && (
          <MediaRenderer
            src={
              publication.metadata.image ||
              publication.metadata.media[0].original.url
            }
            alt={publication.metadata.name || ""}
            className={styles.feedPostContentImage}
          />
        )}
      </div>

      <div className={styles.feedPostFooter}>
        <button onClick={() => console.log("Collect publication function")}>
          {publication.stats.totalAmountOfCollects} Collects
        </button>
        <button onClick={() => console.log("Comment publication function")}>
          {publication.stats.totalAmountOfComments} Comments
        </button>
        <button onClick={() => mirrorUser({profileId, publicationId})}>
          {publication.stats.totalAmountOfMirrors} Mirrors
        </button>
      </div>
    </div>
  );
}