import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Channel } from "../type";

interface Video {
    _id?: string;
    id: string;
    filename: string;
    status: string;
    display_name: string;
    broadcaster_id: string;
    requested_by: string;
    start_download_at: Date;
    downloaded_at: string;
    job_id: string;
    game_id: string[];
    title: string[];
    tags: string[];
    viewer_count: number[];
    language: string;
}

const ChannelPage: React.FC = () => {
    const { t } = useTranslation();
    let { id } = useParams();

    const [channel, setChannel] = useState<Channel>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [buttonText, setButtonText] = useState<string>("Enregistrer");
    const [videos, setVideos] = useState<Video[]>([]);
    const ROOT_URL = import.meta.env.VITE_ROOTURL;

    const handleClick = () => {
        if (!isFetching) {
            setIsFetching(true);
            setButtonText("En cours");

            fetch(`${ROOT_URL}/api/dl/stream/${id}`, {
                credentials: "include",
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    setIsFetching(false);
                    setButtonText("est enregistrer");
                })
                .catch((error) => {
                    console.error("Error:", error);
                    setIsFetching(false);
                });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, videosResponse] = await Promise.all([
                    fetch(`${ROOT_URL}/api/users/${id}`, { credentials: "include" }),
                    fetch(`${ROOT_URL}/api/videos/user/${id}`, { credentials: "include" }),
                ]);

                const userData = await userResponse.json();
                const videosData = await videosResponse.json();

                console.log("User:", userData);
                console.log("Videos:", videosData);

                setChannel(userData);
                setVideos(videosData);
                setIsLoading(false);
            } catch (error) {
                console.error("Error:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div>{t("Loading")}</div>;
    }

    return (
        <div className="p-4 sm:ml-64">
            <div className="p-4 mt-14">
                <div className="flex p-3">
                    <h1 className="text-3xl font-bold pb-5 dark:text-stone-100">{channel?.broadcasterName}</h1>
                </div>
                <button
                    onClick={handleClick}
                    disabled={isFetching}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded inline-flex items-center">
                    <svg
                        className="fill-current w-4 h-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20">
                        <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                    </svg>
                    <span>{buttonText}</span>
                </button>
                <div>
                    <h2 className="text-lg font-bold mt-5">
                        {t("Videos from")} {channel?.broadcasterName}
                    </h2>
                    {videos.map((video) => (
                        <div key={video.id} className="flex mt-2">
                            <div>
                                <h3 className="text-base font-medium">{video.title}</h3>
                                <p className="text-sm text-gray-500">{video.display_name}</p>
                                <video controls className="w-full max-w-lg">
                                    <source src={`${ROOT_URL}/api/videos/play/${video._id}`} type="video/mp4" />
                                    {t("Your browser does not support the video tag.")}
                                </video>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChannelPage;