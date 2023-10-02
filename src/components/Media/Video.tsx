import { FC, useRef } from "react";
import { CompletedVideo } from "../../type";
import { Pathnames } from "../../type/routes";
import VideoInfoComponent from "./VideoInfo";
import { formatDate, formatDuration } from "../../utils/utils";

type VideoProps = {
    videos: CompletedVideo[] | undefined;
    disablePicture?: boolean;
};

const VideoComponent: FC<VideoProps> = ({ videos, disablePicture = false }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const hasOneOrTwoVideos = videos?.length === 1 || videos?.length === 2;

    return (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-5">
            {videos?.map((video) => (
                <div className="w-full " key={video.id} ref={divRef}>
                    <a href={`${Pathnames.Watch}${video.id}`} className="relative">
                        <img src={`${video.thumbnail}`} alt={`${video.displayName}`} />
                        <div className="absolute top-2 left-3 bg-black bg-opacity-50 text-stone-100">{`${formatDuration(
                            video.duration
                        )}`}</div>
                        <div className="absolute bottom-2 right-3 bg-black bg-opacity-50 text-stone-100">{`${formatDate(
                            video.downloadedAt,
                            "Europe/Paris",
                            false
                        )}`}</div>
                    </a>
                    <div className="flex justify-between">
                        <VideoInfoComponent video={video} disablePicture={disablePicture} />
                    </div>
                </div>
            ))}
            {hasOneOrTwoVideos && (
                <div className="w-full opacity-0">
                    <a href="#">
                        <img src="path-to-transparent-image.png" alt="dummy" />
                    </a>
                </div>
            )}
            {videos?.length === 1 && (
                <div className="w-full opacity-0">
                    <a href="#">
                        <img src="path-to-transparent-image.png" alt="dummy" />
                    </a>
                </div>
            )}
        </div>
    );
};

export default VideoComponent;
