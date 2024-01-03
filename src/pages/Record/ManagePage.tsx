import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ManageSchedule } from "../../type";
import { ApiRoutes, getApiRoute } from "../../type/routes";
import QueueCards from "../../components/Table/QueueCards";

const ManagePage: React.FC = () => {
    const { t } = useTranslation();
    const [schedule, setSchedule] = useState<ManageSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const url = getApiRoute(ApiRoutes.GET_DOWNLOAD_SCHEDULE);
            const response = await fetch(url, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSchedule(data || []);
            setIsLoading(false);
        };

        fetchData();
    }, []);
    return (
        <div className="p-4">
            <div className="mt-14 p-4">
                <h1 className="pb-5 text-3xl font-bold dark:text-stone-100">{t("Manage Schedule")}</h1>
            </div>
            {isLoading ? <div>{t("Loading")}</div> : <QueueCards items={schedule} />}
        </div>
    );
};

export default ManagePage;
